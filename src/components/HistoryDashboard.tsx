/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  FileSpreadsheet, 
  Trash2, 
  ChevronRight, 
  Calendar, 
  CircleDollarSign, 
  ArrowLeft,
  Users,
  Globe
} from 'lucide-react';
import { CalculationResult } from '../types';
import { translations } from '../utils/translations';

interface HistoryDashboardProps {
  reports: CalculationResult[];
  onSelectReport: (report: CalculationResult) => void;
  onDeleteReport: (id: string) => void;
  onBackToHome: () => void;
  lang: 'id' | 'en';
  onToggleLanguage: () => void;
}

export default function HistoryDashboard({
  reports,
  onSelectReport,
  onDeleteReport,
  onBackToHome,
  lang,
  onToggleLanguage,
}: HistoryDashboardProps) {
  const t_strings = translations[lang];

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-[#0c0d10] min-h-screen text-[#EAE6E1] py-10 px-4 sm:px-6 md:px-16 max-w-7xl mx-auto w-full font-sans relative">
      
      {/* Background Dots Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10 z-0 h-full w-full"
        style={{
          backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#C5A059]/15 pb-6 mb-8 z-10 relative">
        <div>
          <button 
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-bold text-[#C5A059] hover:text-[#EAE6E1] transition-colors mb-2 cursor-pointer bg-transparent border-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t_strings.back_to_home}
          </button>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-[#EAE6E1] flex items-center gap-2">
            {t_strings.history_title}
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16171a] hover:bg-[#C5A059]/15 text-[#EAE6E1] border border-[#C5A059]/25 text-xs font-bold font-mono transition-all uppercase tracking-wider cursor-pointer"
            title="Ganti Bahasa / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{lang === 'id' ? 'ID ⇄ EN' : 'EN ⇄ ID'}</span>
          </button>
          <span className="text-xs bg-[#C5A059]/10 text-[#C5A059] font-bold border border-[#C5A059]/20 px-4 py-2 rounded-full font-mono">
            {reports.length} {t_strings.history_subtitle}
          </span>
        </div>
      </div>

      {/* Main content split */}
      {reports.length === 0 ? (
        <div className="bg-[#111215] border border-[#C5A059]/15 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-6 z-10 relative shadow-2xl">
          <div className="bg-[#C5A059]/10 text-[#C5A059] w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner border border-[#C5A059]/20">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-bold font-serif text-[#EAE6E1]">{t_strings.history_empty_title}</h3>
            <p className="text-xs text-[#CFCAC4] leading-relaxed max-w-md mx-auto">
              {t_strings.history_empty_desc}
            </p>
          </div>
          <button 
            onClick={onBackToHome}
            className="bg-gradient-to-r from-[#C5A059] to-[#E5D5C5] text-black font-black px-6 py-3 rounded-full text-xs shadow hover:opacity-95 transition-all cursor-pointer"
          >
            {t_strings.history_start_calc}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10 relative">
          {reports.map((report) => (
            <motion.div 
              key={report.id_hasil}
              whileHover={{ y: -4 }}
              className="bg-[#111215] hover:shadow-2xl transition-all rounded-2xl border border-[#C5A059]/15 p-5 flex flex-col justify-between shadow-md"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#EAE6E1] font-serif truncate max-w-[180px]">
                      {report.nama_pewaris}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      ID: {report.id_hasil.substring(0, 8)}
                    </p>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(lang === 'id' ? 'Apakah Anda yakin ingin menghapus data perhitungan ini dari riwayat?' : 'Are you sure you want to remove this calculation report?')) {
                        onDeleteReport(report.id_hasil);
                      }
                    }}
                    className="text-gray-500 hover:text-red-400 hover:bg-red-950/20 p-1.5 rounded-full transition-all cursor-pointer"
                    title={t_strings.history_delete_tooltip}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[#16171a] p-3 rounded-xl border border-[#C5A059]/10 space-y-2 text-xs">
                  <div className="flex justify-between text-[#CFCAC4]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CircleDollarSign className="w-3.5 h-3.5 text-[#C5A059]" />
                      {t_strings.history_col_tirkah}
                    </span>
                    <span className="font-mono font-bold text-[#C5A059]">{formatIDR(report.tirkah)}</span>
                  </div>
                  
                  <div className="flex justify-between text-[#CFCAC4]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-[#C5A059]/80" />
                      {t_strings.history_col_heirs}
                    </span>
                    <span className="font-mono text-[#EAE6E1]">{report.heirs.length} {lang === 'id' ? 'Keluarga' : 'Heirs'}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onSelectReport(report)}
                className="w-full mt-5 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 text-[#C5A059] hover:text-[#EAE6E1] py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#C5A059]/20"
              >
                {t_strings.history_view_detail}
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
