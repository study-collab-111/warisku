/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Calculator, 
  Coins, 
  Users2, 
  HeartHandshake, 
  HelpCircle,
  AlertTriangle,
  Globe,
  BookOpen,
  GitFork
} from 'lucide-react';
import { FinancialData, Heir, RelationshipType, AssetDetail } from '../types';
import { translations } from '../utils/translations';

interface WizardPageProps {
  onBack: () => void;
  onCalculate: (name: string, financials: FinancialData, heirs: Heir[]) => void;
  lang: 'id' | 'en';
  onToggleLanguage: () => void;
  currentUser: { name: string; email: string } | null;
  onLoginClicked: () => void;
  onLogout: () => void;
  initialName?: string;
  initialFinancials?: FinancialData;
  initialHeirs?: Heir[];
}

const DEFAULT_FINANCIALS: FinancialData = {
  total_harta: 1500000000,
  hutang: 200000500,
  wasiat: 100000000,
  biaya_pemakaman: 15000000,
};

const DEFAULT_HEIRS: Heir[] = [
  { id: '1', relationship: 'istri', gender: 'Wanita', count: 1 },
  { id: '2', relationship: 'ayah', gender: 'Pria', count: 1 },
  { id: '3', relationship: 'ibu', gender: 'Wanita', count: 1 },
  { id: '4', relationship: 'anak_lk', gender: 'Pria', count: 1 },
  { id: '5', relationship: 'anak_pr', gender: 'Wanita', count: 1 },
];

const RELATIONSHIP_LABELS_BILINGUAL: Record<RelationshipType, { id: string; en: string }> = {
  suami: { id: "Suami (Spouse Male)", en: "Husband (Spouse Male)" },
  istri: { id: "Istri (Spouse Female)", en: "Wife (Spouse Female)" },
  anak_lk: { id: "Anak Kandung Laki-laki", en: "Direct Son" },
  anak_pr: { id: "Anak Kandung Perempuan", en: "Direct Daughter" },
  ayah: { id: "Ayah Kandung", en: "Biological Father" },
  ibu: { id: "Ibu Kandung", en: "Biological Mother" },
  sdra_lk: { id: "Saudara Laki-laki Kandung", en: "Full Brother" },
  sdra_pr: { id: "Saudara Perempuan Kandung", en: "Full Sister" },
};

