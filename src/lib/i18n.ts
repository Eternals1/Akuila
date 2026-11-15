import { Language, LocalizedString } from '../types';

export const translations: Record<string, LocalizedString> = {
  // Navigation
  'nav.home': { id: 'Beranda', en: 'Home' },
  'nav.catalog': { id: 'Katalog', en: 'Catalog' },
  'nav.dashboard': { id: 'Dasbor', en: 'Dashboard' },
  'nav.login': { id: 'Masuk', en: 'Login' },
  'nav.register': { id: 'Daftar', en: 'Register' },
  'nav.logout': { id: 'Keluar', en: 'Logout' },
  
  // Auth
  'auth.login.title': { id: 'Masuk ke Akun Anda', en: 'Sign In to Your Account' },
  'auth.login.email': { id: 'Alamat Email', en: 'Email Address' },
  'auth.login.password': { id: 'Kata Sandi', en: 'Password' },
  'auth.login.submit': { id: 'Masuk', en: 'Sign In' },
  'auth.login.noAccount': { id: 'Belum punya akun?', en: "Don't have an account?" },
  'auth.login.forgotPassword': { id: 'Lupa kata sandi?', en: 'Forgot password?' },
  'auth.register.title': { id: 'Buat Akun Baru', en: 'Create New Account' },
  'auth.register.name': { id: 'Nama Lengkap', en: 'Full Name' },
  'auth.register.confirmPassword': { id: 'Konfirmasi Kata Sandi', en: 'Confirm Password' },
  'auth.register.submit': { id: 'Daftar Sekarang', en: 'Register Now' },
  'auth.register.hasAccount': { id: 'Sudah punya akun?', en: 'Already have an account?' },
  'auth.forgot.title': { id: 'Lupa Kata Sandi', en: 'Forgot Password' },
  'auth.forgot.description': { id: 'Masukkan email Anda dan kami akan mengirimkan tautan untuk mereset kata sandi.', en: 'Enter your email and we\'ll send you a link to reset your password.' },
  'auth.forgot.submit': { id: 'Kirim Tautan Reset', en: 'Send Reset Link' },
  'auth.forgot.success': { id: 'Tautan reset telah dikirim ke email Anda!', en: 'Reset link has been sent to your email!' },
  'auth.forgot.backToLogin': { id: 'Kembali ke halaman masuk', en: 'Back to login' },
  
  // Landing
  'landing.hero.title': { id: 'Ciptakan Momen Spesial\nDalam Satu Klik', en: 'Create Special Moments\nIn One Click' },
  'landing.hero.subtitle': { id: 'Platform pembuat micro-site premium untuk undangan pernikahan, kartu ucapan, dan hadiah personal yang indah dan interaktif.', en: 'Premium micro-site builder for beautiful and interactive wedding invitations, greeting cards, and personal gifts.' },
  'landing.hero.cta': { id: 'Mulai Sekarang', en: 'Get Started' },
  'landing.hero.explore': { id: 'Jelajahi Katalog', en: 'Explore Catalog' },
  
  // Catalog
  'catalog.title': { id: 'Katalog Templat', en: 'Template Catalog' },
  'catalog.subtitle': { id: 'Pilih templat sempurna untuk momen spesial Anda', en: 'Choose the perfect template for your special moment' },
  'catalog.all': { id: 'Semua', en: 'All' },
  'catalog.wedding': { id: 'Pernikahan', en: 'Wedding' },
  'catalog.greeting': { id: 'Kartu Ucapan', en: 'Greeting Card' },
  'catalog.gift': { id: 'Hadiah', en: 'Gift' },
  'catalog.search': { id: 'Cari templat...', en: 'Search templates...' },
  'catalog.choose': { id: 'Pilih Templat', en: 'Choose Template' },
  'catalog.preview': { id: 'Pratinjau', en: 'Preview' },
  'catalog.startingFrom': { id: 'Mulai dari', en: 'Starting from' },
  'catalog.discount': { id: 'HEMAT', en: 'SAVE' },
  
  // Customize
  'customize.title': { id: 'Kustomisasi', en: 'Customize' },
  'customize.subtitle': { id: 'Sesuaikan templat sesuai keinginan Anda', en: 'Personalize the template to your liking' },
  'customize.uploadPhoto': { id: 'Unggah Foto', en: 'Upload Photo' },
  'customize.dragDrop': { id: 'Seret & lepas atau klik untuk mengunggah', en: 'Drag & drop or click to upload' },
  'customize.chooseAudio': { id: 'Pilih Lagu', en: 'Choose Song' },
  'customize.colorScheme': { id: 'Skema Warna', en: 'Color Scheme' },
  'customize.font': { id: 'Jenis Huruf', en: 'Font' },
  'customize.next': { id: 'Lanjutkan', en: 'Continue' },
  'customize.back': { id: 'Kembali', en: 'Back' },
  'customize.preview': { id: 'Pratinjau', en: 'Preview' },
  
  // Personalize
  'personalize.title': { id: 'Personalisasi', en: 'Personalization' },
  'personalize.urlSlug': { id: 'Tautan Kustom', en: 'Custom Link' },
  'personalize.urlPlaceholder': { id: 'nama-unik-anda', en: 'your-unique-name' },
  'personalize.urlAvailable': { id: 'Tautan tersedia!', en: 'Link is available!' },
  'personalize.urlTaken': { id: 'Tautan sudah digunakan', en: 'Link is already taken' },
  'personalize.qrCode': { id: 'QR Code', en: 'QR Code' },
  'personalize.qrShape': { id: 'Bentuk QR', en: 'QR Shape' },
  'personalize.qrColor': { id: 'Warna QR', en: 'QR Color' },
  'personalize.download': { id: 'Unduh QR Code', en: 'Download QR Code' },
  
  // Preview
  'preview.title': { id: 'Pratinjau Langsung', en: 'Live Preview' },
  'preview.desktop': { id: 'Desktop', en: 'Desktop' },
  'preview.tablet': { id: 'Tablet', en: 'Tablet' },
  'preview.mobile': { id: 'Mobile', en: 'Mobile' },
  'preview.edit': { id: 'Edit', en: 'Edit' },
  'preview.proceed': { id: 'Lanjut ke Pembayaran', en: 'Proceed to Payment' },
  
  // Payment
  'payment.title': { id: 'Pembayaran', en: 'Payment' },
  'payment.orderSummary': { id: 'Ringkasan Pesanan', en: 'Order Summary' },
  'payment.method': { id: 'Metode Pembayaran', en: 'Payment Method' },
  'payment.qris': { id: 'QRIS', en: 'QRIS' },
  'payment.bankTransfer': { id: 'Transfer Bank', en: 'Bank Transfer' },
  'payment.ewallet': { id: 'E-Wallet', en: 'E-Wallet' },
  'payment.creditCard': { id: 'Kartu Kredit', en: 'Credit Card' },
  'payment.pay': { id: 'Bayar Sekarang', en: 'Pay Now' },
  'payment.processing': { id: 'Memproses...', en: 'Processing...' },
  'payment.total': { id: 'Total', en: 'Total' },
  'payment.expires': { id: 'Batas waktu pembayaran', en: 'Payment expires in' },
  
  // Success
  'success.title': { id: 'Pembayaran Berhasil!', en: 'Payment Successful!' },
  'success.subtitle': { id: 'Website Anda telah dipublikasikan dan siap dibagikan', en: 'Your website has been published and is ready to share' },
  'success.yourLink': { id: 'Tautan Website Anda', en: 'Your Website Link' },
  'success.copyLink': { id: 'Salin Tautan', en: 'Copy Link' },
  'success.copied': { id: 'Tersalin!', en: 'Copied!' },
  'success.downloadQR': { id: 'Unduh QR Code', en: 'Download QR Code' },
  'success.share': { id: 'Bagikan', en: 'Share' },
  'success.dashboard': { id: 'Ke Dasbor', en: 'Go to Dashboard' },
  
  // Dashboard
  'dashboard.title': { id: 'Dasbor Saya', en: 'My Dashboard' },
  'dashboard.createNew': { id: 'Buat Baru', en: 'Create New' },
  'dashboard.mySites': { id: 'Website Saya', en: 'My Websites' },
  'dashboard.noSites': { id: 'Anda belum membuat website. Mulai sekarang!', en: "You haven't created any websites yet. Start now!" },
  'dashboard.views': { id: 'Dilihat', en: 'Views' },
  'dashboard.status.draft': { id: 'Draf', en: 'Draft' },
  'dashboard.status.pending': { id: 'Menunggu Pembayaran', en: 'Pending Payment' },
  'dashboard.status.published': { id: 'Terpublikasi', en: 'Published' },
  'dashboard.actions.edit': { id: 'Edit', en: 'Edit' },
  'dashboard.actions.preview': { id: 'Pratinjau', en: 'Preview' },
  'dashboard.actions.share': { id: 'Bagikan', en: 'Share' },
  'dashboard.actions.delete': { id: 'Hapus', en: 'Delete' },
  
  // Common
  'common.loading': { id: 'Memuat...', en: 'Loading...' },
  'common.save': { id: 'Simpan', en: 'Save' },
  'common.cancel': { id: 'Batal', en: 'Cancel' },
  'common.delete': { id: 'Hapus', en: 'Delete' },
  'common.confirm': { id: 'Konfirmasi', en: 'Confirm' },
  'common.or': { id: 'atau', en: 'or' },
  'common.basic': { id: 'Basic', en: 'Basic' },
  'common.premium': { id: 'Premium', en: 'Premium' },
  'common.exclusive': { id: 'Eksklusif', en: 'Exclusive' },
  
  // Pricing
  'pricing.title': { id: 'Harga Terjangkau', en: 'Affordable Pricing' },
  'pricing.subtitle': { id: 'Pilih paket yang sesuai dengan kebutuhan Anda', en: 'Choose the package that fits your needs' },
  'pricing.basic.name': { id: 'Basic', en: 'Basic' },
  'pricing.basic.price': { id: 'Rp 39.900', en: 'Rp 39,900' },
  'pricing.basic.original': { id: 'Rp 79.000', en: 'Rp 79,000' },
  'pricing.premium.name': { id: 'Premium', en: 'Premium' },
  'pricing.premium.price': { id: 'Rp 79.900', en: 'Rp 79,900' },
  'pricing.premium.original': { id: 'Rp 149.000', en: 'Rp 149,000' },
  'pricing.exclusive.name': { id: 'Eksklusif', en: 'Exclusive' },
  'pricing.exclusive.price': { id: 'Rp 99.900', en: 'Rp 99,900' },
  'pricing.exclusive.original': { id: 'Rp 199.000', en: 'Rp 199,000' },
};

/**
 * Gets a translated string for a given key and language.
 * @param key The translation key
 * @param lang The target language ('id' or 'en')
 * @returns The translated string, or the key if not found
 */
export const getTranslation = (key: string, lang: Language): string => {
  if (translations[key]) {
    return translations[key][lang] || key;
  }
  return key;
};

/**
 * Hook-like function for easier translation usage in components.
 * Typically used like `const t = (key) => t(key, currentLanguage)`
 * @param key The translation key
 * @param lang The current language
 * @returns The translated string
 */
export const t = (key: string, lang: Language = 'en'): string => {
  return getTranslation(key, lang);
};
