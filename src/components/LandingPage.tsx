import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight, Scale, Zap, Lock, CircleDollarSign, Globe, BookOpen, MessageSquare, Phone } from 'lucide-react';
import { translations } from '../utils/translations';
import { db } from '../utils/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Ustadz } from '../types';

interface LandingPageProps {
  onStartClicked: () => void;
  onLoginClicked: (isAdmin?: boolean) => void;
  currentUser: { name: string; email: string; role?: 'Admin' | 'User'; uid?: string } | null;
  onLogout: () => void;
  lang: 'id' | 'en';
  onToggleLanguage: () => void;
  onAdminClicked?: () => void;
}

export default function LandingPage({
  onStartClicked,
  onLoginClicked,
  currentUser,
  onLogout,
  lang,
  onToggleLanguage,
  onAdminClicked,
}: LandingPageProps) {
  const t_strings = translations[lang];

  const [scholars, setScholars] = useState<Ustadz[]>([]);
  const [selectedUstadz, setSelectedUstadz] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [scholarsLoading, setScholarsLoading] = useState<boolean>(true);

  // Fallback defaults if firestore has no scholars
  const DEFAULT_SCHOLARS: Ustadz[] = [
    { id: 'default_1', name: 'Ustadz H. Ahmad Fauzi, Lc., M.Ag.', phone: '628123456789' },
    { id: 'default_2', name: 'Ustadz Dr. Muhammad Anas, MA.', phone: '628112233445' },
    { id: 'default_3', name: 'Ustadz Farid Wijaya, S.Sy.', phone: '628567890123' }
  ];

  useEffect(() => {
    setScholarsLoading(true);
    const q = query(collection(db, 'ustadz'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Ustadz[] = [];
      snapshot.forEach((snap) => {
        const data = snap.data();
        fetched.push({
          id: snap.id,
          name: data.name || '',
          phone: data.phone || '',
          createdAt: data.createdAt || ''
        });
      });
      setScholars(fetched);
      setScholarsLoading(false);
      if (fetched.length > 0) {
        setSelectedUstadz(fetched[0].id);
      }
    }, (error) => {
      console.error("Error subscribing to scholars in LandingPage:", error);
      setScholarsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const activeScholars = scholars.length > 0 ? scholars : DEFAULT_SCHOLARS;

  useEffect(() => {
    if (activeScholars.length > 0 && !selectedUstadz) {
      setSelectedUstadz(activeScholars[0].id);
    }
  }, [activeScholars]);

  const handleConsultWhatsApp = () => {
    const currentScholar = activeScholars.find(u => u.id === selectedUstadz) || activeScholars[0];
    if (!currentScholar) return;

    const prefix = lang === 'id' ? 'Assalamualaikum Wr. Wb. Ustadz' : 'Assalamualaikum, Scholar';
    const bodyText = `${prefix} ${currentScholar.name},\n\n` +
      (lang === 'id' 
        ? `Saya ingin melakukan konsultasi syariah terkait perhitungan pembagian waris Islami (Faraid) menggunakan kalkulator Warisku.\n\n`
        : `I would like to consult regarding Sharia inheritance calculation via Warisku.\n\n`) +
      (question.trim() ? `*Pertanyaan Saya:*\n"${question.trim()}"\n\n` : '') +
      (lang === 'id'
        ? `Mohon bimbingan dan waktu luangnya untuk mendiskusikan hal ini. Terima kasih.`
        : `Thank you for your time and guidance.`);

    const encodedText = encodeURIComponent(bodyText);
    const whatsappUrl = `https://wa.me/${currentScholar.phone}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-[#0c0d10] text-[#EAE6E1] min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Dots Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header Sticky Navbar */}
      <header className="bg-[#0c0d10]/95 backdrop-blur-md sticky top-0 z-50 border-b border-[#C5A059]/15">
        <nav className="flex justify-between items-center h-20 px-4 sm:px-6 md:px-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none shrink-0" onClick={onStartClicked}>
            <img 
              alt="Warisku Logo" 
              className="h-9 sm:h-10 w-auto rounded-full object-contain bg-black/40 p-1 shadow-md border border-[#C5A059]/30 font-semibold" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv9Kj4CxubLiWNwOzqn4Ncf0iWGwnw_w1u3D_-X21BzNxQ-hCb6Di-BeLJgcjTseqTLQBVy6HdG8Msg7iFZLJ4VI1WTUmH_evQZbSzjZzTlFeCkbR5dW2eu6H0JjrzHJfPCfmkWfYlLqsp0iy9LcVXiGJYtp33kuEFJ6vSQjHkni_0M6O9N2fiKw9Jggpkt-UmK7qSkpKwsWR5YcyH78B85AjBwVQQzMBIycJ3Ym2xDmAc5rqnLacLrmq4y0gPnFDtxgBhwPJyxiU"
            />
            <span className="hidden sm:inline font-semibold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-[#C5A059] to-[#EAE6E1] bg-clip-text text-transparent font-serif">{t_strings.app_title}</span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium">
            <span 
              onClick={onStartClicked}
              className="text-[#C5A059] border-b-2 border-[#C5A059] py-1 transition-all cursor-pointer font-semibold"
            >
              {t_strings.calculator}
            </span>
            <a href="#mengapa" className="text-[#CFCAC4] hover:text-[#C5A059] transition-colors">{t_strings.why_us}</a>
            <a href="#cara-kerja" className="text-[#CFCAC4] hover:text-[#C5A059] transition-colors">{t_strings.methodology}</a>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-full bg-[#16171a]/90 hover:bg-[#C5A059]/20 text-[#EAE6E1] border border-[#C5A059]/30 text-[10px] sm:text-xs font-bold font-mono transition-colors uppercase tracking-wider cursor-pointer"
              title="Ganti Bahasa / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
              <span className="hidden min-[400px]:inline">{lang === 'id' ? 'ID ⇄ EN' : 'EN ⇄ ID'}</span>
              <span className="min-[400px]:hidden">{lang === 'id' ? 'ID' : 'EN'}</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                {currentUser.role === 'Admin' && onAdminClicked && (
                  <button 
                    onClick={onAdminClicked}
                    className="text-[10px] sm:text-xs bg-[#9c1f1f] text-white px-2 py-1.5 rounded-lg border border-[#ff9e9e]/30 hover:bg-[#b02323] transition-all font-bold flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#ffbebe]" />
                    <span>Admin</span>
                  </button>
                )}
                <div className="hidden sm:block md:block text-right mr-1">
                  <p className="text-xs sm:text-sm font-semibold text-[#EAE6E1] align-middle">{currentUser.name}</p>
                  <p className="text-[9px] text-[#A69F96]">{currentUser.email}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="text-[10px] sm:text-xs bg-[#16171a] text-[#CFCAC4] px-2 py-1.5 rounded-lg border border-[#C5A059]/20 hover:bg-red-950/20 hover:text-red-400 transition-all font-medium cursor-pointer"
                >
                  {t_strings.logout}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2.5">
                <button 
                  onClick={() => onLoginClicked(true)}
                  className="bg-[#9c1f1f]/20 hover:bg-[#9c1f1f]/35 text-red-400 hover:text-red-300 font-bold border border-[#ff9e9e]/15 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs min-h-[32px] sm:min-h-[36px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-inner"
                  title="Akses Portal Admin"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="hidden min-[480px]:inline">Portal Admin</span>
                  <span className="min-[480px]:hidden">Admin</span>
                </button>
                <button 
                  onClick={() => onLoginClicked(false)}
                  className="font-semibold text-[#C5A059] hover:text-[#EAE6E1] text-xs sm:text-sm transition-colors cursor-pointer mr-1 px-1 py-1.5"
                >
                  {t_strings.login}
                </button>
              </div>
            )}
            <button 
              onClick={onStartClicked}
              className="hidden lg:block bg-gradient-to-r from-[#C5A059] to-[#E5D5C5] text-[#0c0d10] px-4 sm:px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-[#C5A059]/20 transition-all cursor-pointer shrink-0 text-xs sm:text-sm"
            >
              {t_strings.get_started}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-10 md:pt-16 pb-20 overflow-hidden max-w-7xl mx-auto px-6 md:px-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-8 z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 text-[#C5A059] font-mono text-xs font-semibold border border-[#C5A059]/30">
              <ShieldCheck className="w-4 h-4" />
              {t_strings.hero_badge}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#EAE6E1] leading-tight font-serif">
              {t_strings.hero_title_1}<br />
              <span className="bg-gradient-to-r from-[#C5A059] to-[#F0E6D2] bg-clip-text text-transparent">{t_strings.hero_title_2}</span>
            </h1>

            <p className="text-lg text-[#CFCAC4] max-w-[500px] leading-relaxed">
              {t_strings.hero_desc}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onStartClicked}
                className="bg-gradient-to-r from-[#C5A059] to-[#E5D5C5] text-[#0c0d10] px-8 py-4 rounded-xl font-black shadow-lg shadow-[#C5A059]/10 hover:shadow-[#C5A059]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
              >
                {t_strings.btn_start}
                <ArrowRight className="w-5 h-5 animate-pulse" />
              </button>
              <a 
                href="#cara-kerja"
                className="border-2 border-[#C5A059]/30 text-[#EAE6E1] px-8 py-4 rounded-xl font-semibold hover:bg-[#C5A059]/10 active:scale-[0.98] transition-all text-center flex items-center justify-center text-sm"
              >
                {t_strings.btn_learn_flow}
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-6 relative mt-6 lg:mt-0"
          >
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#C5A059]/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#8F713B]/10 rounded-full blur-3xl opacity-50" />
            
            <div className="relative bg-[#16171a]/80 backdrop-blur-md rounded-3xl p-4 overflow-hidden shadow-2xl border border-[#C5A059]/15">
              <img 
                className="w-full h-auto rounded-2xl object-cover aspect-[4/3] shadow-md filter brightness-[0.8]" 
                alt="Muslim family plotting inheritance on tablet screen"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkEoZQ7dOP2vrI36_6Nob7crmElonae9uL0tt6eyYC--szvY-3xZzxk-WBjaRk_misnMub9oGlh8OVuOHQECvKZaUQmWYPpuRa5cOA5ed9Fp_Ck1YQU3dhvvB78xZOIInon8bml3T09sIsv-lTQu0n-8h-GSAediJd9v9XRhGgie9woTBzWgVsrI61Mcbt1u8YhRq3-fDLuq4N73t6RlaRebw0noD7d9zo6QQP-oVcD2LqBWbQ7wfwjJnD8d8IkPnOwFlIqkgh4dU" 
              />
              
              {/* Floating micro indicators card */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute bottom-8 left-8 bg-[#1a1b20]/95 backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-xl border-l-4 border-[#C5A059] flex items-center gap-3 border border-[#C5A059]/20"
              >
                <div className="bg-[#C5A059]/20 p-2.5 rounded-full text-[#C5A059]">
                  <CircleDollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#A69F96] font-medium">{lang === 'id' ? 'Total Warisan' : 'Total Estate Value'}</p>
                  <p className="text-sm font-bold text-[#EAE6E1]">{lang === 'id' ? '100% Akurat' : '100% Perfect Accuracy'}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Us Bento Grid section */}
      <section id="mengapa" className="py-20 bg-[#111215]/60 border-y border-[#C5A059]/10">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-serif text-[#EAE6E1] font-bold">{t_strings.why_title}</h2>
            <p className="text-[#CFCAC4] max-w-2xl mx-auto text-sm md:text-base">
              {t_strings.why_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bento block 1 */}
            <div className="bg-[#16171a] p-8 rounded-3xl border border-[#C5A059]/15 hover:border-[#C5A059] hover:shadow-[0_0_30px_rgba(197,160,89,0.08)] transition-all group duration-300">
              <div className="bg-[#C5A059]/15 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-[#C5A059]">
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#EAE6E1] mb-3">{t_strings.feature_1_title}</h3>
              <p className="text-[#CFCAC4] text-sm leading-relaxed">
                {t_strings.feature_1_desc}
              </p>
            </div>

            {/* Bento block 2 */}
            <div className="bg-[#16171a] p-8 rounded-3xl border border-[#C5A059]/15 hover:border-[#C5A059] hover:shadow-[0_0_30px_rgba(197,160,89,0.08)] transition-all group duration-300">
              <div className="bg-[#C5A059]/15 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-[#C5A059]">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#EAE6E1] mb-3">{t_strings.feature_2_title}</h3>
              <p className="text-[#CFCAC4] text-sm leading-relaxed">
                {t_strings.feature_2_desc}
              </p>
            </div>

            {/* Bento block 3 */}
            <div className="bg-[#16171a] p-8 rounded-3xl border border-[#C5A059]/15 hover:border-[#C5A059] hover:shadow-[0_0_30px_rgba(197,160,89,0.08)] transition-all group duration-300">
              <div className="bg-[#C5A059]/15 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-[#C5A059]">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#EAE6E1] mb-3">{t_strings.feature_3_title}</h3>
              <p className="text-[#CFCAC4] text-sm leading-relaxed">
                {t_strings.feature_3_desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Section: Konsultasi Syariah / Tanya Ustadz */}
      <section id="konsultasi-syariah" className="py-20 bg-[#0d0e12]/85 border-b border-[#C5A059]/10 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#128C7E_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12 relative z-10">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#128C7E]/10 text-[#25D366] font-mono text-[10px] font-bold border border-[#128C7E]/20 uppercase tracking-widest">
              <span className="w-2 h-2 bg-[#25D366] rounded-full animate-ping" />
              <span>{lang === 'id' ? 'Konsultasi Syariah Langsung' : 'Direct Sharia Consult'}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#EAE6E1] font-bold">
              {lang === 'id' ? 'Tanya Ustadz Ahli Syariah' : 'Consult with Sharia Scholars'}
            </h2>
            <p className="text-[#CFCAC4] max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-medium">
              {lang === 'id' 
                ? 'Punya pertanyaan khusus mengenai waris keluarga atau ingin mengonfirmasi ketentuan Faraid secara langsung? Hubungi Ustadz kami sekarang.'
                : 'Have specific concerns regarding family inheritance, or want to verify calculations of portion distribution directly? Chat with our Ustadh instantly.'}
            </p>
          </div>

          <div className="bg-[#16171a] border border-[#C5A059]/15 p-6 sm:p-10 rounded-[32px] shadow-2xl text-left grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
            
            <div className="space-y-4">
              <div className="bg-[#111215] p-5 rounded-2xl border border-emerald-500/10 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  {lang === 'id' ? 'Cara Konsultasi WA:' : 'How to Consult:'}
                </h4>
                <ul className="space-y-2 text-xs text-[#CFCAC4] leading-relaxed">
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-400 font-bold shrink-0">1.</span>
                    <span>{lang === 'id' ? 'Pilih salah satu Ustadz yang aktif dari daftar.' : 'Select an active scholar from the list.'}</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-400 font-bold shrink-0">2.</span>
                    <span>{lang === 'id' ? 'Tuliskan rincian pertanyaan Anda pada kolom yang disediakan.' : 'Write your precise questions on the text field.'}</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-emerald-400 font-bold shrink-0">3.</span>
                    <span>{lang === 'id' ? 'Klik "Tanya Sekarang" untuk membuka diskusi instan via WhatsApp.' : 'Click "Ask Now" to redirect instantly to WhatsApp.'}</span>
                  </li>
                </ul>
              </div>

              {scholarsLoading && (
                <p className="text-[10px] text-gray-500 italic animate-pulse">
                  {lang === 'id' ? 'Mengsinkronisasikan pilihan ustadz dari database Firestore...' : 'Syncing ustadz settings from Firestore...'}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#C5A059] mb-1.5">
                  {lang === 'id' ? 'Pilih Ustadz Ahli (Database):' : 'Select Ustadh Scholar:'}
                </label>
                <select
                  value={selectedUstadz}
                  onChange={(e) => setSelectedUstadz(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#111215] border border-[#C5A059]/25 rounded-xl text-[#EAE6E1] font-medium focus:ring-1 focus:ring-[#C5A059] focus:outline-none transition-all cursor-pointer shadow-sm"
                >
                  {activeScholars.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#C5A059] mb-1.5">
                  {lang === 'id' ? 'Rincian Pertanyaan Anda:' : 'Your Consultation Question:'}
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={lang === 'id' ? 'Tulis pertanyaan Anda di sini (Contoh: Berapa bagian ahli waris jika ada istri dan 2 anak laki-laki?)...' : 'Write your inheritance concerns here...'}
                  rows={3}
                  className="w-full p-4 text-xs bg-[#111215] border border-[#C5A059]/25 rounded-xl text-[#EAE6E1] placeholder:text-gray-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none font-medium leading-relaxed shadow-sm transition-all"
                />
              </div>

              <button
                onClick={handleConsultWhatsApp}
                disabled={activeScholars.length === 0}
                className="w-full py-3.5 bg-[#128C7E] hover:bg-[#075E54] hover:shadow-lg hover:shadow-emerald-950/30 text-white rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-md shrink-0"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.svg" 
                  alt="WhatsApp Logo" 
                  className="w-4 h-4 scale-110" 
                />
                <span>{lang === 'id' ? 'TANYAKAN SEKARANG' : 'ASK VIA WHATSAPP NOW'}</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* How it works Section with Preview Cards */}
      <section id="cara-kerja" className="py-20 max-w-7xl mx-auto px-6 md:px-16 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-12">
            <h2 className="text-3xl md:text-4xl font-serif text-[#EAE6E1] font-bold">{t_strings.workflow_title}</h2>
            
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="bg-gradient-to-r from-[#C5A059] to-[#E5D5C5] text-[#0c0d10] w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-lg shadow-md">1</div>
                <div>
                  <h4 className="text-lg font-bold text-[#EAE6E1] mb-1">{t_strings.workflow_step_1}</h4>
                  <p className="text-sm text-[#CFCAC4] leading-relaxed">{t_strings.workflow_step_1_desc}</p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="bg-gradient-to-r from-[#C5A059] to-[#E5D5C5] text-[#0c0d10] w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-lg shadow-md">2</div>
                <div>
                  <h4 className="text-lg font-bold text-[#EAE6E1] mb-1">{t_strings.workflow_step_2}</h4>
                  <p className="text-sm text-[#CFCAC4] leading-relaxed">{t_strings.workflow_step_2_desc}</p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="bg-gradient-to-r from-[#C5A059] to-[#E5D5C5] text-[#0c0d10] w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-lg shadow-md">3</div>
                <div>
                  <h4 className="text-lg font-bold text-[#EAE6E1] mb-1">{t_strings.workflow_step_3}</h4>
                  <p className="text-sm text-[#CFCAC4] leading-relaxed">{t_strings.workflow_step_3_desc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="bg-[#111215] p-6 sm:p-10 rounded-[32px] relative border border-[#C5A059]/15">
              <div className="bg-[#16171a] rounded-3xl p-6 shadow-xl border border-[#C5A059]/20">
                <div className="flex justify-between items-center mb-6">
                  <h5 className="text-lg font-bold text-[#EAE6E1]">{lang === 'id' ? 'Ringkasan Waris' : 'Heritage Review'}</h5>
                  <span className="px-3.5 py-1 bg-[#C5A059]/20 text-[#C5A059] rounded-full text-xs font-semibold">{lang === 'id' ? 'Draf Simulasi' : 'Sample Model'}</span>
                </div>

                <div className="space-y-3.5">
                  <div className="p-4 rounded-xl border-l-4 border-[#C5A059] bg-[#1a1b20] flex justify-between items-center border border-[#C5A059]/15">
                    <span className="text-sm font-medium text-[#CFCAC4]">{lang === 'id' ? 'Istri (1/8)' : 'Wife (1/8)'}</span>
                    <span className="font-mono text-[#C5A059] font-bold text-sm">Rp 125.000.000</span>
                  </div>
                  <div className="p-4 rounded-xl border-l-4 border-[#C5A059] bg-[#1a1b20] flex justify-between items-center border border-[#C5A059]/15">
                    <span className="text-sm font-medium text-[#CFCAC4]">{lang === 'id' ? 'Anak Laki-Laki (Ashabah)' : 'Son (Ashabah)'}</span>
                    <span className="font-mono text-[#C5A059] font-bold text-sm">Rp 583.333.333</span>
                  </div>
                  <div className="p-4 rounded-xl border-l-4 border-[#C5A059] bg-[#1a1b20] flex justify-between items-center border border-[#C5A059]/15">
                    <span className="text-sm font-medium text-[#CFCAC4]">{lang === 'id' ? 'Anak Perempuan (Ashabah)' : 'Daughter (Ashabah)'}</span>
                    <span className="font-mono text-[#C5A059] font-bold text-sm">Rp 291.666.667</span>
                  </div>
                </div>

                <button 
                  onClick={onStartClicked}
                  className="w-full mt-6 bg-[#C5A059] hover:bg-[#b08b49] text-[#0c0d10] py-3.5 rounded-xl font-black transition-all cursor-pointer shadow-md text-sm"
                >
                  {t_strings.btn_start}
                </button>
              </div>

              {/* Back decoration glow */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-br from-[#C5A059]/5 to-[#8F713B]/5 opacity-40 blur-3xl rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust credentials metrics section */}
      <section className="py-16 bg-gradient-to-r from-[#111215] to-[#16171a] text-[#EAE6E1] border-y border-[#C5A059]/15">
        <div className="max-w-7xl mx-auto px-6 md:px-16 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-10 text-[#CFCAC4]">{lang === 'id' ? 'Aman, Transparan & Terpercaya' : 'Secure, Transparent & Absolute'}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl text-[#C5A059] font-bold font-mono">256-bit</p>
              <p className="text-sm opacity-80 font-medium">{lang === 'id' ? 'Enkripsi Data' : 'Data Encryption'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl text-[#C5A059] font-bold font-mono">10k+</p>
              <p className="text-sm opacity-80 font-medium">{lang === 'id' ? 'Simulasi Diproses' : 'Completed Calculations'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl text-[#C5A059] font-bold font-mono">100%</p>
              <p className="text-sm opacity-80 font-medium">{lang === 'id' ? 'Akurasi Fikih' : 'Sharia Quotas Met'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl text-[#C5A059] font-bold font-mono">24/7</p>
              <p className="text-sm opacity-80 font-medium font-sans">{lang === 'id' ? 'Arsip Riwayat' : 'Cloud Access'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA block */}
      <section className="py-20 max-w-7xl mx-auto px-6 md:px-16 w-full">
        <div className="bg-gradient-to-r from-[#16171a] to-[#1a1b20] border border-[#C5A059]/20 rounded-[32px] p-8 md:p-16 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-black text-[#EAE6E1] leading-tight">
              {lang === 'id' ? 'Siap Merencanakan Porsi Terbaik bagi Ahli Waris?' : 'Ready to Plan the Best Portion for Heirs?'}
            </h2>
            <p className="text-[#CFCAC4] text-base leading-relaxed max-w-xl mx-auto">
              {lang === 'id' ? 'Jangan biarkan sengketa memicu perselisihan di masa mendatang. Permudah kalkulasi Faraid secara adil dan transparan.' : 'Do not allow family disagreements to disrupt harmony. Establish transparent inheritance plans today.'}
            </p>
            <button 
              onClick={onStartClicked}
              className="bg-gradient-to-r from-[#C5A059] to-[#E5D5C5] text-[#0c0d10] px-10 py-5 rounded-2xl font-black shadow-xl shadow-[#C5A059]/10 hover:opacity-95 hover:scale-105 active:scale-[0.98] transition-all cursor-pointer text-lg"
            >
              {t_strings.btn_start}
            </button>
          </div>
          
          {/* Accent decoration shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C5A059]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      </section>

      {/* Footer bar */}
      <footer className="bg-[#0c0d10] py-12 border-t border-[#C5A059]/20 mt-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2.5">
              <img 
                alt="Warisku Logo" 
                className="h-8 w-auto rounded-full object-contain filter brightness-[0.9]" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv9Kj4CxubLiWNwOzqn4Ncf0iWGwnw_w1u3D_-X21BzNxQ-hCb6Di-BeLJgcjTseqTLQBVy6HdG8Msg7iFZLJ4VI1WTUmH_evQZbSzjZzTlFeCkbR5dW2eu6H0JjrzHJfPCfmkWfYlLqsp0iy9LcVXiGJYtp33kuEFJ6vSQjHkni_0M6O9N2fiKw9Jggpkt-UmK7qSkpKwsWR5YcyH78B85AjBwVQQzMBIycJ3Ym2xDmAc5rqnLacLrmq4y0gPnFDtxgBhwPJyxiU"
              />
              <span className="font-semibold text-lg text-[#C5A059] tracking-tight font-serif">Warisku</span>
            </div>
            <p className="text-xs text-[#A69F96] font-mono">
              © 2026 Warisku. Sharia Compliant Inheritance Engine.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-[#CFCAC4] font-mono font-semibold">
            <span className="hover:text-[#C5A059] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#C5A059] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#C5A059] cursor-pointer">{t_strings.methodology}</span>
            <span className="hover:text-[#C5A059] cursor-pointer">Contact Us</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
