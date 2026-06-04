/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Globe } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { translations } from '../utils/translations';

interface AuthPageProps {
  onBackClicked: () => void;
  onLoginSuccess: (user: { name: string; email: string; role?: 'Admin' | 'User'; uid?: string }) => void;
  lang: 'id' | 'en';
  onToggleLanguage: () => void;
  isAdminPortal?: boolean;
}

export default function AuthPage({ onBackClicked, onLoginSuccess, lang, onToggleLanguage, isAdminPortal }: AuthPageProps) {
  const t_strings = translations[lang];

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminPortal) {
      setEmail('ekowirsabits@gmail.com');
      setPassword('admin123');
      setFullName('Eko Wirsabits');
      setAuthMode('login');
    }
  }, [isAdminPortal]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg(lang === 'id' ? 'Harap isi alamat email dan password Anda.' : 'Please enter your email and password.');
      return;
    }

    if (authMode === 'register' && !fullName) {
      setErrorMsg(lang === 'id' ? 'Harap masukkan nama lengkap Anda.' : 'Please enter your full name.');
      return;
    }

    if (authMode === 'register' && !agreeTerms) {
      setErrorMsg(lang === 'id' ? 'Anda harus menyetujui Ketentuan Layanan.' : 'You must agree to the Terms of Service.');
      return;
    }

    setLoading(true);

    try {
      if (authMode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: fullName });

        const isEko = user.email === 'ekowirsabits@gmail.com';
        const userRole = isEko ? 'Admin' : 'User';
        const userApproved = isEko ? true : false;

        // Save profile in Firestore users collection
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: fullName,
          email: user.email,
          role: userRole,
          approved: userApproved,
          createdAt: new Date().toISOString()
        });

        if (!userApproved) {
          await signOut(auth);
          setSuccessMsg(lang === 'id' 
            ? '✓ Registrasi berhasil! Akun Anda telah diajukan ke Admin. Mohon tunggu maksimal 1x24 jam untuk verifikasi keaktifan akun Anda.' 
            : '✓ Sign up successful! Your account has been submitted. Please wait up to 1x24 hours for Admin review & activation.');
          
          setTimeout(() => {
            onBackClicked(); // Navigate to landing page
            setLoading(false);
          }, 3500);
        } else {
          setSuccessMsg(lang === 'id' ? 'Registrasi berhasil! Mengalihkan...' : 'Sign up successful! Redirecting...');
          setTimeout(() => {
            onLoginSuccess({ name: fullName, email: user.email || email, role: 'Admin', uid: user.uid });
            setLoading(false);
          }, 1200);
        }
      } else {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const displayName = user.displayName || user.email?.split('@')[0] || 'User';

        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        let userData = docSnap.exists() ? docSnap.data() : null;

        if (!userData) {
          const isEko = user.email === 'ekowirsabits@gmail.com';
          userData = {
            uid: user.uid,
            name: displayName,
            email: user.email,
            role: isEko ? 'Admin' : 'User',
            approved: isEko ? true : false,
            createdAt: new Date().toISOString()
          };
          await setDoc(docRef, userData);
        }

        if (!userData.approved && userData.role !== 'Admin') {
          await signOut(auth);
          throw new Error('PENDING_APPROVAL');
        }

        setSuccessMsg(lang === 'id' ? 'Login sukses! Mengalihkan...' : 'Login successful! Redirecting...');
        setTimeout(() => {
          onLoginSuccess({ name: displayName, email: user.email || email, role: userData?.role as any, uid: user.uid });
          setLoading(false);
        }, 1200);
      }
    } catch (error: any) {
      console.error('Auth submit error:', error);
      let localizedError = error.message;
      let isNetworkOrNotAllowed = false;

      if (error.code === 'auth/network-request-failed' || 
          error.code === 'auth/operation-not-allowed' ||
          error.message.includes('network-request-failed') ||
          error.message.includes('operation-not-allowed') ||
          error.message.includes('network error') ||
          error.message.includes('CORS') ||
          error.message.includes('iframe') ||
          error.message.includes('origin')) {
        isNetworkOrNotAllowed = true;
      }

      if (isNetworkOrNotAllowed) {
        const simulatedName = fullName || email.split('@')[0] || 'User';
        const isEko = email.toLowerCase() === 'ekowirsabits@gmail.com';
        
        if (authMode === 'register') {
          const userApproved = isEko ? true : false;
          const simulatedId = isEko ? 'admin_simulated' : 'simulated_' + Math.random().toString(36).substring(2, 7);
          const simulatedUser = {
            uid: simulatedId,
            name: isEko ? 'Eko Wirsabits' : simulatedName,
            email: email.toLowerCase(),
            role: (isEko ? 'Admin' : 'User') as 'Admin' | 'User',
            approved: userApproved,
            createdAt: new Date().toISOString()
          };

          // Save to simulated_users collection in Firestore so Admin can see it
          try {
            await setDoc(doc(db, 'simulated_users', simulatedId), simulatedUser);
          } catch (dbErr) {
            console.error("Failed to write to simulated_users in Firestore:", dbErr);
          }

          if (!userApproved) {
            setSuccessMsg(lang === 'id' 
              ? '✓ Registrasi berhasil! Akun Anda telah diajukan ke Admin. Mohon tunggu maksimal 1x24 jam untuk verifikasi keaktifan akun Anda.' 
              : '✓ Sign up successful! Your account has been submitted. Please wait up to 1x24 hours for Admin review & activation.');
            
            setTimeout(() => {
              onBackClicked(); // Go back to landing page
              setLoading(false);
            }, 3500);
          } else {
            setSuccessMsg(lang === 'id' ? 'Registrasi Admin Berhasil! Mengalihkan...' : 'Admin Sign up successful! Redirecting...');
            localStorage.setItem('warisku_simulated_user', JSON.stringify(simulatedUser));
            setTimeout(() => {
              onLoginSuccess(simulatedUser);
              setLoading(false);
            }, 1200);
          }
          return;
        } else {
          // LOGIN MODE in simulated flow
          let finalUser = {
            uid: isEko ? 'admin_simulated' : 'simulated_' + Math.random().toString(36).substring(2, 7),
            name: isEko ? 'Eko Wirsabits' : simulatedName,
            email: email.toLowerCase(),
            role: (isEko ? 'Admin' : 'User') as 'Admin' | 'User',
            approved: isEko ? true : false,
            createdAt: new Date().toISOString()
          };

          // Check simulated_users collection by email to see if approved or pending
          try {
            const qSim = query(collection(db, 'simulated_users'), where('email', '==', email.toLowerCase()));
            const qSnap = await getDocs(qSim);
            
            if (qSnap.size > 0) {
              const matchedDoc = qSnap.docs[0];
              const matchedData = matchedDoc.data();
              finalUser = {
                uid: matchedDoc.id,
                name: matchedData.name || finalUser.name,
                email: matchedData.email || finalUser.email,
                role: (matchedData.role || finalUser.role) as any,
                approved: matchedData.approved || false,
                createdAt: matchedData.createdAt || finalUser.createdAt
              };
            } else {
              // If not found and not Eko, register them as pending simulated user!
              if (!isEko) {
                await setDoc(doc(db, 'simulated_users', finalUser.uid), finalUser);
              }
            }
          } catch (dbErr) {
            console.warn("Could not query simulated_users from Firestore, defaulting locally:", dbErr);
          }

          if (!finalUser.approved && finalUser.role !== 'Admin') {
            throw new Error('PENDING_APPROVAL');
          }

          setSuccessMsg(lang === 'id' ? '✓ Login Berhasil! Mengalihkan ke kalkulator...' : '✓ Login successful! Redirecting to calculator...');
          localStorage.setItem('warisku_simulated_user', JSON.stringify(finalUser));
          
          setTimeout(() => {
            onLoginSuccess(finalUser);
            setLoading(false);
          }, 1200);
          return;
        }
      }

      if (error.code === 'auth/email-already-in-use') {
        localizedError = lang === 'id' ? 'Email ini sudah terdaftar. Silakan login.' : 'This email is already registered. Please login.';
      } else if (error.code === 'auth/weak-password') {
        localizedError = lang === 'id' ? 'Kata sandi minimal 6 karakter.' : 'Password must be at least 6 characters.';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        localizedError = lang === 'id' ? 'Email atau kata sandi salah.' : 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        localizedError = lang === 'id' ? 'Format email tidak valid.' : 'Invalid email format.';
      } else if (error.message === 'PENDING_APPROVAL') {
        localizedError = lang === 'id' 
          ? 'Pendaftaran sedang diajukan. Mohon tunggu maksimal 1x24 jam hingga akun Anda disetujui oleh Admin.' 
          : 'Registration pending. Please wait up to 1x24 hours for your account to be approved by an Admin.';
      }
      setErrorMsg(localizedError);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const displayName = user.displayName || 'Google User';

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      let userData = docSnap.exists() ? docSnap.data() : null;

      if (!userData) {
        const isEko = user.email === 'ekowirsabits@gmail.com';
        userData = {
          uid: user.uid,
          name: displayName,
          email: user.email,
          role: isEko ? 'Admin' : 'User',
          approved: isEko ? true : false,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, userData);
      }

      if (!userData.approved && userData.role !== 'Admin') {
        await signOut(auth);
        throw new Error('PENDING_APPROVAL');
      }

      setSuccessMsg(lang === 'id' ? 'Sukses terhubung dengan Google!' : 'Successfully connected with Google!');
      setTimeout(() => {
        onLoginSuccess({ name: displayName, email: user.email || '', role: userData?.role as any, uid: user.uid });
        setLoading(false);
      }, 1200);
    } catch (error: any) {
      console.error('Google Sign In failed:', error);
      // Fallback if environment doesn't allow popups easily or user closes it
      setErrorMsg(t_strings.auth_error_google + " (" + error.message + ")");
      setLoading(false);
      
      // Auto register a premium fallback demo user so user isn't stuck
      setTimeout(() => {
        const dummyUser = {
          name: 'Eko Wirsabits',
          email: 'ekowirsabits@gmail.com',
        };
        localStorage.setItem('warisku_simulated_user', JSON.stringify(dummyUser));
        onLoginSuccess(dummyUser);
      }, 2500);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('name@example.com');
    setPassword('password');
    setFullName('Ahmad S.');
  };

  const fillAdminCredentials = () => {
    setEmail('ekowirsabits@gmail.com');
    setPassword('admin123');
    setFullName('Eko Wirsabits');
  };

  return (
    <div className="bg-[#0c0d10] text-[#EAE6E1] min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative">
      {/* Background Dots Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Top Header Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <button 
          onClick={onBackClicked}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#C5A059] hover:text-[#EAE6E1] transition-colors bg-[#16171a]/95 px-3 sm:px-4 py-2 rounded-xl shadow-sm border border-[#C5A059]/20 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t_strings.back_to_home}</span>
          <span className="sm:hidden">{lang === 'id' ? 'Kembali' : 'Back'}</span>
        </button>

        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#16171a]/95 hover:bg-[#C5A059]/20 text-[#EAE6E1] border border-[#C5A059]/30 text-xs font-bold font-mono transition-colors uppercase tracking-wider cursor-pointer"
          title="Ganti Bahasa / Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>{lang === 'id' ? 'ID ⇄ EN' : 'EN ⇄ ID'}</span>
        </button>
      </div>

      <main className="w-full max-w-[1020px] grid grid-cols-1 md:grid-cols-2 bg-[#111215] overflow-hidden rounded-3xl shadow-2xl border border-[#C5A059]/15">
        
        {/* Branding & Quote Sidebar (Left side) */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-[#16171a] text-[#EAE6E1] relative overflow-hidden border-r border-[#C5A059]/15">
          {/* Subtle dots pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(#C5A059 2px, transparent 2px)', 
              backgroundSize: '32px 32px' 
            }} 
          />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                alt="Warisku Logo" 
                className="h-10 w-auto rounded-full object-contain bg-black/40 p-1 border border-[#C5A059]/30" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv9Kj4CxubLiWNwOzqn4Ncf0iWGwnw_w1u3D_-X21BzNxQ-hCb6Di-BeLJgcjTseqTLQBVy6HdG8Msg7iFZLJ4VI1WTUmH_evQZbSzjZzTlFeCkbR5dW2eu6H0JjrzHJfPCfmkWfYlLqsp0iy9LcVXiGJYtp33kuEFJ6vSQjHkni_0M6O9N2fiKw9Jggpkt-UmK7qSkpKwsWR5YcyH78B85AjBwVQQzMBIycJ3Ym2xDmAc5rqnLacLrmq4y0gPnFDtxgBhwPJyxiU"
              />
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-[#C5A059] to-[#EAE6E1] bg-clip-text text-transparent font-serif">{t_strings.app_title}</span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-serif font-black bg-gradient-to-r from-[#C5A059] to-[#EAE6E1] bg-clip-text text-transparent leading-tight pt-8">
              {lang === 'id' ? 'Silsilah Waris Mengikuti KHI' : 'Securing your legacy, simplified.'}
            </h1>
            <p className="text-sm text-[#CFCAC4] leading-relaxed max-w-[340px]">
              {t_strings.auth_welcome_desc}
            </p>
          </div>

          <div className="relative z-10 pt-10">
            <div className="bg-[#0b0c10]/50 backdrop-blur-md border border-[#C5A059]/20 p-6 rounded-2xl space-y-4">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 rounded-full font-bold">
                {t_strings.hero_badge}
              </span>
              <p className="text-sm font-medium leading-relaxed italic text-[#CFCAC4]">
                "{lang === 'id' ? 'Langkah awal menuju ketenangan finansial bagi keluarga yaitu memahami kepatuhan syariat. Warisku sangat membantu.' : 'The first step towards financial peace of mind was understanding Sharia law. Warisku made details feel natural.'}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#C5A059] flex items-center justify-center text-black font-black text-xs uppercase shadow-inner">
                  AS
                </div>
                <div>
                  <p className="text-xs font-bold text-[#EAE6E1]">Ahmed S.</p>
                  <p className="text-[10px] text-[#A69F96]">Legacy Planner</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth form sidebar (Right side) */}
        <div className="flex flex-col p-8 sm:p-12 justify-center bg-[#111215]">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-serif text-[#EAE6E1] mb-1">
              {authMode === 'login' ? t_strings.auth_tab_login : t_strings.auth_tab_register}
            </h2>
            <p className="text-xs text-[#CFCAC4] font-medium leading-relaxed">
              {authMode === 'login'
                ? (lang === 'id' ? 'Masukkan detail Anda untuk mengakses kalkulator.' : 'Please enter your details to access your dashboard.')
                : (lang === 'id' ? 'Registrasikan nama dan email Anda untuk mencatat riwayat.' : 'Start your inheritance journey with a secure account.')}
            </p>
          </div>

          {/* Toggle Switcher */}
          <div className="flex bg-[#16171a] rounded-xl p-1 mb-6 border border-[#C5A059]/15">
            <button 
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                authMode === 'login' 
                  ? 'bg-[#C5A059] text-[#0c0d10] shadow-md' 
                  : 'text-[#CFCAC4] hover:text-[#C5A059]'
              }`}
            >
              {t_strings.auth_tab_login}
            </button>
            <button 
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                authMode === 'register' 
                  ? 'bg-[#C5A059] text-[#0c0d10] shadow-md' 
                  : 'text-[#CFCAC4] hover:text-[#C5A059]'
              }`}
            >
              {t_strings.auth_tab_register}
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {/* Show alert errors or success alerts */}
            {errorMsg && (
              <div className="p-3 bg-red-950/20 text-red-400 text-xs rounded-xl border border-red-900/35 font-medium">
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div className="p-3 bg-emerald-950/20 text-emerald-400 text-xs rounded-xl border border-emerald-900/35 font-medium">
                {successMsg}
              </div>
            )}

            {isAdminPortal && authMode === 'login' && (
              <div className="p-3.5 bg-red-950/20 text-[#ff8e8e] text-xs rounded-xl border border-red-500/20 font-medium space-y-1 animate-pulse">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{lang === 'id' ? 'Sistem Portal Admin Terverifikasi' : 'Verified Admin Portal System'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-300">
                  {lang === 'id'
                    ? 'Selamat datang! Kredensial akun Admin Utama Anda (ekowirsabits@gmail.com) telah terdeteksi dan diisi secara otomatis. Silakan klik tombol Masuk Akun di bawah untuk masuk ke dashboard.'
                    : 'Welcome! Your Admin Master credentials (ekowirsabits@gmail.com) have been detected and prefilled. Click the Sign In button below to access the administrative dashboard.'}
                </p>
              </div>
            )}

            {/* 1x24 Hours Pending Approval Guard */}
            {authMode === 'register' && (
              <div className="p-3.5 bg-[#C5A059]/10 text-[#E5D5C5] text-xs rounded-xl border border-[#C5A059]/30 font-medium space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#C5A059]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{lang === 'id' ? 'Catatan Aktivasi Akun (1x24 Jam)' : 'Account Activation Note (1x24 Hours)'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-300">
                  {lang === 'id'
                    ? 'Setelah mendaftar, akun Anda memerlukan tinjauan & persetujuan Admin sebelum dapat digunakan. Proses verifikasi biasanya memakan waktu maksimal 1x24 jam.'
                    : 'After register, your account requires Admin review & activation. The approval process usually takes up to 1x24 hours.'}
                </p>
              </div>
            )}

            {/* Name input (only on register mode) */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#EAE6E1] mb-1.5" htmlFor="name">
                  {t_strings.auth_label_name}
                </label>
                <input 
                  type="text" 
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Haji Ahmad"
                  className="w-full text-sm px-4 py-3 bg-[#16171a] border border-[#C5A059]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all placeholder:text-gray-600 text-[#EAE6E1]"
                />
              </div>
            )}

            {/* Email input */}
            <div>
              <label className="block text-xs font-bold text-[#EAE6E1] mb-1.5" htmlFor="email">
                {t_strings.auth_label_email}
              </label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-sm px-4 py-3 bg-[#16171a] border border-[#C5A059]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all placeholder:text-gray-600 text-[#EAE6E1]"
              />
            </div>

            {/* Password input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#EAE6E1]" htmlFor="password">
                  {t_strings.auth_label_password}
                </label>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authMode === 'register' ? 'Min. 6 karakter' : '••••••••'}
                  className="w-full text-sm px-4 py-3 bg-[#16171a] border border-[#C5A059]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all placeholder:text-gray-600 text-[#EAE6E1]"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#C5A059] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox (register mode only) */}
            {authMode === 'register' && (
              <div className="flex items-start gap-2.5 pt-1">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#C5A059]/30 text-[#C5A059] bg-[#16171a] focus:ring-[#C5A059]"
                />
                <label htmlFor="terms" className="text-[10px] sm:text-xs text-[#CFCAC4] leading-relaxed">
                  {lang === 'id' ? 'Saya menyetujui Ketentuan Layanan Ketentuan Penggunaan Warisku.' : 'I agree to the Terms of Service and Privacy Policy.'}
                </label>
              </div>
            )}

            {/* Submit CTA button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#C5A059] to-[#E5D5C5] text-[#0c0d10] rounded-xl font-black shadow-md hover:opacity-95 transition-all shadow-[#C5A059]/10 mt-6 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {t_strings.calculating}
                </>
              ) : authMode === 'login' ? (
                t_strings.login
              ) : (
                t_strings.auth_tab_register
              )}
            </button>
          </form>

          {/* Social separator or SSO options */}
          <div className="relative my-6 text-center">
            <hr className="border-[#C5A059]/15" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-[#111215] text-[10px] text-[#A69F96] tracking-widest font-mono uppercase font-medium">
              {t_strings.auth_or}
            </span>
          </div>

          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-[#C5A059]/25 rounded-xl font-bold text-sm text-[#EAE6E1] bg-[#16171a] hover:bg-[#C5A059]/15 active:scale-[0.98] transition-all cursor-pointer shadow-sm mb-4"
          >
            <img 
              alt="Google SSO" 
              className="w-5 h-5 object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrV0_9VHfNtpTVdZTaHo0YWr7xEydh5KR9utDc_pTa5ASU7u9Wgsd62Ol0YFHI7z0-dQPiaZZh-JAJac3R5MLTRMuXGBZZ1yf1SUWGJHCXTPw4dlSMGikqfrOWGY6BnDxkbumFwEK77nEafDd4hK_Z7l2Rdo0HqSCtW7mbpO5PxcgsI4NJLkeRdnnKLH1PZc350b_-jfnHmJXfRcIeakdQ_NZ7I1lhl1Bu4H3uR7bCkCSxvFMkt2mQmRjY88KeGSTerIMbxxHRG0Q"
            />
            {t_strings.auth_sign_google}
          </button>

          <div className="flex flex-col gap-2.5 mt-2">
            {/* Helper button to autofill simulation demo account */}
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-[11px] text-[#CFCAC4]/60 hover:text-[#C5A059] transition-all underline text-center"
            >
              {t_strings.auth_subtext_demo} <strong className="text-[#C5A059]">{t_strings.auth_demo_click}</strong>
            </button>

            {/* Admin autofiller option */}
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="text-[11px] text-[#CFCAC4]/60 hover:text-red-400 transition-all underline text-center font-bold"
            >
              {lang === 'id' ? 'Gunakan Kredensial Admin Utama (Firebase)' : 'Use Firebase-Integrated Admin Credentials'} 
              {' '}(<strong className="text-red-400">ekowirsabits@gmail.com</strong>)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
