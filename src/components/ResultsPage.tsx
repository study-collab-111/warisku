/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Printer, 
  RefreshCw, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  FolderHeart, 
  ChevronRight,
  Sparkles,
  Download,
  Globe
} from 'lucide-react';
import { CalculationResult } from '../types';
import { translations } from '../utils/translations';

interface ResultsPageProps {
  result: CalculationResult;
  onReset: () => void;
  onSaveReport: (report: CalculationResult) => void;
  isLoggedIn: boolean;
  lang: 'id' | 'en';
  onToggleLanguage: () => void;
}

export default function ResultsPage({
  result,
  onReset,
  onSaveReport,
  isLoggedIn,
  lang,
  onToggleLanguage,
}: ResultsPageProps) {
  const t_strings = translations[lang];

  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const { nama_pewaris, financials, tirkah, heirs, appliedCalculations } = result;

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (!isLoggedIn) {
      alert(lang === 'id' ? 'Mohon Masuk Akun terlebih dahulu untuk menyimpan silsilah dan hasil pembagian waris Anda.' : 'Please sign in first to save your inheritance reports to your cloud library.');
      return;
    }
    onSaveReport(result);
    setIsSaved(true);
    setTimeout(() => {
      alert(lang === 'id' ? 'Berhasil disimpan ke Akun Warisku Anda! Dapat diakses pada panel riwayat.' : 'Report successfully saved into your cloud archive! Viewable at any time from your account panel.');
    }, 400);
  };

  // Plain Text formatted file download trigger
  const handleDownload = () => {
    const separator = "========================================================\n";
    const doubleSeparator = "========================================================\n========================================================\n";
    
    let content = "";
    if (lang === 'id') {
      content += doubleSeparator;
      content += "            LAPORAN RESMI PEMBAGIAN WARIS (FARAID)      \n";
      content += "                      Platform Warisku                  \n";
      content += doubleSeparator;
      content += `Tanggal Cetak   : ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\n`;
      content += `Nama Pewaris    : ${nama_pewaris}\n`;
      content += `Status Syariah  : Sukses Terverifikasi (KHI Compliant)\n`;
      content += separator;
      content += "1. REKAPITULASI KEUANGAN PEWARIS & TIRKAH\n";
      content += separator;
      content += `Total Harta Kotor (Gross Assets) : ${formatIDR(financials.total_harta)}\n`;
      content += `Dibereskan Hutang                : ${formatIDR(financials.hutang)}\n`;
      content += `Dibereskan Wasiat (Maks. 1/3)    : ${formatIDR(financials.wasiat)}\n`;
      content += `Biaya Pengurusan Jenazah (Tajhiz): ${formatIDR(financials.biaya_pemakaman)}\n`;
      content += `--------------------------------------------------------\n`;
      content += `TOTAL HARTA BERSIH (TIRKAH)      : ${formatIDR(tirkah)}\n`;
      content += separator;
      content += "2. KAIDAH FARAID YANG TERAPLIKASI\n";
      content += separator;
      content += `Penyelesaian Aul      : ${appliedCalculations.hasAul ? "YA (Adanya penyesuaian pembagi ekuitas)" : "TIDAK"}\n`;
      content += `Penyelesaian Radd     : ${appliedCalculations.hasRadd ? "YA (Adanya pengembalian surplus sisa)" : "TIDAK"}\n`;
      content += `Penyelesaian Gharrawain: ${appliedCalculations.hasGharrawain ? "YA (Aturan Umariyyatain)" : "TIDAK"}\n`;
      content += separator;
      content += "3. RINCIAN BAGIAN AHLI WARIS\n";
      content += separator;
      
      heirs.forEach((h, i) => {
        content += `${i + 1}. [${h.category}] ${h.name}\n`;
        content += `   Porsi Awal : ${h.originalShareText}\n`;
        content += `   Persentase : ${h.percentage}%\n`;
        content += `   Nominal    : ${formatIDR(h.nominalValue)}\n`;
        content += `   Ket/Kaidah : ${h.notes}\n\n`;
      });
      
      content += separator;
      content += "4. RUJUKAN DALIL STRUKTURAL\n";
      content += separator;
      content += "- QS. An-Nisa (4:11): Bagian bagi keturunan laki-laki setara porsi dua bagian anak perempuan.\n";
      content += "- Ushul Fiqh: Kewajiban jenazah (Tajhiz), hutang pewaris, dan wasiat wajib ditunaikan sebelum pembagian warisan.\n";
      content += "- Kompilasi Hukum Islam (KHI) Republik indonesia.\n";
      content += separator;
      content += "         Laporan ini bersifat sah dan sesuai secara syariah\n";
      content += "                 Terima kasih menggunakan Warisku\n";
      content += doubleSeparator;
    } else {
      content += doubleSeparator;
      content += "            OFFICIAL ISLAMIC INHERITANCE (FARAID) REPORT  \n";
      content += "                      Warisku Platform                  \n";
      content += doubleSeparator;
      content += `Generated On  : ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\n`;
      content += `Deceased Name : ${nama_pewaris}\n`;
      content += `Syariah Status : Verified (Compilation of Islamic Law - KHI)\n`;
      content += separator;
      content += "1. FINANCIAL TRANSACTIONS & NET ESTATE (TIRKAH)\n";
      content += separator;
      content += `Total Gross Assets              : ${formatIDR(financials.total_harta)}\n`;
      content += `Outstanding Debts (Deduction)   : ${formatIDR(financials.hutang)}\n`;
      content += `Syar'i Bequest (Deduction)      : ${formatIDR(financials.wasiat)}\n`;
      content += `Burial Services (Deduction)     : ${formatIDR(financials.biaya_pemakaman)}\n`;
      content += `--------------------------------------------------------\n`;
      content += `TOTAL NET INHERITABLE ESTATE     : ${formatIDR(tirkah)}\n`;
      content += separator;
      content += "2. APPLIED JURISPRUDENCE RULES\n";
      content += separator;
      content += `Aul (Quota expansion)  : ${appliedCalculations.hasAul ? "YES" : "NO"}\n`;
      content += `Radd (Surplus recovery) : ${appliedCalculations.hasRadd ? "YES" : "NO"}\n`;
      content += `Gharrawain Principle    : ${appliedCalculations.hasGharrawain ? "YES" : "NO"}\n`;
      content += separator;
      content += "3. HEIRS ALLOCATION SPLIT\n";
      content += separator;
      
      heirs.forEach((h, i) => {
        content += `${i + 1}. [${h.category}] ${h.name}\n`;
        content += `   Original Quota   : ${h.originalShareText}\n`;
        content += `   Final Percentage : ${h.percentage}%\n`;
        content += `   Inheritance Value: ${formatIDR(h.nominalValue)}\n`;
        content += `   Jurisprudence    : ${h.notes}\n\n`;
      });
      
      content += separator;
      content += "4. LEGAL REFERENCES\n";
      content += separator;
      content += "- QS. An-Nisa (4:11): Direct male child receives twice the share of a direct female child.\n";
      content += "- Ushul Fiqh: Funeral rites, debts, and testament bequeaths must be fulfilled completely first.\n";
      content += "- Compilation of Islamic Law (KHI) standards of Supreme Court of Indonesia.\n";
      content += separator;
      content += "         This document is accurate and Sharia compliant\n";
      content += "                 Thank you for planning with Warisku\n";
      content += doubleSeparator;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Waris_Faraid_${nama_pewaris.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Pre-calculate SVG pie segments
  let accumulatedAngle = 0;

  const colorPalettes = [
    '#C5A059', // Antique Gold
    '#E5D5C5', // Premium Champagne
    '#A68D64', // Medium Soft Bronze
    '#8C7A5C', // Taupe Gold
    '#EAE6E1', // Platinum Offwhite
    '#775a19', // Deep Bronze
    '#594A34', // Dark Umber
    '#A4B7A4', // Sage Olive green
  ];

  // Map heirs to chart segments
  const chartSegments = heirs.map((h, index) => {
    const percentage = h.percentage;
    const angle = (percentage / 100) * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    return {
      name: h.name,
      percentage: h.percentage,
      nominal: h.nominalValue,
      color: colorPalettes[index % colorPalettes.length],
      startAngle,
      angle,
    };
  });

  // Calculate coordinates for SVG sector paths
  const getSectorPath = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
    innerR: number
  ) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const x1Inner = cx + innerR * Math.cos(startRad);
    const y1Inner = cy + innerR * Math.sin(startRad);
    const x2Inner = cx + innerR * Math.cos(endRad);
    const y2Inner = cy + innerR * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return `
      M ${x1} ${y1}
      A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x2Inner} ${y2Inner}
      A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}
      Z
    `.trim();
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-[#0c0d10] text-[#EAE6E1] min-h-screen py-10 px-4 sm:px-6 md:px-16 max-w-7xl mx-auto w-full font-sans print:py-2 print:bg-white relative">
      
      {/* Background Dots Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10 z-0 h-full w-full"
        style={{
          backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header Banner elements */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-[#C5A059]/15 pb-6 print:hidden z-10 relative">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#C5A059] tracking-wide uppercase font-mono mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            {t_strings.res_verified_badge}
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-[#EAE6E1]">
            {t_strings.res_report_title} <span className="text-[#C5A059] font-serif">{nama_pewaris}</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-[#16171a] hover:bg-[#C5A059]/15 text-[#EAE6E1] border border-[#C5A059]/25 text-xs font-bold font-mono transition-all uppercase tracking-wider cursor-pointer"
            title="Ganti Bahasa / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{lang === 'id' ? 'ID ⇄ EN' : 'EN ⇄ ID'}</span>
          </button>

          {/* New DOWNLOAD Button */}
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-white border border-slate-700 px-5 py-3 rounded-full active:scale-95 transition-all shadow-md cursor-pointer"
            title="Download report (.txt)"
          >
            <Download className="w-4 h-4 text-[#C5A059]" />
            <span>{t_strings.download_report_button}</span>
          </button>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 text-xs font-bold bg-[#16171a] text-[#EAE6E1] border border-[#C5A059]/25 px-5 py-3 rounded-full hover:bg-[#C5A059]/15 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#C5A059]" />
            {t_strings.res_btn_print}
          </button>

          <button 
            onClick={handleSave}
            disabled={isSaved}
            className={`flex items-center gap-2 text-xs font-bold px-5 py-3 rounded-full active:scale-95 transition-all shadow-sm cursor-pointer ${
              isSaved 
                ? 'bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/35' 
                : 'bg-gradient-to-r from-[#C5A059] to-[#E5D5C5] text-black hover:opacity-95'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                {t_strings.res_btn_saved_ok}
              </>
            ) : (
              <>
                <FolderHeart className="w-4 h-4 text-black" />
                {t_strings.res_btn_save}
              </>
            )}
          </button>

          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-xs font-bold text-[#EAE6E1] bg-[#16171a] hover:bg-[#16171a]/75 px-4 py-3 rounded-full border border-[#C5A059]/15 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t_strings.res_btn_recalc}
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start z-10 relative">
        
        {/* Left Side: Summary and breakdown (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Harta Bersih (Tirkah) Summary banner card */}
          <div className="bg-[#111215] text-[#EAE6E1] p-6 sm:p-8 rounded-[28px] shadow-2xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-[#C5A059]/25 border-l-4 border-l-[#C5A059]">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#C5A059]/10 to-transparent rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-mono font-black tracking-widest uppercase text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/25 px-3 py-1 rounded-full">
                {t_strings.res_tirkah_title}
              </span>
              <p className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-[#C5A059] font-serif">
                {formatIDR(tirkah)}
              </p>
              <p className="text-xs text-[#CFCAC4] font-sans max-w-[420px] leading-relaxed">
                {t_strings.res_tirkah_desc}
              </p>
            </div>

            <div className="relative z-10 bg-[#16171a]/90 backdrop-blur-md rounded-2xl p-4 border border-[#C5A059]/15 sm:w-64 w-full space-y-2.5 font-sans leading-relaxed text-xs">
              <div className="flex justify-between border-b border-[#C5A059]/15 pb-1.5 text-[#EAE6E1]">
                <span className="text-[#CFCAC4]">{t_strings.res_total_gross_assets}</span>
                <span className="font-mono font-bold">{formatIDR(financials.total_harta)}</span>
              </div>
              <div className="flex justify-between text-[#EAE6E1] pb-1 border-b border-[#C5A059]/10">
                <span className="text-[#CFCAC4]">{t_strings.res_debt}</span>
                <span className="font-mono">{formatIDR(financials.hutang)}</span>
              </div>
              <div className="flex justify-between text-[#EAE6E1] pb-1 border-b border-[#C5A059]/10">
                <span className="text-[#CFCAC4]">{t_strings.res_wills}</span>
                <span className="font-mono">{formatIDR(financials.wasiat)}</span>
              </div>
              <div className="flex justify-between text-[#EAE6E1]">
                <span className="text-[#CFCAC4]">{t_strings.res_funeral}</span>
                <span className="font-mono">{formatIDR(financials.biaya_pemakaman)}</span>
              </div>
            </div>
          </div>

          {/* Faraid Specific Principle Alerts if applicable */}
          {(appliedCalculations.hasAul || appliedCalculations.hasRadd || appliedCalculations.hasGharrawain) && (
            <div className="space-y-4 print:hidden">
              <h4 className="text-sm font-bold text-[#EAE6E1] font-serif flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                {t_strings.res_applied_kaidah}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {appliedCalculations.hasAul && (
                  <div className="bg-[#C5A059]/5 text-[#EAE6E1] border border-[#C5A059]/20 p-4 rounded-xl text-xs flex gap-3">
                    <div className="bg-[#C5A059]/10 p-2 rounded-lg h-8 w-8 flex items-center justify-center font-bold text-[#C5A059] border border-[#C5A059]/15">A</div>
                    <div>
                      <p className="font-bold mb-1 text-[#C5A059]">{t_strings.kaidah_aul_title}</p>
                      <p className="text-[#CFCAC4] leading-relaxed text-[11px]">{t_strings.kaidah_aul_desc}</p>
                    </div>
                  </div>
                )}
                {appliedCalculations.hasRadd && (
                  <div className="bg-[#C5A059]/5 text-[#EAE6E1] border border-[#C5A059]/20 p-4 rounded-xl text-xs flex gap-3">
                    <div className="bg-[#C5A059]/10 p-2 rounded-lg h-8 w-8 flex items-center justify-center font-bold text-[#C5A059] border border-[#C5A059]/15">R</div>
                    <div>
                      <p className="font-bold mb-1 text-[#C5A059]">{t_strings.kaidah_radd_title}</p>
                      <p className="text-[#CFCAC4] leading-relaxed text-[11px]">{t_strings.kaidah_radd_desc}</p>
                    </div>
                  </div>
                )}
                {appliedCalculations.hasGharrawain && (
                  <div className="bg-[#C5A059]/5 text-[#EAE6E1] border border-[#C5A059]/20 p-4 rounded-xl text-xs flex gap-3">
                    <div className="bg-[#C5A059]/10 p-2 rounded-lg h-8 w-8 flex items-center justify-center font-bold text-[#C5A059] border border-[#C5A059]/15">G</div>
                    <div>
                      <p className="font-bold mb-1 text-[#C5A059]">{t_strings.kaidah_gharrawain_title}</p>
                      <p className="text-[#CFCAC4] leading-relaxed text-[11px]">{t_strings.kaidah_gharrawain_desc}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Table detailed report */}
          <div className="bg-[#111215] border border-[#C5A059]/15 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#C5A059]/15 bg-[#16171a] flex items-center justify-between">
              <h3 className="font-bold text-[#EAE6E1] text-base font-serif">{t_strings.res_table_title}</h3>
              <span className="text-xs font-semibold px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] rounded-full border border-[#C5A059]/25">
                {heirs.length} {t_strings.res_table_active_heirs}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#111215] text-[11px] tracking-wider uppercase font-mono font-bold text-[#A69F96] border-b border-[#C5A059]/15">
                    <th className="py-4 px-5">{t_strings.table_col_name}</th>
                    <th className="py-4 px-4 text-center">{t_strings.table_col_category}</th>
                    <th className="py-4 px-4 text-center">{t_strings.table_col_share}</th>
                    <th className="py-4 px-4 text-center">{t_strings.table_col_pct}</th>
                    <th className="py-4 px-5 text-right w-44">{t_strings.table_col_nominal}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5A059]/10 text-sm">
                  {heirs.map((h, index) => (
                    <tr 
                      key={index} 
                      className={`hover:bg-[#16171a]/35 transition-all ${
                        hoveredSegment === index ? 'bg-[#C5A059]/10' : ''
                      }`}
                      onMouseEnter={() => setHoveredSegment(index)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    >
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <p className="font-bold text-[#EAE6E1]">{h.name}</p>
                          <p className="text-xs text-[#CFCAC4]/80 sm:max-w-[220px] leading-relaxed italic">{h.notes}</p>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full border ${
                          h.category === 'ASHABUL FURUD'
                            ? 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20'
                            : 'bg-[#C5A059]/20 text-[#E5D5C5] border-[#C5A059]/25'
                        }`}>
                          {h.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-mono text-xs font-bold text-[#A69F96]">
                        {h.originalShareText}
                      </td>

                      <td className="py-4 px-4 text-center text-[#EAE6E1] font-mono font-bold">
                        {h.percentage}%
                      </td>

                      <td className="py-4 px-5 text-right font-mono font-black text-[#C5A059] text-base">
                        {formatIDR(h.nominalValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive SVG Donut Chart and Trust Info (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: Distribusi Ahli Waris Donut Chart */}
          <div className="bg-[#111215] border border-[#C5A059]/15 p-6 sm:p-8 rounded-2xl shadow-2xl text-center">
            <h3 className="text-base font-bold font-serif text-[#EAE6E1] mb-6 text-left border-b border-[#C5A059]/15 pb-3">
              {t_strings.chart_distribution_title}
            </h3>

            {/* SVG custom donut */}
            <div className="relative w-56 h-56 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-9" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" fill="none" stroke="#16171a" strokeWidth="24" />
                {chartSegments.map((seg, idx) => {
                  if (seg.angle <= 0) return null;
                  return (
                    <path
                      key={idx}
                      d={getSectorPath(100, 100, 85, seg.startAngle, seg.startAngle + seg.angle, 60)}
                      fill={seg.color}
                      className="transition-all duration-300 cursor-pointer stroke-[#111215] stroke-[2px] hover:opacity-90"
                      style={{
                        transform: hoveredSegment === idx ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: '100px 100px',
                      }}
                      onMouseEnter={() => setHoveredSegment(idx)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />
                  );
                })}
              </svg>

              {/* Centered label inside donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
                {hoveredSegment !== null ? (
                  <>
                    <p className="text-[10px] text-[#CFCAC4] font-bold uppercase truncate max-w-[130px]">
                      {chartSegments[hoveredSegment].name}
                    </p>
                    <p className="text-lg font-mono font-black text-[#C5A059]">
                      {chartSegments[hoveredSegment].percentage}%
                    </p>
                    <p className="text-[10px] text-[#E5D5C5] font-semibold">
                      {formatIDR(chartSegments[hoveredSegment].nominal)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] text-[#CFCAC4] font-bold uppercase">
                      {t_strings.chart_total_title}
                    </p>
                    <p className="text-xl font-mono font-black text-[#C5A059]">
                      100%
                    </p>
                    <p className="text-[9px] text-[#E5D5C5] font-bold">
                      {t_strings.chart_full_share_ok}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Legends list */}
            <div className="space-y-2 text-left">
              {chartSegments.map((seg, idx) => (
                <div 
                  key={idx}
                  className={`flex justify-between items-center p-2 rounded-xl border text-xs cursor-pointer transition-all duration-200 ${
                    hoveredSegment === idx ? 'bg-[#C5A059]/15 border-[#C5A059]/40' : 'border-transparent'
                  }`}
                  onMouseEnter={() => setHoveredSegment(idx)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-3.5 h-3.5 rounded-lg shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="font-semibold text-gray-300 truncate">{seg.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[#C5A059]">{seg.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Metodologi & Fatwa */}
          <div className="bg-[#111215] border border-[#C5A059]/15 p-5 rounded-2xl shadow-2xl text-left space-y-4">
            <h4 className="text-sm font-bold text-[#C5A059] font-serif flex items-center gap-1.5 border-b border-[#C5A059]/15 pb-2">
              <BookOpen className="w-4 h-4 text-[#C5A059]" />
              {t_strings.fatwa_title}
            </h4>
            <div className="space-y-3.5 text-xs text-[#CFCAC4] leading-relaxed">
              <div className="flex gap-2 items-start">
                <ChevronRight className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <p>{t_strings.fatwa_an_nisa}</p>
              </div>
              <div className="flex gap-2 items-start">
                <ChevronRight className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <p>{t_strings.fatwa_ushul}</p>
              </div>
              <div className="flex gap-2 items-start bg-[#C5A059]/10 p-2.5 rounded-lg border border-[#C5A059]/20">
                <Award className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <p className="text-[#EAE6E1] font-bold text-[11px]">{t_strings.fatwa_khi}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
