/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const translations = {
  id: {
    // Navigation & Common
    app_title: "Warisku",
    home: "Beranda",
    calculator: "Kalkulator",
    why_us: "Mengapa Kami",
    methodology: "Metodologi KHI",
    login: "Masuk Akun",
    logout: "Keluar Akun",
    get_started: "Mulai Hitung",
    back_to_home: "Kembali ke Beranda",
    language_button: "Bahasa",
    calculating: "Sedang Menghitung...",
    
    // Landing Page
    hero_badge: "100% Sesuai Syariah",
    hero_title_1: "Waris Tanpa Ribet,",
    hero_title_2: "Berkah Bagi Keluarga.",
    hero_desc: "Platform modern perhitungan waris Islam (Faraid) yang akurat, transparan, dan dapat dipertanggungjawabkan secara syariah. Mudahkan pembagian amanah di ujung jari Anda.",
    btn_start: "Mulai Hitung Sekarang",
    btn_learn_flow: "Pelajari Alur",
    
    why_title: "Mengapa Memilih Warisku?",
    why_subtitle: "Kombinasi antara presisi hukum Faraid, standar Kompilasi Hukum Islam (KHI) Nasional, dan kemudahan teknologi modern.",
    feature_1_title: "Akurasi Sharia",
    feature_1_desc: "Algoritma dihitung presisi sesuai ketentuan Al-Qur'an (Surat An-Nisa), Hadits, Ijma, serta KHI di Indonesia.",
    feature_2_title: "Penyelesaian Aul & Radd",
    feature_2_desc: "Otomatis menyelesaikan kondisi khusus jika sisa harta surplus (Radd) atau porsi fardh melebihi harta (Aul).",
    feature_3_title: "Laporan PDF & Digital",
    feature_3_desc: "Unduh dan cetak rincian porsi dalam bentuk laporan tersertifikasi yang mudah dibagikan kepada keluarga.",
    feature_4_title: "Arsip Riwayat Cloud",
    feature_4_desc: "Simpan hasil kalkulasi secara aman di cloud dengan akun terdaftar untuk referensi di masa depan.",

    workflow_title: "Cara Kerja Perhitungan Waris",
    workflow_step_1: "Identitas Pewaris",
    workflow_step_1_desc: "Masukkan nama pewaris dan total nilai aset kotor.",
    workflow_step_2: "Kewajiban & Wasiat",
    workflow_step_2_desc: "Input pengurang aset seperti hutang, biaya tajhiz jenazah, dan wasiat.",
    workflow_step_3: "Daftar Ahli Waris",
    workflow_step_3_desc: "Tentukan relasi keluarga sedarah & pasangan yang berhak menerima.",
    workflow_step_4: "Bagi Sesuai Hukum",
    workflow_step_4_desc: "Sistem mengotomasi kalkulasi porsi & langsung unduh slip silsilah.",

    // Auth Page
    auth_welcome_title: "Selamat Datang di Warisku",
    auth_welcome_desc: "Masuk atau buat akun baru untuk menyimpan laporan analisis warisan sharia Anda ke cloud secara dinamis.",
    auth_tab_login: "Masuk",
    auth_tab_register: "Daftar Baru",
    auth_label_name: "Nama Lengkap",
    auth_label_email: "Alamat Email",
    auth_label_password: "Kata Sandi",
    auth_btn_login: "Masuk Sekarang (Google / Demo)",
    auth_btn_register: "Buat Akun Baru",
    auth_subtext_demo: "Gunakan data simulasi demo instan untuk mencobanya:",
    auth_demo_click: "Klik untuk Demo Akun",
    auth_error_google: "Gagal Menghubungkan Firebase Google Auth. Menggunakan Mode Demo.",
    auth_or: "ATAU",
    auth_sign_google: "Masuk dengan Akun Google",

    // Wizard Page
    wiz_title: "Sistem Informasi & Kalkulator Faraid",
    wiz_desc: "Lengkapi data di bawah ini dengan seksama. Seluruh kalkulasi berpedoman pada Al-Qur'an dan Kompilasi Hukum Islam (KHI).",
    
    step_1: "Data Pewaris & Nilai Harta",
    step_2: "Daftar Anggota Keluarga (Ahli Waris)",
    
    input_pewaris_name: "Nama Pewaris (Almarhum / Almarhumah)",
    input_pewaris_placeholder: "contoh: H. Ahmad Fauzi",
    input_harta: "Total Harta Kotor (Aset / Uang Tunai)",
    input_harta_help: "Jumlah seluruh nilai aset bergerak & tidak bergerak sebelum dikurangi hutang.",
    input_hutang: "Hutang Pewaris",
    input_hutang_help: "Seluruh tanggungan hutang wajib lunas sebelum dibagikan.",
    input_pemakaman: "Biaya Pengurusan Jenazah (Tajhiz)",
    input_pemakaman_help: "Biaya pembelian kain kafan, makam, pemandian, dll.",
    input_wasiat: "Wasiat Syar'i (Maksimal 1/3 Harta)",
    input_wasiat_help: "Sesuai ketentuan, wasiat tidak boleh melebihi sepertiga dari total harta kotor.",

    heirs_section_title: "Relasi Anggota Silsilah yang Hidup",
    heirs_section_desc: "Isi jumlah orang yang masih hidup untuk setiap kategori di bawah:",
    
    partner_title: "Suami / Istri (Pasangan)",
    descendants_title: "Keturunan Langsung (Anak)",
    parents_title: "Orang Tua Kandung",
    siblings_title: "Saudara Kandung Pewaris",

    gender_lk: "Laki-laki",
    gender_pr: "Perempuan",
    count_person: "Orang",

    btn_next: "Lanjutkan",
    btn_prev: "Kembali",
    btn_calculate_now: "Hitung Faraid & Bagi Selesai",

    // Results Page
    res_verified_badge: "Kalkulasi Sukses Terverifikasi Faraid",
    res_report_title: "Laporan Ahli Waris:",
    res_btn_print: "Unduh Laporan Word (.doc)",
    res_btn_save: "Simpan Ke Akun",
    res_btn_saved_ok: "Tersimpan di Akun",
    res_btn_recalc: "Kalkulasi Baru",
    
    res_tirkah_title: "HARTA BERSIH (TIRKAH)",
    res_tirkah_desc: "Aset bersih yang siap dibagikan ke ahli waris setelah dikurangi seluruh kewajiban jenazah & wasiat.",
    res_total_gross_assets: "Aset Kotor:",
    res_debt: "Hutang:",
    res_wills: "Wasiat Syar'i:",
    res_funeral: "Tajhiz Pemakaman:",
    
    res_applied_kaidah: "Kaidah Faraid yang Diterapkan",
    kaidah_aul_title: "Penyelesaian Aul",
    kaidah_aul_desc: "Total bagian fardh melebihi ketersediaan harta. Pembagi penyebut draf dikonversi naik secara proporsional demi kesetaraan porsi.",
    kaidah_radd_title: "Pengembalian Radd",
    kaidah_radd_desc: "Memiliki surplus sisa harta tanpa ashabah. Sisa dikembalikan penuh secara syariah kepada fardh selain suami / istri.",
    kaidah_gharrawain_title: "Kaidah Gharrawain",
    kaidah_gharrawain_desc: "Dua Kasus Khusus (Suami/Istri, Ibu & Ayah). Bagian ibu disesuaikan 1/3 dari sisa setelah bagian pasangan.",
    
    res_table_title: "Laporan Hasil Pembagian",
    res_table_active_heirs: "Ahli Waris Terdaftar",
    table_col_name: "Nama / Hubungan",
    table_col_category: "Golongan",
    table_col_share: "Porsi Awal",
    table_col_pct: "Persentase",
    table_col_nominal: "Nominal Selesa",
    
    chart_distribution_title: "Distribusi Bagian Ahli Waris",
    chart_total_title: "Total Bagian",
    chart_full_share_ok: "Harta Terbagi Habis",
    
    fatwa_title: "Kepatuhan Hukum Faraid",
    fatwa_an_nisa: "QS. An-Nisa (4:11): Bagian bagi keturunan laki-laki setara porsi dua bagian anak perempuan.",
    fatwa_ushul: "Ushul Fiqh: Hutang, wasiat, dan tajhil pemakaman wajib ditunaikan terlebih dahulu sebelum membagi.",
    fatwa_khi: "Metodologi Kompilasi Hukum Islam (KHI) sesuai Standardisasi Direktorat Peradilan Agama Mahkamah Agung RI.",
    
    // Download Feature
    download_report_button: "Unduh Dokumen Laporan (.txt)",
    download_success_message: "Laporan Faraid berhasil diunduh!",

    // History Dashboard
    history_title: "Riwayat Perhitungan Waris Anda",
    history_subtitle: "Simulasi Tersimpan",
    history_empty_title: "Belum Ada Perhitungan Tersimpan",
    history_empty_desc: "Simpan laporan silsilah Faraid anda untuk meninjau kembali bagian ashabul furudh dan ashabah keluarga tanpa perlu mengkalkulasi ulang.",
    history_start_calc: "Mulai Perhitungan Baru",
    history_col_tirkah: "Harta Bersih:",
    history_col_heirs: "Ahli Waris:",
    history_view_detail: "Lihat Detail Laporan",
    history_delete_tooltip: "Hapus Riwayat"
  },
  en: {
    // Navigation & Common
    app_title: "Warisku",
    home: "Home",
    calculator: "Calculator",
    why_us: "Why Us",
    methodology: "Methodology",
    login: "Login",
    logout: "Logout",
    get_started: "Get Started",
    back_to_home: "Back to Home",
    language_button: "Language",
    calculating: "Calculating...",

    // Landing Page
    hero_badge: "100% Sharia Compliant",
    hero_title_1: "Inheritance Made Easy,",
    hero_title_2: "Blessings for the Family.",
    hero_desc: "A modern, accurate, and transparent Islamic inheritance (Faraid) calculation platform, in full compliance with sharia guidelines. Secure your family's future at your fingertips.",
    btn_start: "Start Calculation Now",
    btn_learn_flow: "Learn the Workflow",

    why_title: "Why Choose Warisku?",
    why_subtitle: "A perfect blend of classical Faraid jurisprudence, national Compilation of Islamic Law (KHI) standards, and modern technology.",
    feature_1_title: "Sharia Accuracy",
    feature_1_desc: "Precision algorithms calculated in accordance with Quranic mandates (Surah An-Nisa), Hadith, Ijma, and KHI standards.",
    feature_2_title: "Aul & Radd Corrections",
    feature_2_desc: "Automatically resolves edge cases with surplus asset distribution (Radd) or when standard quotas exceed assets (Aul).",
    feature_3_title: "Certified Reports",
    feature_3_desc: "Download and print structured share breakdowns in standard, verifiable reports ready to share with family.",
    feature_4_title: "Secure Cloud History",
    feature_4_desc: "Safely store your inheritance calculations in our secure database for anytime access and revision.",

    workflow_title: "How the Calculation Works",
    workflow_step_1: "Deceased Info",
    workflow_step_1_desc: "Input the deceased person's name and total gross assets.",
    workflow_step_2: "Debts & Wills",
    workflow_step_2_desc: "Deduct essential liabilities such as funeral costs, debts, and bequest.",
    workflow_step_3: "Register Heirs",
    workflow_step_3_desc: "Specify all surviving blood relatives and spouses who qualify.",
    workflow_step_4: "Instant Distribution",
    workflow_step_4_desc: "Our engine solves the allocations instantly and generates downloadable files.",

    // Auth Page
    auth_welcome_title: "Welcome to Warisku",
    auth_welcome_desc: "Sign in or register a new account to save, search, and recall your Sharia inheritance records seamlessly in the cloud.",
    auth_tab_login: "Sign In",
    auth_tab_register: "Register",
    auth_label_name: "Full Name",
    auth_label_email: "Email Address",
    auth_label_password: "Password",
    auth_btn_login: "Sign In (Google / Demo)",
    auth_btn_register: "Register New Account",
    auth_subtext_demo: "Use our instant demo user credential to experiment:",
    auth_demo_click: "Click for Instant Demo Auto-Fill",
    auth_error_google: "Failed to connect to Firebase Google Auth. Switching to Demo Mode.",
    auth_or: "OR",
    auth_sign_google: "Sign in with Google Account",

    // Wizard Page
    wiz_title: "Islamic Faraid Calculator System",
    wiz_desc: "Please complete the details below carefully. All computations adhere strictly to the Holy Quran and national Compilation of Islamic Law (KHI).",

    step_1: "Deceased & Financial Data",
    step_2: "Surviving Heirs Registry",

    input_pewaris_name: "Deceased Person's Name",
    input_pewaris_placeholder: "example: Late Ahmad Fauzi",
    input_harta: "Total Gross Assets (Assets / Savings)",
    input_harta_help: "The sum of all mobile and estate assets before deductions are made.",
    input_hutang: "Outstanding Debts",
    input_hutang_help: "All deceased liabilities must be completely settled first.",
    input_pemakaman: "Funeral & Burial Expenses (Tajhiz)",
    input_pemakaman_help: "Costs for washing, shroud, grave, and standard procedures.",
    input_wasiat: "Syar'i Will / Bequest (Max 1/3 of Assets)",
    input_wasiat_help: "By law, the bequest cannot exceed one-third of the total gross assets.",

    heirs_section_title: "Surviving Household Relatives",
    heirs_section_desc: "Enter the number of surviving individuals for each category below:",

    partner_title: "Spouse (Husband / Wife)",
    descendants_title: "Direct Descendants (Children)",
    parents_title: "Biological Parents",
    siblings_title: "Surviving Siblings",

    gender_lk: "Male",
    gender_pr: "Female",
    count_person: "Person(s)",

    btn_next: "Continue",
    btn_prev: "Back",
    btn_calculate_now: "Solve & Show Faraid Report",

    // Results Page
    res_verified_badge: "Verified Faraid Calculation Success",
    res_report_title: "Heir Report For:",
    res_btn_print: "Download Word Doc (.doc)",
    res_btn_save: "Save to Account",
    res_btn_saved_ok: "Saved to Account",
    res_btn_recalc: "New Calculation",

    res_tirkah_title: "NET ESTATE VALUE (TIRKAH)",
    res_tirkah_desc: "The net estate ready for distribution among heirs after resolving funeral expenses, debts, and valid wills.",
    res_total_gross_assets: "Total Gross Assets:",
    res_debt: "Outstanding Debts:",
    res_wills: "Valid Bequest:",
    res_funeral: "Funeral Expenses:",

    res_applied_kaidah: "Applied Faraid Principles",
    kaidah_aul_title: "Aul Resolution (Quota Expansion)",
    kaidah_aul_desc: "Total Fardh quotas exceeded net assets. The divisor denominator is increased proportionally to guarantee absolute equity representation.",
    kaidah_radd_title: "Radd Resolution (Surplus Return)",
    kaidah_radd_desc: "A structural asset surplus exists with no universal Ashabah heirs. The excess is distributed to the non-spouse Fardh heirs.",
    kaidah_gharrawain_title: "Gharrawain Principle (Umariyyatain)",
    kaidah_gharrawain_desc: "Two special historic scenarios (Spouse, Mother, Father). Mother's allocation is adjusted to 1/3 of the remaining balance after spouse's division.",

    res_table_title: "Inheritance Allocation Summary",
    res_table_active_heirs: "surviving heirs listed",
    table_col_name: "Name / Relationship",
    table_col_category: "Classification",
    table_col_share: "Quoted Share",
    table_col_pct: "Percentage",
    table_col_nominal: "Net Inheritance",

    chart_distribution_title: "Surviving Heir Portions Distribution",
    chart_total_title: "Total Portions",
    chart_full_share_ok: "Estate Fully Distributed",

    fatwa_title: "Faraid Jurisprudence Adherence",
    fatwa_an_nisa: "QS. An-Nisa (4:11): Direct male child receives twice the share of a direct female child.",
    fatwa_ushul: "Ushul Fiqh: Funeral rites, debts, and testament bequeaths must be fulfilled completely first.",
    fatwa_khi: "Compilation of Islamic Law (KHI) methodology standardized under the Religious Court of Supreme Court of Indonesia.",

    // Download Feature
    download_report_button: "Download Report File (.txt)",
    download_success_message: "Faraid report successfully downloaded!",

    // History Dashboard
    history_title: "Your Inheritance Records",
    history_subtitle: "Simulations Archived",
    history_empty_title: "No Simulation Saved Yet",
    history_empty_desc: "Save your Faraid heir reports to securely review, re-evaluate, or share historical calculations at any time without starting from scratch.",
    history_start_calc: "Start New Calculation",
    history_col_tirkah: "Net Estate:",
    history_col_heirs: "Total Heirs:",
    history_view_detail: "Recall Report Detail",
    history_delete_tooltip: "Delete Simulation"
  }
};
