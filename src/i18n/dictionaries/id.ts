import type { Dictionary } from "./en";

/**
 * Indonesian dictionary — Bahasa Indonesia translations.
 * Shape mirrors the English dictionary exactly.
 */
const id: Dictionary = {
  // ─── Common / Shared ─────────────────────────────────────
  common: {
    appName: "Kraftalis",
    copyright: `© ${new Date().getFullYear()} Kraftalis. Hak cipta dilindungi.`,
    loading: "Memuat...",
    save: "Simpan",
    cancel: "Batal",
    edit: "Ubah",
    delete: "Hapus",
    close: "Tutup",
    search: "Cari",
    filter: "Filter",
    sortBy: "Urutkan",
    or: "ATAU",
    comingSoon: "Segera Hadir",
    tryAgain: "Coba lagi",
    reload: "Muat ulang",
  },

  // ─── Navigation / Sidebar ────────────────────────────────
  nav: {
    home: "Beranda",
    schedule: "Jadwal",
    event: "Acara",
    pricingPackage: "Harga",
    settings: "Pengaturan",
    main: "Utama",
    other: "Lainnya",
  },

  // ─── Topbar ──────────────────────────────────────────────
  topbar: {
    openSidebar: "Buka sidebar",
    searchPlaceholder: "Cari...",
    searchPlaceholderLong: "Cari halaman, acara, klien...",
    startTyping: "Mulai ketik untuk mencari...",
    noResults: "Tidak ada hasil untuk",
    tryDifferent: "Coba kata pencarian lain",
    navigate: "Navigasi",
    select: "Pilih",
  },

  // ─── Notifications ───────────────────────────────────────
  notifications: {
    title: "Notifikasi",
    markAllRead: "Tandai semua dibaca",
    noNotifications: "Tidak ada notifikasi",
    allCaughtUp: "Semua sudah terbaca!",
    viewAll: "Lihat semua notifikasi",
    welcomeTitle: "Selamat datang di Kraftalis!",
    welcomeMessage: "Akun Anda telah berhasil dibuat.",
    completeProfileTitle: "Lengkapi profil Anda",
    completeProfileMessage: "Tambahkan detail bisnis Anda untuk memulai.",
    justNow: "Baru saja",
    minutesAgo: "{count} menit lalu",
  },

  // ─── Profile Dropdown ────────────────────────────────────
  profileDropdown: {
    userMenu: "Menu pengguna",
    myProfile: "Profil Saya",
    settings: "Pengaturan",
    signOut: "Keluar",
    user: "Pengguna",
  },

  // ─── Dashboard / Home ────────────────────────────────────
  dashboard: {
    title: "Dasbor",
    welcomeBack: "Selamat datang kembali",
    hereIsOverview: "Berikut ringkasan Anda.",
    generateReports: "Buat Laporan",
    totalRevenue: "Total Pendapatan",
    totalEvents: "Total Acara",
    totalClients: "Total Klien",
    upcomingEvents: "Acara Mendatang",
    eventAnalytics: "Analitik Acara",
    month: "Bulan",
    week: "Minggu",
    year: "Tahun",
    noEventData: "Belum ada data acara",
    createFirstEvent: "Buat acara pertama Anda untuk melihat analitik di sini",
    clientDistribution: "Distribusi Klien",
    noClients: "Belum ada klien",
    clientsAfterBookings: "Klien akan muncul di sini setelah pemesanan",
    recentBookings: "Pemesanan Terbaru",
    no: "No",
    client: "Klien",
    package: "Paket",
    eventDate: "Tanggal Acara",
    status: "Status",
    amount: "Jumlah",
    actions: "Aksi",
    noBookings: "Belum ada pemesanan",
    bookingsAppearHere:
      "Saat klien memesan layanan Anda, mereka akan muncul di sini",
    quickActions: "Aksi Cepat",
    active: "Aktif",
    confirmed: "Dikonfirmasi",
    pending: "Menunggu",
    cancelled: "Dibatalkan",
    rescheduled: "Dijadwalkan Ulang",
    badgeVariants:
      "Ini adalah varian badge yang tersedia untuk status pemesanan.",
  },

  // ─── Profile Page ────────────────────────────────────────
  profile: {
    title: "Profil Saya",
    subtitle: "Kelola informasi pribadi dan pengaturan akun Anda.",
    profileUpdated: "Profil berhasil diperbarui!",
    changePhoto: "Ubah foto (segera hadir)",
    joined: "Bergabung",
    personalInfo: "Informasi Pribadi",
    fullName: "Nama Lengkap",
    emailAddress: "Alamat Email",
    enterFullName: "Masukkan nama lengkap Anda",
    emailCannotChange: "Email tidak dapat diubah.",
    saveChanges: "Simpan Perubahan",
    verified: "Terverifikasi",
    notVerified: "Belum terverifikasi",
    role: "Peran",
    accountSecurity: "Keamanan Akun",
    password: "Kata Sandi",
    passwordDesc: "Ubah kata sandi Anda untuk menjaga keamanan akun.",
    changePassword: "Ubah Kata Sandi",
    twoFactor: "Autentikasi Dua Faktor",
    twoFactorDesc: "Tambahkan lapisan keamanan ekstra ke akun Anda.",
    dangerZone: "Zona Bahaya",
    deleteAccount: "Hapus Akun",
    deleteAccountDesc:
      "Hapus akun Anda secara permanen beserta semua data terkait. Tindakan ini tidak dapat dibatalkan.",
  },

  // ─── Auth / Login ────────────────────────────────────────
  login: {
    signInTitle: "Masuk ke akun Anda",
    continueWithGoogle: "Lanjutkan dengan Google",
    email: "Email",
    emailPlaceholder: "anda@contoh.com",
    password: "Kata Sandi",
    passwordPlaceholder: "••••••••",
    signIn: "Masuk",
    signingIn: "Sedang masuk…",
    noAccount: "Belum punya akun?",
    signUp: "Daftar",
  },

  // ─── Auth / Sign Up ─────────────────────────────────────
  signup: {
    createTitle: "Buat akun Anda",
    continueWithGoogle: "Lanjutkan dengan Google",
    fullName: "Nama Lengkap",
    namePlaceholder: "John Doe",
    email: "Email",
    emailPlaceholder: "anda@contoh.com",
    password: "Kata Sandi",
    passwordPlaceholder: "••••••••",
    passwordHint: "Minimal 8 karakter",
    confirmPassword: "Konfirmasi Kata Sandi",
    createAccount: "Buat akun",
    creatingAccount: "Membuat akun…",
    alreadyHaveAccount: "Sudah punya akun?",
    signIn: "Masuk",
  },

  // ─── Verify Email ────────────────────────────────────────
  verifyEmail: {
    pageTitle: "Verifikasi Email — Kraftalis",
    pageDescription: "Verifikasi alamat email Anda",
    emailVerified: "Email terverifikasi!",
    emailVerifiedDesc:
      "Email Anda telah berhasil diverifikasi. Anda sekarang dapat masuk ke akun Anda.",
    signInToAccount: "Masuk ke akun Anda",
    linkExpired: "Tautan kedaluwarsa",
    linkExpiredDesc:
      "Tautan verifikasi ini telah kedaluwarsa. Silakan daftar lagi untuk menerima email verifikasi baru.",
    signUpAgain: "Daftar lagi",
    invalidLink: "Tautan tidak valid",
    invalidLinkDesc:
      "Tautan verifikasi ini tidak valid atau sudah pernah digunakan.",
  },

  // ─── Error Page ──────────────────────────────────────────
  error: {
    somethingWentWrong: "Terjadi kesalahan",
  },

  // ─── Event Page (Vendor) ─────────────────────────────────
  event: {
    title: "Acara",
    subtitle: "Kelola semua acara pemesanan Anda.",
    createEvent: "Buat Acara",
    generateLink: "Buat Link Booking",
    searchPlaceholder: "Cari klien, jenis acara...",
    allStatuses: "Semua Status",
    allPayments: "Semua Pembayaran",
    noEvents: "Belum ada acara",
    noEventsDesc: "Buat acara atau buat link booking untuk memulai.",
    noMatchingEvents: "Tidak ada acara yang cocok",
    noMatchingEventsDesc: "Coba sesuaikan pencarian atau filter Anda.",

    // Stats
    totalEvents: "Total Acara",
    upcoming: "Mendatang",
    confirmed: "Dikonfirmasi",
    revenue: "Pendapatan",
    thisMonth: "bulan ini",

    // View modes
    listView: "Daftar",
    kanbanView: "Papan",

    // Table columns
    colEventDate: "Tanggal Acara",
    colClientName: "Nama Klien",
    colEventType: "Jenis Acara",
    colPackage: "Paket",
    colPaymentStatus: "Pembayaran",
    colEventStatus: "Status",
    colActions: "Aksi",
    colAmount: "Nominal",

    // Event statuses
    statusInquiry: "Permintaan",
    statusWaitingPayment: "Menunggu Pembayaran",
    statusConfirmed: "Dikonfirmasi",
    statusOngoing: "Berlangsung",
    statusCompleted: "Selesai",

    // Payment statuses
    paymentUnpaid: "Belum Bayar",
    paymentDpPaid: "DP Dibayar",
    paymentPaid: "Lunas",

    // Actions
    view: "Lihat",
    edit: "Ubah",

    // Kanban
    kanbanNoEvents: "Tidak ada acara di tahap ini",
    kanbanDragHint: "Seret kartu untuk memindahkan antar tahap",

    // Loading
    loading: "Memuat acara...",
    errorLoading: "Gagal memuat acara.",
    retry: "Coba Lagi",
  },

  // ─── Active Offerings ────────────────────────────────────
  activeOfferings: {
    title: "Penawaran Aktif",
    subtitle: "Booking link menunggu pembayaran klien",
    noOfferings: "Tidak ada penawaran aktif",
    noOfferingsDesc:
      "Booking link yang menunggu pembayaran akan muncul di sini.",
    expiresIn: "Berakhir dalam",
    expired: "Kedaluwarsa",
    days: "hari",
    hours: "jam",
    minutes: "menit",
    copyLink: "Salin Link",
    copied: "Tersalin!",
    editOffer: "Edit Penawaran",
    deleteOffer: "Hapus Penawaran",
    shareWhatsApp: "Bagikan via WhatsApp",
    viewLink: "Lihat Halaman Booking",
    packageLabel: "Paket",
    addOnsLabel: "Add-ons",
    totalLabel: "Total",
    confirmDeleteTitle: "Klik lagi untuk konfirmasi hapus",
    confirmDeleteDesc: "Tindakan ini tidak dapat dibatalkan.",
    deleteLabel: "Hapus",
    cancelLabel: "Batal",
  },

  // ─── Event Detail Page ───────────────────────────────────
  eventDetail: {
    backToEvents: "Kembali ke Acara",
    clientInfo: "Informasi Klien",
    clientName: "Nama Lengkap",
    clientPhone: "Nomor Telepon",
    clientEmail: "Email",
    eventInfo: "Informasi Acara",
    eventType: "Jenis Acara",
    eventDate: "Tanggal Acara",
    eventTime: "Waktu Acara",
    eventLocation: "Lokasi",
    packageInfo: "Paket",
    packageName: "Paket Dipilih",
    addOns: "Tambahan",
    paymentInfo: "Pembayaran",
    paymentStatus: "Status Pembayaran",
    totalAmount: "Total",
    dpAmount: "Jumlah DP",
    remainingBalance: "Sisa Pembayaran",
    notes: "Catatan",
    noNotes: "Tidak ada catatan tambahan.",
    editEvent: "Ubah Acara",
    updateStatus: "Perbarui Status",
    saveChanges: "Simpan Perubahan",

    // Payment tracking
    paymentProgress: "Progres Pembayaran",
    paidOf: "dibayar dari",
    addPayment: "Tambah Pembayaran",
    paymentRecords: "Riwayat Pembayaran",
    noPaymentsYet: "Belum ada pembayaran tercatat.",
    noPaymentsDesc: "Pembayaran dari klien Anda akan muncul di sini.",
    receiptUploaded: "Bukti terupload",
    noReceipt: "Tanpa bukti",
    verifyPayment: "Verifikasi",
    rejectPayment: "Tolak",
    paymentVerified: "Pembayaran berhasil diverifikasi!",
    paymentRejected: "Pembayaran ditolak.",
    viewReceipt: "Lihat Bukti",
    amountLabel: "Jumlah",
    typeLabel: "Jenis",
    dateLabel: "Tanggal",
    statusLabel: "Status",
    receiptLabel: "Bukti",
    actionLabel: "Aksi",
  },

  // ─── Generate Booking Link Modal ─────────────────────────
  bookingLink: {
    // Step 1 — configure
    configTitle: "Buat Link Booking",
    editTitle: "Edit Link Booking",
    configDesc:
      "Opsional: isi nama klien dan pilih paket & add-on yang akan ditawarkan sebelum link dibagikan.",
    clientNameLabel: "Nama Klien (opsional)",
    clientNamePlaceholder: "cth. Budi Santoso",
    selectPackageLabel: "Paket (opsional)",
    noPackageOption: "Biarkan klien memilih dari semua paket",
    selectVariationLabel: "Variasi",
    customPackageLabel: "Atau buat paket khusus untuk klien ini",
    customPackageName: "Nama Paket Khusus",
    customPackageNamePlaceholder: "cth. Custom Wedding Shoot",
    customVariationsTitle: "Variasi / Tingkatan Harga",
    customVariationHint: "Biarkan kosong untuk menggunakan harga tunggal.",
    customFlatPrice: "Harga Satuan",
    addCustomVariation: "Tambah Variasi",
    selectAddOnsLabel: "Add-on yang ditawarkan (opsional)",
    generateButton: "Buat Link",
    generating: "Membuat…",
    updateLink: "Perbarui Link Booking",
    // Step 2 — result
    modalTitle: "Link Booking Siap",
    modalDesc:
      "Bagikan link ini ke klien agar mereka bisa mengisi detail booking.",
    copyLink: "Salin Link",
    copied: "Tersalin!",
    shareWhatsApp: "Bagikan via WhatsApp",
    linkExpiry: "Link ini kedaluwarsa dalam 7 hari.",
  },

  // ─── Create Event Modal ──────────────────────────────────
  createEventModal: {
    title: "Buat Acara Baru",
    clientName: "Nama Klien",
    clientNamePlaceholder: "Masukkan nama klien",
    clientPhone: "Nomor Telepon",
    clientPhonePlaceholder: "+62...",
    clientEmail: "Email (opsional)",
    clientEmailPlaceholder: "klien@contoh.com",
    eventType: "Jenis Acara",
    selectEventType: "Pilih jenis acara",
    eventDate: "Tanggal Acara",
    eventTime: "Waktu Acara (opsional)",
    eventLocation: "Lokasi (opsional)",
    eventLocationPlaceholder: "Alamat tempat acara",
    packageName: "Paket (opsional)",
    packagePlaceholder: "cth. Paket Gold",
    notes: "Catatan (opsional)",
    notesPlaceholder: "Catatan tambahan...",
    creating: "Membuat...",
    create: "Buat Acara",
  },

  // ─── Public Booking Form ─────────────────────────────────
  booking: {
    pageTitle: "Booking dengan",
    pageSubtitle: "Silakan isi detail booking Anda di bawah ini.",

    // Sections
    clientInfoTitle: "Informasi Klien",
    eventInfoTitle: "Informasi Acara",
    packageTitle: "Pilihan Paket",
    addOnsTitle: "Tambahan",
    notesTitle: "Catatan Tambahan",
    paymentTitle: "Pembayaran",
    eventStatusTitle: "Status Acara",

    // Fields
    fullName: "Nama Lengkap",
    fullNamePlaceholder: "Nama lengkap Anda",
    phone: "Nomor Telepon",
    phonePlaceholder: "+62...",
    email: "Email (opsional)",
    emailPlaceholder: "anda@contoh.com",
    eventType: "Jenis Acara",
    selectEventType: "Pilih jenis acara",
    eventDate: "Tanggal Acara",
    eventTime: "Waktu Acara (opsional)",
    eventLocation: "Lokasi Acara",
    eventLocationPlaceholder: "Di mana acara akan diadakan?",
    packageSelect: "Paket",
    selectPackage: "Pilih paket",
    addOns: "Tambahan",
    addOnsPlaceholder: "cth. Jam tambahan, photo booth...",
    notesPlaceholder: "Permintaan atau detail khusus...",

    // Event type options
    typeWedding: "Pernikahan",
    typeEngagement: "Pertunangan",
    typeBirthday: "Ulang Tahun",
    typeGraduation: "Wisuda",
    typeCorporate: "Acara Perusahaan",
    typeOther: "Lainnya",

    // Submit
    submitting: "Mengirim...",
    submitBooking: "Kirim Booking",

    // Success
    successTitle: "Permintaan Booking Terkirim!",
    successMessage:
      "Permintaan booking Anda telah dikirim ke vendor. Vendor akan segera menghubungi Anda untuk mengkonfirmasi booking.",
    close: "Tutup",

    // Errors
    linkExpired: "Link booking ini sudah kedaluwarsa.",
    linkUsed: "Link booking ini sudah pernah digunakan.",
    linkInvalid: "Link booking ini tidak valid.",
    goHome: "Ke halaman utama",

    // Client portal
    portalTitle: "Booking Anda",
    portalSubtitle: "Pantau status booking dan progres pembayaran Anda.",
    statusTracker: "Status",
    packageDetails: "Detail Paket",
    selectedAddOns: "Tambahan Terpilih",
    paymentHistory: "Riwayat Pembayaran",
    uploadReceipt: "Upload Bukti Pembayaran",
    uploadReceiptDesc: "Upload bukti pembayaran Anda (bukti transfer).",
    paymentAmount: "Jumlah Pembayaran",
    paymentType: "Jenis Pembayaran",
    paymentNote: "Catatan (opsional)",
    paymentNotePlaceholder: "cth. DP transfer via BCA",
    selectFile: "Pilih file",
    noFileSelected: "Belum ada file dipilih",
    uploading: "Mengupload...",
    submitPayment: "Kirim Pembayaran",
    paymentSubmitted: "Bukti pembayaran terkirim! Menunggu verifikasi vendor.",
    noPayments: "Belum ada pembayaran tercatat.",
    verified: "Terverifikasi",
    pending: "Menunggu",
    dpPayment: "Uang Muka (DP)",
    fullPayment: "Pelunasan",
    installment: "Cicilan",
    totalAmount: "Total",
    totalPaid: "Total Dibayar",
    remaining: "Sisa",
    qty: "Jml",
    perUnit: "/ unit",

    // Client portal — event home
    portalWelcome: "Selamat datang di portal acara Anda",
    portalWelcomeDesc:
      "Pantau status acara, lihat detail, dan kelola pembayaran — semua di satu tempat.",
    portalEventDetails: "Detail Acara",
    portalYourPackage: "Paket Anda",
    portalYourAddOns: "Tambahan Anda",
    portalPayments: "Pembayaran",
    portalNoPackage: "Belum ada paket dipilih.",
    portalNoAddOns: "Belum ada tambahan dipilih.",
    portalStatusStep: "Langkah {current} dari {total}",
    portalContactVendor: "Hubungi Vendor",
    portalEventDate: "Tanggal Acara",
    portalEventTime: "Waktu",
    portalEventLocation: "Lokasi",
    portalEventType: "Jenis Acara",
    portalViewReceipt: "Lihat",
    portalUploadReceipt: "Upload Bukti Pembayaran",
    portalPaymentSent: "Bukti pembayaran terkirim! Menunggu verifikasi vendor.",
    portalIncluded: "Termasuk",

    // Booking form — package & payment step
    stepClientInfo: "Data Diri",
    stepPackage: "Paket",
    stepEvent: "Acara",
    stepPayment: "Pembayaran",
    selectPackageTitle: "Pilih Paket",
    selectPackageDesc: "Pilih paket yang paling sesuai untuk acara Anda.",
    packageIncludes: "Termasuk:",
    selectedLabel: "Dipilih",
    selectLabel: "Pilih",
    selectVariation: "Pilih variasi",
    variationRequired: "Silakan pilih variasi untuk melanjutkan.",
    addOnsOptional: "Tambahan (opsional)",
    addOnsOptionalDesc: "Tambahkan layanan ekstra untuk paket Anda.",
    perItem: "/ item",
    added: "Ditambahkan",
    add: "Tambah",
    dpPaymentTitle: "Uang Muka (DP)",
    dpPaymentDesc: "Bayar uang muka untuk mengkonfirmasi booking Anda.",
    dpAmountLabel: "Jumlah DP",
    dpAmountPlaceholder: "Masukkan jumlah DP",
    minimumDp: "Minimum DP: {amount}",
    receiptUploadTitle: "Upload Bukti Pembayaran",
    receiptUploadDesc: "Lampirkan bukti transfer sebagai bukti pembayaran.",
    receiptLabel: "Bukti Transfer",
    dragOrClick: "Klik untuk memilih atau seret file ke sini",
    acceptedFormats: "JPG, PNG atau PDF (maks 5MB)",
    changeFile: "Ganti file",
    orderSummary: "Ringkasan Pesanan",
    packageLabel: "Paket",
    addOnsLabel: "Tambahan",
    dpLabel: "Uang Muka",
    grandTotal: "Total Keseluruhan",
    free: "Gratis",

    // Single-view checkout
    checkoutSubtitle: "Tinjau detail booking dan konfirmasi pembayaran.",
    vendorLabel: "Vendor",
    editInfo: "Ubah",
    cancelEdit: "Batal",
    eventSummaryTitle: "Detail Acara",
    subtotalLabel: "Subtotal Paket",
    addOnsTotalLabel: "Subtotal Tambahan",
    confirmAndPay: "Konfirmasi & Bayar",
    processing: "Memproses...",
  },

  // ─── Pricing & Package Page (Vendor) ─────────────────────
  pricing: {
    title: "Harga & Paket",
    subtitle: "Tentukan paket layanan dan tambahan agar klien bisa memilih.",

    // Packages section
    packagesTitle: "Paket",
    addPackage: "Tambah Paket",
    editPackage: "Ubah Paket",
    noPackages: "Belum ada paket",
    noPackagesDesc: "Buat paket pertama Anda untuk ditampilkan ke klien.",
    packageName: "Nama Paket",
    packageNamePlaceholder: "cth. Wisuda Photoshoot, Paket Gold",
    packageDescription: "Deskripsi (opsional)",
    packageDescPlaceholder: "Deskripsi singkat yang ditampilkan ke klien",
    activePackage: "Aktif (terlihat oleh klien)",

    // Variations
    variationsTitle: "Variasi Harga",
    inclusionsTitle: "Termasuk",
    variationsHint:
      "Tambahkan variasi jika paket ini memiliki beberapa pilihan harga (cth. berdasarkan jumlah orang, durasi, atau lingkup pekerjaan). Biarkan kosong untuk harga satuan.",
    addVariation: "Tambah Variasi",
    variationLabel: "Nama Variasi",
    variationLabelPlaceholder: "cth. 2 Orang – 1 Jam, Pengantin, 100 Pax",
    variationDescription: "Detail (opsional)",
    variationDescPlaceholder:
      "cth. termasuk edit tak terbatas, soft file via GDrive",
    variationPrice: "Harga",
    noVariations: "Harga tunggal",
    flatPrice: "Harga Satuan",
    flatPriceHint: "Digunakan jika tidak ada variasi harga.",
    currency: "Mata Uang",

    // Add-ons section
    addOnsTitle: "Tambahan",
    addAddOn: "Tambah Add-on",
    editAddOn: "Ubah Add-on",
    noAddOns: "Belum ada tambahan",
    noAddOnsDesc: "Buat tambahan yang bisa dipilih klien saat booking.",
    addOnName: "Nama Tambahan",
    addOnNamePlaceholder: "cth. Tambahan 1 jam, Photo booth",
    addOnDescription: "Deskripsi (opsional)",
    addOnDescPlaceholder: "Deskripsi singkat",
    addOnPrice: "Harga",
    activeAddOn: "Aktif (tersedia untuk booking)",

    // Table columns
    colName: "Nama",
    colDescription: "Deskripsi",
    colPrice: "Harga",
    colStatus: "Status",
    colActions: "Aksi",

    // States
    active: "Aktif",
    archived: "Diarsipkan",
    confirmDelete: "Konfirmasi?",
    startingFrom: "mulai dari",
  },

  // ─── Schedule Page ───────────────────────────────────────
  schedule: {
    title: "Jadwal",
    subtitle: "Lihat dan kelola jadwal acara Anda di kalender.",

    // View toggles
    calendarView: "Kalender",
    listView: "Agenda",

    // Quick actions
    createBooking: "Buat Booking",

    // Calendar navigation
    today: "Hari Ini",
    previousMonth: "Bulan sebelumnya",
    nextMonth: "Bulan berikutnya",

    // Weekday headers (short)
    sun: "Min",
    mon: "Sen",
    tue: "Sel",
    wed: "Rab",
    thu: "Kam",
    fri: "Jum",
    sat: "Sab",

    // Month names
    months:
      "Januari,Februari,Maret,April,Mei,Juni,Juli,Agustus,September,Oktober,November,Desember",

    // Day detail
    eventsOnDay: "Acara pada hari ini",
    noEventsOnDay: "Tidak ada acara pada hari ini.",
    noUpcoming: "Tidak ada acara mendatang",
    noUpcomingDesc:
      "Jadwal Anda kosong. Acara akan muncul di sini setelah dibooking.",

    // Agenda list
    upcoming: "Mendatang",
    past: "Selesai",
    allEvents: "Semua Acara",
    daysAway: "hari lagi",
    daysAgo: "hari lalu",
    tomorrow: "Besok",
    yesterday: "Kemarin",
  },

  // ─── Settings ────────────────────────────────────────────
  settings: {
    title: "Pengaturan",
    subtitle: "Kelola pengaturan aplikasi dan data master.",
    categoriesTitle: "Kategori Layanan",
    categoriesSubtitle:
      "Kelola kategori dan subkategori layanan untuk paket Anda.",
    addCategory: "Tambah Kategori",
    editCategory: "Edit Kategori",
    categoryName: "Nama Kategori",
    categoryNamePlaceholder: "mis. Photography",
    categoryDescription: "Deskripsi",
    categoryDescPlaceholder: "Deskripsi singkat kategori ini",
    subcategories: "Subkategori",
    addSubcategory: "Tambah Subkategori",
    subcategoryName: "Nama Subkategori",
    subcategoryNamePlaceholder: "mis. Pre-Wedding",
    subcategoryDescription: "Deskripsi",
    subcategoryDescPlaceholder: "Deskripsi singkat",
    noCategories: "Belum ada kategori",
    noCategoriesDesc: "Buat kategori layanan pertama Anda untuk memulai.",
    noSubcategories: "Belum ada subkategori",
    noSubcategoriesDesc: "Tambahkan subkategori untuk mengatur layanan Anda.",
    confirmDeleteCategory: "Hapus kategori ini?",
    confirmDeleteSubcategory: "Hapus?",
    active: "Aktif",
    archived: "Nonaktif",
  },
};

export default id;
