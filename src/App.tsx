/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import WizardPage from './components/WizardPage';
import ResultsPage from './components/ResultsPage';
import HistoryDashboard from './components/HistoryDashboard';
import { FinancialData, Heir, CalculationResult } from './types';
import { calculateFaraid } from './utils/faraid';
import { translations } from './utils/translations';
import { auth, db, handleFirestoreError, OperationType } from './utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, deleteDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { History, LayoutGrid } from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'auth' | 'wizard' | 'results' | 'history'>('landing');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [activeResult, setActiveResult] = useState<CalculationResult | null>(null);
  const [savedReports, setSavedReports] = useState<CalculationResult[]>([]);
  const [lang, setLang] = useState<'id' | 'en'>('id');

  const t_strings = translations[lang];

  // Dynamic Firebase auth listener & Firestore reports sync
  useEffect(() => {
    // Check if lang was saved in localStorage
    const savedLang = localStorage.getItem('warisku_lang');
    if (savedLang === 'id' || savedLang === 'en') {
      setLang(savedLang);
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const uProfile = {
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
        };
        setCurrentUser(uProfile);
        localStorage.setItem('warisku_current_user', JSON.stringify(uProfile));
        localStorage.removeItem('warisku_simulated_user');

        // Realtime sync reports archive from Firestore subcollection ordered by creation date
        const reportsPath = `users/${firebaseUser.uid}/reports`;
        const q = query(
          collection(db, 'users', firebaseUser.uid, 'reports'),
          orderBy('createdAt', 'desc')
        );

        const unsubSnapshot = onSnapshot(q, (snapshot) => {
          const fetched: CalculationResult[] = [];
          snapshot.forEach((docSnap) => {
            fetched.push(docSnap.data() as CalculationResult);
          });
          setSavedReports(fetched);
          localStorage.setItem('warisku_saved_reports', JSON.stringify(fetched));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, reportsPath);
        });

        return () => {
          unsubSnapshot();
        };
      } else {
        // If there's a simulated offline user logged in, preserve it!
        const simulatedUserStr = localStorage.getItem('warisku_simulated_user');
        if (simulatedUserStr) {
          try {
            const simulatedUser = JSON.parse(simulatedUserStr);
            setCurrentUser(simulatedUser);
            // Load simulated user reports
            const storedSimulated = localStorage.getItem(`warisku_reports_simulated_${simulatedUser.email}`);
            if (storedSimulated) {
              setSavedReports(JSON.parse(storedSimulated));
            } else {
              setSavedReports([]);
            }
            return;
          } catch (e) {
            console.error('Error loading simulated user reports:', e);
          }
        }

        setCurrentUser(null);
        setSavedReports([]);
        localStorage.removeItem('warisku_current_user');
        
        // Load offline guest reports from local persistence
        const storedReports = localStorage.getItem('warisku_saved_reports_guest');
        if (storedReports) {
          setSavedReports(JSON.parse(storedReports));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLanguageToggle = () => {
    const nextLang = lang === 'id' ? 'en' : 'id';
    setLang(nextLang);
    localStorage.setItem('warisku_lang', nextLang);
  };

  const handleLoginSuccess = (user: { name: string; email: string }) => {
    setCurrentUser(user);
    
    // Load existing simulated reports for this specific email to prevent data loss on re-login
    const storedSimulated = localStorage.getItem(`warisku_reports_simulated_${user.email}`);
    if (storedSimulated) {
      setSavedReports(JSON.parse(storedSimulated));
    } else {
      setSavedReports([]);
    }
    
    setScreen('wizard'); // Auto transitioned to wizard after login
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('warisku_current_user');
      localStorage.removeItem('warisku_simulated_user');
      setCurrentUser(null);
      setSavedReports([]);
      setScreen('landing');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback
      localStorage.removeItem('warisku_current_user');
      localStorage.removeItem('warisku_simulated_user');
      setCurrentUser(null);
      setSavedReports([]);
      setScreen('landing');
    }
  };

  const executeCalculation = (name: string, financials: FinancialData, heirs: Heir[]) => {
    const calculated = calculateFaraid(
      currentUser ? (auth.currentUser?.uid || currentUser.email) : 'guest-session',
      name,
      financials,
      heirs
    );
    setActiveResult(calculated);
    setScreen('results');
  };

  const handleSaveReport = async (report: CalculationResult) => {
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/reports/${report.id_hasil}`;
      try {
        const reportRef = doc(db, 'users', auth.currentUser.uid, 'reports', report.id_hasil);
        const enrichedReport = {
          ...report,
          userId: auth.currentUser.uid,
          createdAt: new Date().toISOString()
        };
        await setDoc(reportRef, enrichedReport);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else if (currentUser) {
      // Offline simulated user reports
      const enrichedReport = {
        ...report,
        userId: currentUser.email,
        createdAt: new Date().toISOString()
      };
      const updated = [enrichedReport, ...savedReports];
      setSavedReports(updated);
      localStorage.setItem(`warisku_reports_simulated_${currentUser.email}`, JSON.stringify(updated));
    } else {
      // Offline guest reports
      const updated = [report, ...savedReports];
      setSavedReports(updated);
      localStorage.setItem('warisku_saved_reports_guest', JSON.stringify(updated));
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/reports/${id}`;
      try {
        const reportRef = doc(db, 'users', auth.currentUser.uid, 'reports', id);
        await deleteDoc(reportRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else if (currentUser) {
      // Simulated user report deletion
      const updated = savedReports.filter((r) => r.id_hasil !== id);
      setSavedReports(updated);
      localStorage.setItem(`warisku_reports_simulated_${currentUser.email}`, JSON.stringify(updated));
    } else {
      const updated = savedReports.filter((r) => r.id_hasil !== id);
      setSavedReports(updated);
      localStorage.setItem('warisku_saved_reports_guest', JSON.stringify(updated));
    }
  };

  const handleSelectHistoryReport = (report: CalculationResult) => {
    setActiveResult(report);
    setScreen('results');
  };

  return (
    <div className="min-h-screen flex flex-col relative select-none">
      
      {/* Dynamic Main view switcher */}
      <div className="flex-grow">
        {screen === 'landing' && (
          <LandingPage
            onStartClicked={() => setScreen('wizard')}
            onLoginClicked={() => setScreen('auth')}
            currentUser={currentUser}
            onLogout={handleLogout}
            lang={lang}
            onToggleLanguage={handleLanguageToggle}
          />
        )}

        {screen === 'auth' && (
          <AuthPage
            onBackClicked={() => setScreen('landing')}
            onLoginSuccess={handleLoginSuccess}
            lang={lang}
            onToggleLanguage={handleLanguageToggle}
          />
        )}

        {screen === 'wizard' && (
          <WizardPage
            onBack={() => setScreen('landing')}
            onCalculate={executeCalculation}
            lang={lang}
            onToggleLanguage={handleLanguageToggle}
            currentUser={currentUser}
            onLoginClicked={() => setScreen('auth')}
            onLogout={handleLogout}
          />
        )}

        {screen === 'results' && activeResult && (
          <ResultsPage
            result={activeResult}
            onReset={() => setScreen('wizard')}
            onSaveReport={handleSaveReport}
            isLoggedIn={!!currentUser}
            lang={lang}
            onToggleLanguage={handleLanguageToggle}
          />
        )}

        {screen === 'history' && (
          <HistoryDashboard
            reports={savedReports}
            onSelectReport={handleSelectHistoryReport}
            onDeleteReport={handleDeleteReport}
            onBackToHome={() => setScreen('landing')}
            lang={lang}
            onToggleLanguage={handleLanguageToggle}
          />
        )}
      </div>

      {/* Persistent floating dashboard button for logged-in users / access past reports */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5 print:hidden">
        {currentUser && screen !== 'history' && (
          <button
            onClick={() => setScreen('history')}
            className="bg-[#775a19] text-white p-3.5 rounded-full shadow-2xl hover:bg-[#5d4201] transition-all cursor-pointer flex items-center gap-2 font-bold text-xs"
          >
            <History className="w-5 h-5 text-[#ffdea5] animate-spin" style={{ animationDuration: '4s' }} />
            <span>
              {lang === 'id' ? `Riwayat Akun (${savedReports.length})` : `History (${savedReports.length})`}
            </span>
          </button>
        )}

        {screen !== 'landing' && (
          <button
            onClick={() => setScreen('landing')}
            className="bg-[#006565] text-white p-3.5 rounded-full shadow-2xl hover:bg-[#008080] transition-all cursor-pointer flex items-center justify-center font-bold"
            title={lang === 'id' ? 'Beranda Utama' : 'Main Dashboard'}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
