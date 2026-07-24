import { SeoData } from './seo.service';

/**
 * Sayfa bazlı SEO tanımları.
 * Route path'i anahtar olarak kullanılıyor.
 * Yeni sayfa eklerken buraya bir entry ekle, otomatik olarak SEO alsın.
 */

export const SEO_CONFIG: Record<string, SeoData> = {

  // ═══ ANA SAYFA ═══
  home: {
    title: 'Türkiye\'nin En Avantajlı Araç Kiralama Platformu',
    description:
      'RentACar ile İstanbul, Ankara, İzmir\'de 7/24 araç kiralama. ' +
      'Ekonomik, orta segment ve lüks araçlar. Havalimanı ofisleri, ücretsiz iptal, ' +
      'online rezervasyon. Hemen fiyat teklifi al!',
    keywords:
      'araç kiralama, oto kiralama, rent a car, rentacar, ' +
      'istanbul araç kiralama, ankara araç kiralama, izmir araç kiralama, ' +
      'havalimanı araç kiralama, uzun dönem araç kiralama, uygun fiyatlı araç kiralama',
    ogType: 'website',
    lang: 'tr'
  },

  // ═══ ARAÇLAR ═══
  cars: {
    title: 'Araçlarımız — Geniş Araç Filosu',
    description:
      'RentACar geniş araç filomuz: Ekonomik, kompakt, SUV ve lüks segmentte 100+ araç. ' +
      'Filtrele, karşılaştır, en uygun aracı bul. Anında rezervasyon.',
    keywords: 'araç filosu, araç listesi, sedan kiralama, SUV kiralama, kompakt araç kiralama',
    ogType: 'website',
    lang: 'tr'
  },

  // ═══ KAMPANYALAR ═══
  campaigns: {
    title: 'Kampanyalar ve Fırsatlar',
    description:
      'RentACar\'ın güncel kampanyalarını keşfedin: Hafta sonu fırsatları, uzun dönem indirimleri, ' +
      'erken rezervasyon avantajları ve öğrenci kampanyaları. %20\'ye varan indirim fırsatları.',
    keywords: 'araç kiralama kampanya, araç kiralama indirim, hafta sonu fırsatları',
    ogType: 'website',
    lang: 'tr'
  },

  // ═══ HİZMETLER ═══
  services: {
    title: 'Ek Hizmetler ve Güvenceler',
    description:
      'Bebek koltuğu, navigasyon, ek sürücü, tam kasko güvencesi ve daha fazlası. ' +
      'RentACar ek ürün ve güvence paketleri ile kiralama deneyiminizi zenginleştirin.',
    keywords: 'kasko, güvence paketi, ek ürün, bebek koltuğu, navigasyon',
    ogType: 'website',
    lang: 'tr'
  },

  // ═══ OFİSLER ═══
  offices: {
    title: 'Araç Kiralama Ofisleri',
    description:
      'İstanbul, Ankara ve İzmir\'deki havalimanı ve şehir ofislerimiz. ' +
      'Sabiha Gökçen, İstanbul Havalimanı, Esenboğa ve Adnan Menderes\'te 7/24 hizmet.',
    keywords: 'araç kiralama ofisi, havalimanı araç kiralama, sabiha gökçen, esenboğa',
    ogType: 'website',
    lang: 'tr'
  },

  // ═══ AUTH ═══
  login: {
    title: 'Giriş Yap',
    description: 'RentACar hesabınıza giriş yaparak rezervasyonlarınızı yönetin.',
    noindex: true,   // Login sayfası Google'da indexlenmesin
    lang: 'tr'
  },

  register: {
    title: 'Kayıt Ol',
    description: 'RentACar\'a ücretsiz kayıt olun. 3 dakikada hesap oluşturup rezervasyon yapmaya başlayın.',
    keywords: 'rentacar kayıt, üye ol, hesap oluştur',
    lang: 'tr'
  },

  forgotPassword: {
    title: 'Şifremi Unuttum',
    description: 'RentACar şifrenizi sıfırlayın. E-posta ile güvenli şifre kurtarma.',
    noindex: true,
    lang: 'tr'
  },

  resetPassword: {
    title: 'Şifre Sıfırla',
    description: 'Yeni şifrenizi belirleyin ve hesabınıza tekrar erişin.',
    noindex: true,
    lang: 'tr'
  },

  profile: {
    title: 'Profilim',
    description: 'RentACar hesap bilgilerinizi ve rezervasyon geçmişinizi görüntüleyin.',
    noindex: true,
    lang: 'tr'
  },

  myReservations: {
    title: 'Rezervasyonlarım',
    description: 'Aktif ve geçmiş rezervasyonlarınızı görüntüleyin.',
    noindex: true,
    lang: 'tr'
  },

  // ═══ REZERVASYON WIZARD ═══
  reservationWizard: {
    title: 'Rezervasyon',
    description: 'Rezervasyon işleminizi tamamlayın.',
    noindex: true,   // Wizard adımları Google'da indexlenmesin
    lang: 'tr'
  },

  // ═══ BİLGİ SAYFALARI ═══
  hakkimizda: {
    title: 'Hakkımızda',
    description:
      'RentACar hakkında: Türkiye\'nin güvenilir araç kiralama markası. ' +
      '3 şehirde 100+ araçlık filo, 10.000+ mutlu müşteri, 7/24 kesintisiz destek.',
    keywords: 'rentacar hakkında, araç kiralama şirketi, güvenilir araç kiralama',
    ogType: 'website',
    lang: 'tr'
  },

  kurumsalCozumler: {
    title: 'Kurumsal Çözümler',
    description:
      'Şirketiniz için özel araç kiralama çözümleri. Filo yönetimi, aylık faturalandırma, ' +
      '%15\'e varan kurumsal indirim, dedicated hesap yöneticisi.',
    keywords: 'kurumsal araç kiralama, filo kiralama, şirket aracı, kurumsal filo',
    ogType: 'website',
    lang: 'tr'
  },

  soforluHizmet: {
    title: 'Şoförlü Hizmet',
    description:
      'Profesyonel şoförlerimizle konforlu yolculuk. Havalimanı transferleri, ' +
      'iş toplantıları, düğün organizasyonları için deneyimli şoförler.',
    keywords: 'şoförlü araç kiralama, havalimanı transferi, VIP ulaşım',
    ogType: 'website',
    lang: 'tr'
  },

  uzunDonemKiralama: {
    title: 'Uzun Dönem Kiralama',
    description:
      'Aylık ve yıllık araç kiralama ile %40\'a varan tasarruf. Bakım, sigorta, kasko dahil. ' +
      '3, 6, 12, 24 aylık paketlerle ihtiyacınıza uygun çözüm.',
    keywords: 'uzun dönem araç kiralama, aylık araç kiralama, yıllık kiralama',
    ogType: 'website',
    lang: 'tr'
  },

  kariyer: {
    title: 'Kariyer',
    description:
      'RentACar\'da kariyer fırsatları. Yazılım geliştirici, UI/UX tasarımcı, ' +
      'müşteri deneyimi temsilcisi ve daha fazla açık pozisyon.',
    keywords: 'rentacar kariyer, iş ilanları, yazılım geliştirici iş',
    ogType: 'website',
    lang: 'tr'
  },

  basinOdasi: {
    title: 'Basın Odası',
    description:
      'RentACar basın bültenleri, kurumsal haberler ve medya materyalleri.',
    keywords: 'rentacar basın, basın bülteni, medya',
    lang: 'tr'
  },

  iletisim: {
    title: 'İletişim',
    description:
      'RentACar ile iletişime geçin: 7/24 çağrı merkezi, WhatsApp, e-posta. ' +
      'İstanbul, Ankara, İzmir şube bilgilerimiz ve iletişim formu.',
    keywords: 'rentacar iletişim, çağrı merkezi, telefon, whatsapp',
    ogType: 'website',
    lang: 'tr'
  },

  sikcaSorulanSorular: {
    title: 'Sıkça Sorulan Sorular',
    description:
      'Araç kiralama hakkında merak edilenler: Rezervasyon, ödeme, kiralama koşulları, ' +
      'araç teslimi, sigorta ve daha fazlası.',
    keywords: 'SSS, sıkça sorulan sorular, araç kiralama soruları, faq',
    ogType: 'website',
    lang: 'tr'
  },

  kiralamaKosullari: {
    title: 'Kiralama Koşulları',
    description:
      'RentACar araç kiralama şartları: Sürücü yaşı, ehliyet gereksinimleri, ' +
      'ödeme, depozito, kilometre limiti, yakıt politikası ve iptal koşulları.',
    keywords: 'kiralama koşulları, araç kiralama şartları, kiralama sözleşmesi',
    ogType: 'website',
    lang: 'tr'
  },

  gizlilikPolitikasi: {
    title: 'Gizlilik Politikası',
    description:
      'RentACar gizlilik politikası. Kişisel verilerinizin korunması, KVKK uyumlu ' +
      'veri işleme, çerezler ve haklarınız hakkında bilgi.',
    keywords: 'gizlilik politikası, kişisel veri, kvkk, çerez',
    ogType: 'website',
    lang: 'tr'
  },

  kvkk: {
    title: 'KVKK Aydınlatma Metni',
    description:
      '6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni. ' +
      'İşlenen veriler, işlenme amaçları, aktarım ve haklarınız.',
    keywords: 'KVKK, aydınlatma metni, 6698, kişisel veri',
    ogType: 'website',
    lang: 'tr'
  }
};

/**
 * Yardımcı: Dinamik araç detay sayfası için SEO oluştur
 */
export function buildCarDetailSeo(carBrand: string, carModel: string, dailyPrice: number): SeoData {
  const title = `${carBrand} ${carModel} Kiralama`;
  return {
    title,
    description:
      `${carBrand} ${carModel} kiralayın! Günlük ₺${dailyPrice.toLocaleString('tr-TR')} fiyattan başlayan ` +
      `avantajlı fiyatlarla. Ücretsiz iptal, kasko dahil, 7/24 destek. Hemen rezervasyon yap!`,
    keywords: `${carBrand} kiralama, ${carModel} kiralama, ${carBrand} ${carModel}, araç kiralama`,
    ogType: 'product',
    lang: 'tr'
  };
}