export default function WizardPage({
  onBack,
  onCalculate,
  lang,
  onToggleLanguage,
  currentUser,
  onLoginClicked,
  onLogout,
  initialName = '',
  initialFinancials = DEFAULT_FINANCIALS,
  initialHeirs = DEFAULT_HEIRS,
}: WizardPageProps) {
  const t_strings = translations[lang];

  const [name, setName] = useState(initialName || (lang === 'id' ? 'Haji Ahmad Fauzi' : 'Haj Ahmad Fauzi'));
  const [financials, setFinancials] = useState<FinancialData>(initialFinancials);
  const [heirs, setHeirs] = useState<Heir[]>(initialHeirs);
  const [wasiatWarning, setWasiatWarning] = useState(false);

  const [assetDetails, setAssetDetails] = useState<AssetDetail[]>(() => {
    if (initialFinancials.harta_rincian && initialFinancials.harta_rincian.length > 0) {
      return initialFinancials.harta_rincian;
    }
    return [
      { id: '1', name: lang === 'id' ? 'Uang Tunai / Tabungan' : 'Cash / Savings', value: 500000000 },
      { id: '2', name: lang === 'id' ? 'Properti / Tanah / Rumah' : 'Properties / Land', value: 800000000 },
      { id: '3', name: lang === 'id' ? 'Kendaraan (Mobil/Motor)' : 'Vehicles (Cars/Motorcycles)', value: 150000000 },
      { id: '4', name: lang === 'id' ? 'Emas / Perhiasan / Logam Mulia' : 'Gold & Precious Metals', value: 50000000 }
    ];
  });

  const updateAssetDetails = (newDetails: AssetDetail[]) => {
    setAssetDetails(newDetails);
    const sum = newDetails.reduce((acc, curr) => acc + curr.value, 0);
    const updated = {
      ...financials,
      total_harta: sum,
      harta_rincian: newDetails
    };
    
    const isOver = financials.wasiat > sum / 3;
    setWasiatWarning(isOver);
    setFinancials(updated);
  };

  // Stepper UI representation
  const [currentWizardSubstep, setCurrentWizardSubstep] = useState<'profile' | 'heirs'>('profile');

  const handleFinancialChange = (key: keyof FinancialData, val: number) => {
    const updated = { ...financials, [key]: val };
    
    // Auto validate Wasiat maximum 1/3 threshold warning
    if (key === 'wasiat' || key === 'total_harta') {
      const isOver = updated.wasiat > updated.total_harta / 3;
      setWasiatWarning(isOver);
    }

    setFinancials(updated);
  };

  const handleHeirChange = (id: string, key: keyof Heir, val: any) => {
    setHeirs(
      heirs.map((h) => {
        if (h.id !== id) return h;
        
        const updated = { ...h, [key]: val };

        // Auto lock gender based on relationship type
        if (key === 'relationship') {
          const r = val as RelationshipType;
          if (['suami', 'anak_lk', 'ayah', 'sdra_lk'].includes(r)) {
            updated.gender = 'Pria';
          } else if (['istri', 'anak_pr', 'ibu', 'sdra_pr'].includes(r)) {
            updated.gender = 'Wanita';
          }
        }
        return updated;
      })
    );
  };

  const addHeirRow = () => {
    const newHeir: Heir = {
      id: Math.random().toString(36).substring(7),
      relationship: 'anak_lk',
      gender: 'Pria',
      count: 1,
    };
    setHeirs([...heirs, newHeir]);
  };

  const removeHeirRow = (id: string) => {
    setHeirs(heirs.filter((h) => h.id !== id));
  };

  const triggerCalculate = () => {
    if (!name.trim()) {
      alert(lang === 'id' ? 'Mohon masukkan nama pewaris.' : 'Please enter the deceased person\'s name.');
      return;
    }

    // Limit wasiat automatically to exactly 1/3 if user forces calculation with larger values
    let finalWasiat = financials.wasiat;
    const maxAllowedWasiat = financials.total_harta / 3;
    if (financials.wasiat > maxAllowedWasiat) {
      finalWasiat = maxAllowedWasiat;
    }

    const cleanFinancials = {
      ...financials,
      wasiat: finalWasiat,
    };

    onCalculate(name, cleanFinancials, heirs);
  };

  // Stepper render helper
  const renderStepper = () => {
    return (
      <div className="max-w-3xl mx-auto mb-10 px-4">
        <div className="relative flex justify-between items-center">
          {/* Progress Connector Line */}
          <div className="absolute top-1/2 left-0 w-full h-[3px] bg-[#1a1b20] -translate-y-1/2 z-0 border-y border-[#C5A059]/10" />
          <div 
            className="absolute top-1/2 left-0 h-[3px] bg-[#C5A059] -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: currentWizardSubstep === 'profile' ? '33%' : '66%' }}
          />

          {/* Stepper items */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C5A059] text-[#111215] border-2 border-[#C5A059] shadow-md font-black text-sm">
              1
            </div>
            <span className="text-xs font-bold text-[#C5A059]">{lang === 'id' ? 'Profil & Harta' : 'Asset Profile'}</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all font-black text-sm ${
              currentWizardSubstep === 'heirs'
                ? 'bg-[#C5A059] text-[#111215] border-[#C5A059] shadow-md'
                : 'bg-[#111215] text-[#CFCAC4]/40 border-[#C5A059]/15'
            }`}>
              2
            </div>
            <span className={`text-xs font-bold ${currentWizardSubstep === 'heirs' ? 'text-[#C5A059]' : 'text-[#CFCAC4]/40'}`}>
              {lang === 'id' ? 'Ahli Waris' : 'Surviving Heirs'}
            </span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#111215] text-[#CFCAC4]/40 border-2 border-[#C5A059]/15 font-black text-sm">
              3
            </div>
            <span className="text-xs font-bold text-[#CFCAC4]/40">{lang === 'id' ? 'Hasil & Nilai' : 'Report & Shares'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0c0d10] text-[#EAE6E1] min-h-screen flex flex-col font-sans">
      
      {/* Background Dots Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10 z-0 h-full w-full"
        style={{
          backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Mini top brand bar */}
      <nav className="bg-[#0c0d10] border-b border-[#C5A059]/15 h-16 flex items-center px-4 sm:px-6 md:px-16 justify-between z-10 relative gap-3">
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={onBack}>
          <img 
            alt="Warisku Logo" 
            className="h-8 w-auto rounded-full object-contain bg-black/30 border border-[#C5A059]/30" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv9Kj4CxubLiWNwOzqn4Ncf0iWGwnw_w1u3D_-X21BzNxQ-hCb6Di-BeLJgcjTseqTLQBVy6HdG8Msg7iFZLJ4VI1WTUmH_evQZbSzjZzTlFeCkbR5dW2eu6H0JjrzHJfPCfmkWfYlLqsp0iy9LcVXiGJYtp33kuEFJ6vSQjHkni_0M6O9N2fiKw9Jggpkt-UmK7qSkpKwsWR5YcyH78B85AjBwVQQzMBIycJ3Ym2xDmAc5rqnLacLrmq4y0gPnFDtxgBhwPJyxiU"
          />
          <span className="hidden sm:inline font-semibold text-lg text-[#C5A059] tracking-tight font-serif">{t_strings.app_title}</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="hidden lg:inline text-xs font-mono text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 rounded-full border border-[#C5A059]/25">
            {lang === 'id' ? 'Kalkulator Hukum KHI' : 'KHI Compliant Calculator'}
          </span>
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#16171a]/95 hover:bg-[#C5A059]/20 text-[#EAE6E1] border border-[#C5A059]/30 text-[10px] sm:text-xs font-bold font-mono transition-colors uppercase tracking-wider cursor-pointer font-semibold"
            title="Ganti Bahasa / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{lang === 'id' ? 'ID ⇄ EN' : 'EN ⇄ ID'}</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <div className="hidden md:block text-right">
                <p className="text-xs font-semibold text-[#EAE6E1]">{currentUser.name}</p>
                <p className="text-[9px] text-[#A69F96]">{currentUser.email}</p>
              </div>
              <button 
                onClick={onLogout}
                className="text-[10px] sm:text-xs bg-[#16171a]/95 text-[#CAC3BB] hover:text-red-400 hover:bg-neutral-900 border border-[#C5A059]/25 hover:border-red-900 px-3 py-1.5 rounded-full transition-colors font-bold cursor-pointer"
              >
                {t_strings.logout}
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClicked}
              className="bg-[#C5A059]/15 hover:bg-[#C5A059]/30 text-[#EAE6E1] px-3.5 py-1.5 rounded-full border border-[#C5A059]/40 text-[10px] sm:text-xs font-bold transition-all cursor-pointer tracking-wide"
            >
              {t_strings.login}
            </button>
          )}
        </div>
      </nav>

      <main className="flex-grow py-8 md:py-12 px-4 sm:px-6 md:px-16 max-w-7xl mx-auto w-full z-10 relative">
        <div className="mb-4 text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-2xl md:text-3xl font-serif font-black text-[#EAE6E1]">{t_strings.wiz_title}</h1>
          <p className="text-xs text-[#CFCAC4]">{t_strings.wiz_desc}</p>
        </div>

        {renderStepper()}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form stack (Left Panel) */}
          <div className="lg:col-span-8 space-y-6">
            
            <AnimatePresence mode="wait">
              {currentWizardSubstep === 'profile' ? (
                <motion.div
                  key="step-profile"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-6"
                >
                  {/* Card Section 1: Data Pewaris */}
                  <div className="bg-[#111215] border-l-4 border-[#C5A059] p-6 sm:p-8 rounded-2xl shadow-xl border border-y-[#C5A059]/15 border-r-[#C5A059]/15">
                    <h2 className="text-xl font-bold font-serif text-[#EAE6E1] mb-6 flex items-center gap-3">
                      <Coins className="text-[#C5A059] w-6 h-6 border border-[#C5A059]/20 bg-[#C5A059]/10 p-1 rounded-lg" />
                      {t_strings.step_1}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#CFCAC4] mb-1.5">
                          {t_strings.input_pewaris_name}
                        </label>
                        <input 
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t_strings.input_pewaris_placeholder}
                          className="w-full px-4 py-3 bg-[#16171a] border border-[#C5A059]/20 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none placeholder:text-gray-600 text-[#EAE6E1]"
                        />
                      </div>

                      <div className="sm:col-span-2 bg-[#16171a]/40 p-5 rounded-2xl border border-[#C5A059]/10 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xs font-bold text-[#EAE6E1] uppercase tracking-wide">
                              {lang === 'id' ? 'Rincian Sumber Harta Kotor' : 'Gross Estate Source Itemization'}
                            </h3>
                            <p className="text-[10px] text-[#A69F96]">
                              {lang === 'id' ? 'Tentukan pos sumber kekayaan sebelum dikurangi utang & wasiat.' : 'Add or modify different assets to automatically compute total gross estate.'}
                            </p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const newId = Math.random().toString(36).substring(7);
                              const updated = [...assetDetails, { id: newId, name: lang === 'id' ? 'Aset Lain-lain' : 'Other Asset', value: 0 }];
                              updateAssetDetails(updated);
                            }}
                            className="bg-[#C5A059]/10 hover:bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{lang === 'id' ? 'Tambah Pos Harta' : 'Add Asset'}</span>
                          </button>
                        </div>

                        {/* Itemized list of assets */}
                        <div className="space-y-2.5">
                          {assetDetails.map((asset) => (
                            <div key={asset.id} className="flex items-center gap-3 bg-[#111215] p-3 rounded-xl border border-[#C5A059]/10">
                              <div className="flex-grow">
                                <input 
                                  type="text"
                                  value={asset.name}
                                  onChange={(e) => {
                                    const updated = assetDetails.map(a => a.id === asset.id ? { ...a, name: e.target.value } : a);
                                    updateAssetDetails(updated);
                                  }}
                                  placeholder={lang === 'id' ? 'Nama sumber harta (misal: Rumah)' : 'Asset source name (e.g. Savings)'}
                                  className="w-full bg-transparent px-1 text-xs text-[#EAE6E1] border-b border-transparent focus:border-[#C5A059]/30 focus:outline-none font-bold"
                                />
                              </div>

                              <div className="w-36 shrink-0 relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#C5A059]">Rp</span>
                                <input 
                                  type="number"
                                  value={asset.value === 0 ? '' : asset.value}
                                  onChange={(e) => {
                                    const updated = assetDetails.map(a => a.id === asset.id ? { ...a, value: Number(e.target.value) } : a);
                                    updateAssetDetails(updated);
                                  }}
                                  placeholder="0"
                                  className="w-full bg-[#16171a] pl-7 pr-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-right text-[#EAE6E1] border border-[#C5A059]/15 focus:outline-none focus:border-[#C5A059]/40"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = assetDetails.filter(a => a.id !== asset.id);
                                  updateAssetDetails(updated);
                                }}
                                className="text-red-400 hover:bg-red-950/20 p-1.5 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-950"
                                title={lang === 'id' ? 'Hapus Pos' : 'Delete Asset'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Summary indicator */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#C5A059]/15">
                          <span className="text-xs font-bold text-[#A69F96]">{lang === 'id' ? 'Gabungan Harta Kotor Terhitung:' : 'Total Calculated Gross Estate:'}</span>
                          <span className="text-sm font-mono font-black text-[#C5A059]">
                            Rp {financials.total_harta.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#CFCAC4] mb-1.5">
                          {t_strings.input_hutang}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#C5A059]/80">Rp</span>
                          <input 
                            type="number"
                            value={financials.hutang}
                            onChange={(e) => handleFinancialChange('hutang', Number(e.target.value))}
                            placeholder="0"
                            className="w-full pl-10 pr-4 py-3 bg-[#16171a] border border-[#C5A059]/20 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-[#C5A059] focus:outline-none text-[#EAE6E1]"
                          />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{t_strings.input_hutang_help}</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-bold text-[#CFCAC4]">
                            {t_strings.input_wasiat}
                          </label>
                          <HelpCircle 
                            onClick={() => alert(lang === 'id' ? 'Wasiat dalam hukum waris Islam dibatasi maksimal 1/3 dari total aset kotor. Porsi wasiat melebihi 1/3 secara otomatis akan disesuaikan menjadi batas maksimal.' : 'A bequest in Islamic Faraid law is capped at 1/3 of total gross assets to protect biological heir portions.')}
                            className="w-3.5 h-3.5 text-gray-500 hover:text-[#C5A059] cursor-pointer" 
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#C5A059]/80">Rp</span>
                          <input 
                            type="number"
                            value={financials.wasiat}
                            onChange={(e) => handleFinancialChange('wasiat', Number(e.target.value))}
                            placeholder="0"
                            className={`w-full pl-10 pr-4 py-3 bg-[#16171a] border rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-[#C5A059] focus:outline-none text-[#EAE6E1] ${
                              wasiatWarning ? 'border-amber-500 focus:ring-amber-500' : 'border-[#C5A059]/20'
                            }`}
                          />
                        </div>
                        {wasiatWarning && (
                          <div className="flex items-center gap-1.5 mt-1 text-amber-500">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span className="text-[10px] font-semibold leading-relaxed">
                              {lang === 'id' ? 'Nominal melewati 1/3 total harta! Otomatis dikurangi saat kalkulasi.' : 'Amount exceeds 1/3 constraints, auto adjusted on calculate.'}
                            </span>
                          </div>
                        )}
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{t_strings.input_wasiat_help}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#CFCAC4] mb-1.5">
                          {t_strings.input_pemakaman}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#C5A059]/80">Rp</span>
                          <input 
                            type="number"
                            value={financials.biaya_pemakaman}
                            onChange={(e) => handleFinancialChange('biaya_pemakaman', Number(e.target.value))}
                            placeholder="0"
                            className="w-full pl-10 pr-4 py-3 bg-[#16171a] border border-[#C5A059]/20 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-[#C5A059] focus:outline-none text-[#EAE6E1]"
                          />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{t_strings.input_pemakaman_help}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions navigation line */}
                  <div className="flex justify-between items-center pt-4">
                    <button 
                      onClick={onBack}
                      className="flex items-center gap-2 text-xs font-bold text-[#CFCAC4] hover:text-[#C5A059] transition-all cursor-pointer bg-[#16171a] border border-[#C5A059]/20 px-5 py-3 rounded-full shadow-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t_strings.btn_prev}
                    </button>
                    <button 
                      onClick={() => setCurrentWizardSubstep('heirs')}
                      className="bg-gradient-to-r from-[#C5A059] to-[#E5D5C5] text-black px-8 py-3.5 rounded-full font-black shadow-md hover:opacity-95 transition-all cursor-pointer text-xs uppercase tracking-wide"
                    >
                      {lang === 'id' ? 'Lanjut Pemetaan Ahli Waris' : 'Continue to Surviving Heirs'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step-heirs"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="space-y-6"
                >
                  <div className="bg-[#111215] border-l-4 border-[#C5A059] p-6 sm:p-8 rounded-2xl shadow-xl border border-y-[#C5A059]/15 border-r-[#C5A059]/15">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="space-y-1">
                        <h2 className="text-xl font-bold font-serif text-[#EAE6E1] flex items-center gap-3">
                          <Users2 className="text-[#C5A059] w-6 h-6 border border-[#C5A059]/25 bg-[#C5A059]/10 p-1 rounded-lg" />
                          {t_strings.step_2}
                        </h2>
                        <p className="text-[10px] text-[#A69F96]">{t_strings.heirs_section_desc}</p>
                      </div>
                      
                      <button 
                        type="button"
                        onClick={addHeirRow}
                        className="flex items-center justify-center gap-2 bg-[#C5A059]/10 text-[#C5A059] hover:bg-[#C5A059]/20 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-[#C5A059]/25 shadow-sm shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        {lang === 'id' ? 'Tambah Ahli Waris' : 'Add Heir Dynamic Row'}
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[550px]">
                        <thead>
                          <tr className="border-b border-[#C5A059]/15 text-[#A69F96] text-xs tracking-wider uppercase font-mono">
                            <th className="py-3 px-1 font-semibold">{lang === 'id' ? 'Hubungan Silsilah' : 'Silsilah Connection'}</th>
                            <th className="py-3 px-2 font-semibold">{lang === 'id' ? 'Jenis Kelamin' : 'Gender'}</th>
                            <th className="py-3 px-2 font-semibold text-center w-24">{lang === 'id' ? 'Jumlah' : 'Quantity'}</th>
                            <th className="py-3 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {heirs.map((heir) => (
                            <tr key={heir.id} className="border-b border-[#C5A059]/10 hover:bg-[#16171a]/40 transition-all">
                              <td className="py-4 pr-3">
                                <select 
                                  value={heir.relationship} 
                                  onChange={(e) => handleHeirChange(heir.id, 'relationship', e.target.value)}
                                  className="w-full text-sm font-medium bg-[#16171a] border border-[#C5A059]/20 text-[#EAE6E1] px-3 py-2.5 rounded-xl focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                >
                                  {Object.keys(RELATIONSHIP_LABELS_BILINGUAL).map((relKey) => {
                                    const labels = RELATIONSHIP_LABELS_BILINGUAL[relKey as RelationshipType];
                                    return (
                                      <option key={relKey} value={relKey}>
                                        {lang === 'id' ? labels.id : labels.en}
                                      </option>
                                    );
                                  })}
                                </select>
                              </td>

                              <td className="py-4 px-2">
                                <div className="flex gap-2">
                                  <button 
                                    type="button"
                                    onClick={() => handleHeirChange(heir.id, 'gender', 'Pria')}
                                    className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-all ${
                                      heir.gender === 'Pria'
                                        ? 'bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/40 shadow-inner'
                                        : 'bg-[#16171a] text-gray-500 border-[#C5A059]/10 opacity-60'
                                    }`}
                                  >
                                    ♂ {t_strings.gender_lk}
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleHeirChange(heir.id, 'gender', 'Wanita')}
                                    className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-all ${
                                      heir.gender === 'Wanita'
                                        ? 'bg-[#C5A059]/25 text-[#EAE6E1] border-[#C5A059]/40 shadow-inner'
                                        : 'bg-[#16171a] text-gray-500 border-[#C5A059]/10 opacity-60'
                                    }`}
                                  >
                                    ♀ {t_strings.gender_pr}
                                  </button>
                                </div>
                              </td>

                              <td className="py-4 px-2">
                                <input 
                                  type="number"
                                  min={1}
                                  max={12}
                                  value={heir.count}
                                  onChange={(e) => handleHeirChange(heir.id, 'count', Number(e.target.value))}
                                  className="w-full text-center text-sm font-mono font-bold bg-[#16171a] border border-[#C5A059]/25 text-[#EAE6E1] px-2 py-2 rounded-xl focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                                />
                              </td>

                              <td className="py-4 text-center">
                                <button 
                                  type="button" 
                                  onClick={() => removeHeirRow(heir.id)}
                                  className="text-red-400 hover:bg-red-950/20 p-2 rounded-full transition-colors cursor-pointer"
                                  title="Hapus ahli waris"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Save and return buttons */}
                  <div className="flex justify-between items-center pt-4">
                    <button 
                      onClick={() => setCurrentWizardSubstep('profile')}
                      className="flex items-center gap-2 text-xs font-bold text-[#CFCAC4] hover:text-[#C5A059] transition-all cursor-pointer bg-[#16171a] border border-[#C5A059]/20 px-5 py-3 rounded-full shadow-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t_strings.btn_prev}
                    </button>
                    
                    <button 
                      onClick={triggerCalculate}
                      className="bg-gradient-to-r from-[#C5A059] to-[#E5D5C5] text-black px-9 py-3.5 rounded-full font-black shadow-lg hover:opacity-95 hover:scale-105 active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer text-xs uppercase"
                    >
                      {t_strings.btn_calculate_now}
                      <Calculator className="w-4 h-4 text-black animate-pulse" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Right Information Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Context Card 1: Panduan Faraid */}
            <div className="bg-[#111215] rounded-2xl overflow-hidden shadow-xl border border-[#C5A059]/15 group">
              <div className="h-32 bg-gradient-to-br from-[#16171a] to-[#0c0d10] flex items-center justify-center relative border-b border-[#C5A059]/10">
                <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] opacity-5 pointer-events-none" style={{ backgroundSize: '16px 16px' }} />
                <div className="w-14 h-14 rounded-full bg-[#C5A059]/10 flex items-center justify-center shadow-lg border border-[#C5A059]/20 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-6 h-6 text-[#C5A059]" />
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-sm font-bold text-[#C5A059] font-serif">{lang === 'id' ? 'Dasar Fikih Hukum Faraid' : 'Sharia Faraid Fundamentals'}</h3>
                <p className="text-xs text-[#CFCAC4] leading-relaxed">
                  {lang === 'id'
                    ? "Semua pembagian dihitung secara syariah berdasar teks asli Al-Qur'an (QS. An-Nisa ayat 11, 12, dan 176) serta metodologi KHI yang disepakati oleh Fiqh Islam (Aul, Radd, Gharrawain)."
                    : "Every portion is computed under Sharia guidance in reference to the original Quranic verses (Surah An-Nisa: 11, 12, 176) alongside consensus legal adjustments (Aul, Radd, Gharrawain)."}
                </p>
              </div>
            </div>

            {/* Context Card 2: Visual Heirs infographic card */}
            <div className="bg-[#111215] rounded-2xl overflow-hidden shadow-xl border border-[#C5A059]/15 group">
              <div className="h-32 bg-gradient-to-br from-[#16171a] to-[#0c0d10] flex items-center justify-center relative border-b border-[#C5A059]/10">
                <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] opacity-5 pointer-events-none" style={{ backgroundSize: '16px 16px' }} />
                <div className="w-14 h-14 rounded-full bg-[#C5A059]/10 flex items-center justify-center shadow-lg border border-[#C5A059]/20 group-hover:scale-110 transition-transform duration-300">
                  <GitFork className="w-6 h-6 text-[#C5A059]" />
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-sm font-bold text-[#C5A059] font-serif">{lang === 'id' ? 'Syarat Hijab-Mahjub' : 'Hijab-Mahjub Conditions'}</h3>
                <p className="text-xs text-[#CFCAC4] leading-relaxed">
                  {lang === 'id'
                    ? "Silsilah tertentu terblokir (blocked) oleh kerabat yang lebih dekat. Misalnya, Saudara Kandung terhalang apabila pewaris meninggalkan Ayah atau Anak Laki-laki."
                    : "Primary closer heirs completely block secondary heirs from receiving portions. For instance, full siblings are blocked in the presence of surviving fathers or direct sons."}
                </p>
              </div>
            </div>

            {/* Stamp certification indicator */}
            <div className="bg-gradient-to-br from-[#16171a] to-[#0c0d10] text-[#EAE6E1] p-5 rounded-2xl space-y-2.5 border border-[#C5A059]/20 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#C5A059]" />
                <span className="font-bold text-xs text-[#EAE6E1]">{lang === 'id' ? 'Jaminan Mutu Faraid' : 'Certified Sharia Compliance'}</span>
              </div>
              <p className="text-[11px] text-[#CFCAC4] leading-relaxed font-sans">
                {lang === 'id'
                  ? "Sistem kalkulasi diuji secara ketat, akurat, dan transparan mengikuti regulasi resmi Mahkamah Agung di Indonesia dalam membagi harta pusaka."
                  : "Calculation arrays are meticulously tested and mathematically audited following Religious Court systems to ensure precision for harmonious distribution."}
              </p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
