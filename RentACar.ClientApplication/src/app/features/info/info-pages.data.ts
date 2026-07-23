export interface InfoSection {
  title?: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface InfoPage {
  slug: string;
  title: string;
  subtitle?: string;
  breadcrumbGroup: 'Hizmetler' | 'Kurumsal' | 'Yardım';
  
  sections: InfoSection[];
  cta?: {
    text: string;
    buttonText: string;
    buttonLink: string;
  };
}

export const INFO_PAGES: InfoPage[] = [
  // ═══ HİZMETLER ═══
  {
    slug: 'kurumsal-cozumler',
    title: 'Kurumsal Çözümler',
    subtitle: 'Şirketiniz için özel filo ve kiralama çözümleri',
    breadcrumbGroup: 'Hizmetler',
    sections: [
      {
        paragraphs: [
          'RentACar olarak, işletmenizin ulaşım ihtiyaçlarını en verimli ve ekonomik şekilde karşılamak için özel kurumsal çözümler sunuyoruz. Küçük işletmelerden büyük holdinglere kadar her ölçekten şirketin filosunu yönetiyoruz.',
          'Kurumsal müşterilerimize özel fiyatlar, esnek sözleşmeler ve 7/24 destek ile şirketinizin lojistiğini profesyonel şekilde organize ediyoruz.'
        ]
      },
      {
        title: 'Neden RentACar Kurumsal?',
        bullets: [
          'Filonuz için özel indirim oranları (%15\'e varan avantaj)',
          'Aylık toplu faturalandırma ile muhasebe kolaylığı',
          'Dedicated hesap yöneticisi',
          '7/24 çağrı merkezi ve teknik destek',
          'Türkiye genelinde 3 şehirde teslim noktası',
          'Kasko ve tam sigorta kapsamlı araçlar',
          'Sınırsız kilometre seçeneği',
          'Uzun dönem kiralamada araç değişim garantisi'
        ]
      },
      {
        title: 'Kurumsal Paket Seçenekleri',
        paragraphs: [
          'İhtiyacınıza göre farklı paketler sunuyoruz: Sürekli kullanım için aylık kiralama, proje bazlı kısa dönem çözümler ve etkinlik/toplantı için günlük paketler.'
        ],
        bullets: [
          'Mini Filo (2-5 araç) — Küçük işletmeler için ideal',
          'Standart Filo (6-20 araç) — Orta ölçekli şirketler',
          'Kurumsal Filo (20+ araç) — Büyük şirketler ve kurumlar',
          'Proje Bazlı Filo — Sezonluk veya belirli süre'
        ]
      }
    ],
    cta: {
      text: 'Şirketinize özel teklif almak ister misiniz?',
      buttonText: 'İletişime Geç',
      buttonLink: '/iletisim'
    }
  },
  {
    slug: 'soforlu-hizmet',
    title: 'Şoförlü Hizmet',
    subtitle: 'Profesyonel şoförlerimizle konforlu ve güvenli yolculuk',
    breadcrumbGroup: 'Hizmetler',
    sections: [
      {
        paragraphs: [
          'İş toplantıları, havalimanı transferleri, düğün organizasyonları veya özel gezileriniz için deneyimli şoförlerimizle rahat bir yolculuk deneyimi sunuyoruz. Ehliyet, konaklama veya yorulma derdine son.'
        ]
      },
      {
        title: 'Hizmet Alanları',
        bullets: [
          'Havalimanı transferleri (İstanbul, Ankara, İzmir)',
          'Şehirlerarası VIP ulaşım',
          'İş toplantıları ve kurumsal etkinlikler',
          'Düğün ve özel organizasyonlar',
          'Turistik geziler ve şehir turları',
          'Saatlik veya günlük şoförlü kiralama'
        ]
      },
      {
        title: 'Şoförlerimiz',
        paragraphs: [
          'Tüm şoförlerimiz en az 10 yıllık profesyonel deneyime sahip, sicili temiz ve düzenli sağlık kontrollerinden geçen uzman kişilerdir. Türkçe ve İngilizce iletişim kurabilen şoförlerimiz, misafirperverlik ve güvenlik konusunda eğitimlidir.'
        ],
        bullets: [
          'Minimum 10 yıl profesyonel şoförlük deneyimi',
          'İngilizce iletişim (talep üzerine)',
          'Düzenli sağlık ve sürüş testleri',
          'Uniform ve profesyonel görünüm',
          'İstanbul, Ankara ve İzmir trafik bilgisi'
        ]
      }
    ],
    cta: {
      text: 'Şoförlü araç talebiniz için',
      buttonText: 'Rezervasyon Yap',
      buttonLink: '/iletisim'
    }
  },
  {
    slug: 'uzun-donem-kiralama',
    title: 'Uzun Dönem Kiralama',
    subtitle: 'Aylık ve yıllık kiralama ile maksimum tasarruf',
    breadcrumbGroup: 'Hizmetler',
    sections: [
      {
        paragraphs: [
          'Uzun dönem kiralama, araç sahibi olmanın zorluklarından kurtularak her ay sabit bir ödeme ile araç kullanmanın en akıllı yoludur. 3 aydan başlayan kiralama süreleri ile ihtiyacınıza uygun paket sunuyoruz.'
        ]
      },
      {
        title: 'Uzun Dönem Avantajları',
        bullets: [
          'Aylık ödemede %40\'a varan tasarruf',
          'Bakım, sigorta ve kasko fiyata dahil',
          'Motorlu Taşıtlar Vergisi bize ait',
          'Lastik değişimi ücretsiz',
          'Yol yardım hizmeti 7/24',
          'Yıl sonu araç değişim opsiyonu',
          'Sürücü değiştirme esnekliği'
        ]
      },
      {
        title: 'Kiralama Süreleri',
        bullets: [
          '3 Ay — Kısa dönem projeler için',
          '6 Ay — Sezonluk kullanım',
          '12 Ay — Yıllık paket (en avantajlı)',
          '24 Ay — Uzun vadeli iş çözümü',
          '36 Ay — Kurumsal filo çözümü'
        ]
      }
    ],
    cta: {
      text: 'Uzun dönem kiralama fırsatlarımızı keşfedin',
      buttonText: 'Teklif Al',
      buttonLink: '/iletisim'
    }
  },

  // ═══ KURUMSAL ═══
  {
    slug: 'hakkimizda',
    title: 'Hakkımızda',
    subtitle: 'Türkiye\'nin güvenilir araç kiralama markası',
    breadcrumbGroup: 'Kurumsal',
    sections: [
      {
        paragraphs: [
          'RentACar, Türkiye\'de araç kiralama sektörüne yenilikçi bir yaklaşımla giren, teknoloji odaklı bir markadır. İstanbul, Ankara ve İzmir\'de bulunan modern şubelerimizde geniş araç filosu ile hizmet vermekteyiz.',
          'Amacımız, müşterilerimize sadece bir araç kiralamak değil; güvenilir, konforlu ve keyifli bir ulaşım deneyimi sunmaktır.'
        ]
      },
      {
        title: 'Vizyonumuz',
        paragraphs: [
          'Türkiye\'nin en çok tercih edilen dijital araç kiralama platformu olmak. Müşteri memnuniyeti odaklı hizmet anlayışımız ve teknolojik altyapımızla sektöre yön veren bir marka olma hedefindeyiz.'
        ]
      },
      {
        title: 'Misyonumuz',
        paragraphs: [
          'Her müşterimize güvenilir, temiz ve yeni model araçları uygun fiyatlarla sunmak. Rezervasyondan araç teslimine kadar tüm süreçlerde teknolojiyi kullanarak müşteri deneyimini en üst seviyeye çıkarmak.'
        ]
      },
      {
        title: 'Değerlerimiz',
        bullets: [
          'Güvenilirlik — Sözümüzü tutar, aracımızı zamanında teslim ederiz',
          'Şeffaflık — Fiyatlarımız net, gizli ücret yoktur',
          'Kalite — Filomuzdaki tüm araçlar düzenli bakımlıdır',
          'Müşteri Odaklılık — 7/24 destek ile yanınızdayız',
          'Yenilikçilik — Sektörde teknoloji öncüsüyüz',
          'Sürdürülebilirlik — Hibrit ve elektrikli araçlar sunuyoruz'
        ]
      },
      {
        title: 'Rakamlarla RentACar',
        bullets: [
          '3 şehirde faaliyet (İstanbul, Ankara, İzmir)',
          '100+ araçlık geniş filo',
          '10.000+ mutlu müşteri',
          '4.8/5 müşteri memnuniyet puanı',
          '7/24 kesintisiz destek'
        ]
      }
    ]
  },
  {
    slug: 'kariyer',
    title: 'Kariyer',
    subtitle: 'RentACar ailesine katılın',
    breadcrumbGroup: 'Kurumsal',
    sections: [
      {
        paragraphs: [
          'RentACar, çalışanlarının potansiyellerini keşfedebilecekleri, gelişebilecekleri ve kariyerlerini şekillendirebilecekleri bir çalışma ortamı sunar. Dinamik, teknoloji odaklı ve müşteri memnuniyetini merkeze alan bir ekibin parçası olmak ister misiniz?'
        ]
      },
      {
        title: 'Neden RentACar\'da Çalışmalısınız?',
        bullets: [
          'Rekabetçi maaş ve prim politikası',
          'Özel sağlık sigortası ve yemek kartı',
          'Kariyer gelişim programları ve eğitimler',
          'Esnek çalışma saatleri',
          'Yıllık şirket etkinlikleri ve piknikleri',
          'Terfi imkanları ve iç görev değişimi',
          'Modern ve ergonomik ofis ortamı'
        ]
      },
      {
        title: 'Açık Pozisyonlar',
        paragraphs: [
          'Şu anda büyümekte olan ekibimizde çeşitli pozisyonlarda değerlendirmeler almaktayız:'
        ],
        bullets: [
          'Yazılım Geliştirici (Full-Stack, Frontend, Backend)',
          'UI/UX Tasarımcı',
          'Dijital Pazarlama Uzmanı',
          'Müşteri Deneyimi Temsilcisi',
          'Şube Müdürü (İstanbul, Ankara, İzmir)',
          'Filo Yönetim Uzmanı',
          'Muhasebe ve Finans Uzmanı'
        ]
      },
      {
        title: 'Başvuru',
        paragraphs: [
          'Kariyerinize RentACar\'da devam etmek istiyorsanız, CV\'nizi ve motivasyon mektubunuzu ik@rentacar.com adresine gönderebilirsiniz. Başvurunuz değerlendirmeye alınacak ve uygun görülen adaylarla en kısa sürede iletişime geçilecektir.'
        ]
      }
    ],
    cta: {
      text: 'RentACar ailesinin bir parçası olmak ister misiniz?',
      buttonText: 'CV Gönder',
      buttonLink: 'mailto:ik@rentacar.com'
    }
  },
  {
    slug: 'basin-odasi',
    title: 'Basın Odası',
    subtitle: 'RentACar hakkında güncel haberler ve basın bültenleri',
    breadcrumbGroup: 'Kurumsal',
    sections: [
      {
        paragraphs: [
          'RentACar Basın Odası\'na hoş geldiniz. Bu sayfada şirketimizle ilgili basın bültenleri, medya materyalleri ve kurumsal haberleri bulabilirsiniz.'
        ]
      },
      {
        title: 'Basın Bültenleri',
        bullets: [
          '2026 Yaz Sezonu Kampanyaları Duyurumuz',
          'Elektrikli Araç Filomuz Genişledi',
          'Yeni İzmir Şubemizi Açtık',
          'Kurumsal Filo Yönetim Programımız Başladı'
        ]
      },
      {
        title: 'Kurumsal Kimlik',
        paragraphs: [
          'Marka kimliğimize ait logo dosyaları, yazılı materyaller ve marka rehberimize press@rentacar.com adresinden ulaşabilirsiniz.'
        ]
      },
      {
        title: 'Medya İletişim',
        paragraphs: [
          'Röportaj talepleri, basın bültenleri ve medya soruları için Kurumsal İletişim Departmanımızla iletişime geçebilirsiniz:'
        ],
        bullets: [
          'E-posta: press@rentacar.com',
          'Telefon: 0212 XXX XX XX',
          'Mesai saatleri: Hafta içi 09:00-18:00'
        ]
      }
    ]
  },
  {
    slug: 'iletisim',
    title: 'İletişim',
    subtitle: 'Bize ulaşın, size yardımcı olmaktan mutluluk duyarız',
    breadcrumbGroup: 'Kurumsal',
    sections: [
      {
        title: '7/24 Çağrı Merkezi',
        paragraphs: [
          'Rezervasyon, teknik destek veya genel sorularınız için 7 gün 24 saat çalışan çağrı merkezimizden ulaşabilirsiniz.'
        ],
        bullets: [
          'Telefon: 0850 XXX XX XX',
          'WhatsApp: 0532 XXX XX XX',
          'E-posta: info@rentacar.com'
        ]
      },
      {
        title: 'Şubelerimiz',
        paragraphs: [
          'Türkiye\'nin 3 büyük şehrinde stratejik konumlarda bulunan şubelerimizden hizmet vermekteyiz.'
        ]
      },
      {
        title: 'İstanbul Şubesi',
        bullets: [
          'Adres: Sabiha Gökçen Havalimanı, İçmeler Cad. No:1, Pendik/İstanbul',
          'Telefon: 0216 XXX XX XX',
          'Çalışma Saatleri: 7/24',
          'İstanbul Havalimanı & Sabiha Gökçen ofisimiz mevcuttur'
        ]
      },
      {
        title: 'Ankara Şubesi',
        bullets: [
          'Adres: Esenboğa Havalimanı, Balıkhisar Mahallesi, Çubuk/Ankara',
          'Telefon: 0312 XXX XX XX',
          'Çalışma Saatleri: 06:00-24:00'
        ]
      },
      {
        title: 'İzmir Şubesi',
        bullets: [
          'Adres: Adnan Menderes Havalimanı, Gaziemir/İzmir',
          'Telefon: 0232 XXX XX XX',
          'Çalışma Saatleri: 06:00-24:00'
        ]
      },
      {
        title: 'Kurumsal Departmanlar',
        bullets: [
          'Satış: satis@rentacar.com',
          'Kurumsal Çözümler: kurumsal@rentacar.com',
          'Basın & Medya: press@rentacar.com',
          'İnsan Kaynakları: ik@rentacar.com',
          'Şikayet & Öneri: memnuniyet@rentacar.com'
        ]
      }
    ]
  },

  // ═══ YARDIM ═══
  {
    slug: 'sikca-sorulan-sorular',
    title: 'Sıkça Sorulan Sorular',
    subtitle: 'Merak ettiğiniz her şey burada',
    breadcrumbGroup: 'Yardım',
    sections: [
      {
        title: 'Rezervasyon',
        bullets: [
          'Nasıl rezervasyon yapabilirim? — Web sitemizden istediğiniz aracı seçip, tarihleri belirleyerek 3 dakikada rezervasyon yapabilirsiniz.',
          'Rezervasyonumu iptal edebilir miyim? — Alış tarihine 24 saatten fazla varsa ücretsiz iptal edebilirsiniz.',
          'Rezervasyonumu değiştirebilir miyim? — Evet, "Rezervasyonlarım" sayfasından tarihleri güncelleyebilirsiniz (alışa 24 saatten fazla varsa).',
          'Kaç günlük rezervasyon yapabilirim? — Minimum 1 gün, maksimum 365 günlük kiralama yapabilirsiniz.'
        ]
      },
      {
        title: 'Ödeme',
        bullets: [
          'Hangi ödeme yöntemlerini kabul ediyorsunuz? — Online kredi/banka kartı ile ödeme veya aracı teslim aldığınız şubede nakit/kartla ödeme yapabilirsiniz.',
          'Ödemem güvenli mi? — 3D Secure ile korumalı, 256-bit SSL sertifikalı ödeme altyapısı kullanıyoruz.',
          'Depozito alıyor musunuz? — Aracı teslim alırken kredi kartınızdan belirli bir tutar bloke edilir. Araç sağlam iade edildiğinde bu tutar serbest bırakılır.',
          'Fatura kesiyor musunuz? — Evet, her rezervasyon için e-fatura düzenlenmektedir.'
        ]
      },
      {
        title: 'Araç Kiralama Koşulları',
        bullets: [
          'Kaç yaşında olmam gerekiyor? — Minimum yaş şartı 21\'dir (bazı araç sınıfları için 25).',
          'Ehliyet şartları nelerdir? — Türkiye Cumhuriyeti sürücü belgesi veya uluslararası ehliyet gereklidir. Ehliyet en az 1 yıllık olmalıdır.',
          'Yabancı uyruklu müşteriler kiralayabilir mi? — Evet, pasaport ve uluslararası ehliyet ile kiralayabilirsiniz.',
          'Findeks skoru şartı var mı? — Evet, minimum Findeks skoru sınıra göre değişmektedir. Detaylar rezervasyon sırasında görüntülenir.'
        ]
      },
      {
        title: 'Araç Teslim ve İade',
        bullets: [
          'Aracı nereden alabilirim? — İstanbul, Ankara ve İzmir\'deki şubelerimizin herhangi birinden alabilirsiniz.',
          'Aracı farklı şubede iade edebilir miyim? — Evet, ancak farklı şube teslim ücreti uygulanır (fiyat rezervasyonda gösterilir).',
          'Araç kilometresi kısıtlı mı? — Standart günlük 300km, aylık 3000km sınırımız vardır. Aşan kilometrelere ek ücret uygulanır.',
          'Aracı yakıtı ne kadar dolu almalıyım? — Aracı teslim aldığınız yakıt seviyesinde iade etmelisiniz.'
        ]
      },
      {
        title: 'Sigorta ve Güvence',
        bullets: [
          'Sigortam var mı? — Tüm araçlarımız zorunlu trafik sigortası ile kiralanır. Ek olarak kasko güvence paketleri sunuyoruz.',
          'Kazadan sonra ne yapmalıyım? — Trafik polisini arayarak kaza tutanağı tutturmalı ve derhal 7/24 çağrı merkezimizle iletişime geçmelisiniz.',
          'Aracı çaldırırsam ne olur? — Zorunlu sigorta kapsamındadır. En yakın karakola başvurup, tutanakla birlikte bize başvurmalısınız.'
        ]
      }
    ]
  },
  {
    slug: 'kiralama-kosullari',
    title: 'Kiralama Koşulları',
    subtitle: 'Genel kiralama şartları ve gereksinimleri',
    breadcrumbGroup: 'Yardım',
    sections: [
      {
        title: 'Genel Şartlar',
        paragraphs: [
          'RentACar\'dan araç kiralamak için aşağıdaki şartları sağlamanız gerekmektedir. Rezervasyon yapmadan önce lütfen tüm şartları dikkatlice okuyunuz.'
        ]
      },
      {
        title: '1. Sürücü Şartları',
        bullets: [
          'Minimum sürücü yaşı: 21 (Ekonomik segment), 25 (Prestij/SUV segment)',
          'Minimum ehliyet yaşı: 1 yıl',
          'Geçerli TC Kimlik veya pasaport',
          'Yeni tip sürücü belgesi (kart tipi ehliyet)',
          'Minimum Findeks skoru gereklidir',
          'İkinci sürücü ilave ücretli olarak eklenebilir'
        ]
      },
      {
        title: '2. Ödeme ve Depozito',
        bullets: [
          'Rezervasyon sırasında online kart ile ödeme yapılabilir',
          'Ofiste ödeme seçeneği mevcuttur (nakit veya kart)',
          'Araç teslim alınırken kredi kartından depozito bloke edilir',
          'Depozito, araç sağlam ve tam yakıt olarak iade edildiğinde serbest bırakılır'
        ]
      },
      {
        title: '3. Araç Kullanım Kuralları',
        bullets: [
          'Araç sadece rezervasyon yapan kişi tarafından kullanılabilir',
          'Yurt dışına çıkış için firmadan önceden onay alınmalıdır',
          'Aracın içinde sigara içmek yasaktır (₺500 temizlik cezası)',
          'Aracı ticari amaçla veya kiralama için kullanmak yasaktır',
          'Rally, ralli veya benzeri yarışlarda kullanmak yasaktır',
          'Trafik kurallarına uyulmalıdır — cezalar müşteriye aittir'
        ]
      },
      {
        title: '4. Yakıt Politikası',
        paragraphs: [
          'Aracı teslim aldığınız yakıt seviyesinde iade etmelisiniz. Eksik yakıt için depo doldurma ücreti + hizmet bedeli tahsil edilir.'
        ]
      },
      {
        title: '5. Kilometre Limiti',
        bullets: [
          'Günlük kiralama: 300 km/gün',
          'Haftalık kiralama: 2000 km/hafta',
          'Aylık kiralama: 3000 km/ay',
          'Sınırsız km paketi ek ücret ile mevcuttur'
        ]
      },
      {
        title: '6. İptal ve Değişiklik',
        bullets: [
          '24 saat öncesine kadar ücretsiz iptal',
          '24 saatten az kaldıysa iptal edilemez',
          'Tarih değişikliği alışa 24 saat kalana kadar mümkündür',
          'Erken iade durumunda ücret iadesi yapılmaz'
        ]
      },
      {
        title: '7. Kaza ve Hasar',
        paragraphs: [
          'Herhangi bir kaza veya hasar durumunda derhal firmayla iletişime geçilmeli ve trafik polisi çağırılarak kaza tespit tutanağı düzenlenmelidir. Aksi halde sigorta kapsamı geçersiz kılınabilir.'
        ]
      }
    ]
  },
  {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    subtitle: 'Kişisel verilerinizin gizliliği bizim için önemli',
    breadcrumbGroup: 'Yardım',
    sections: [
      {
        paragraphs: [
          'RentACar olarak, kullanıcılarımızın kişisel verilerinin gizliliğine ve güvenliğine büyük önem veriyoruz. Bu gizlilik politikası, hizmetlerimizi kullanırken topladığımız bilgileri ve bu bilgileri nasıl kullandığımızı açıklamaktadır.'
        ]
      },
      {
        title: '1. Toplanan Bilgiler',
        paragraphs: [
          'Hizmetlerimizi kullanırken aşağıdaki bilgileri toplayabiliriz:'
        ],
        bullets: [
          'Kimlik bilgileri (ad, soyad, TC kimlik numarası)',
          'İletişim bilgileri (telefon, e-posta, adres)',
          'Sürücü belgesi bilgileri',
          'Ödeme bilgileri (kart bilgileri güvenli ödeme sistemi üzerinden şifreli olarak işlenir, sistemimizde saklanmaz)',
          'Rezervasyon geçmişi',
          'IP adresi, tarayıcı bilgileri, çerezler'
        ]
      },
      {
        title: '2. Bilgilerin Kullanım Amacı',
        bullets: [
          'Rezervasyon işlemlerinin gerçekleştirilmesi',
          'Müşteri hizmetleri desteği sağlanması',
          'Yasal yükümlülüklerin yerine getirilmesi',
          'Hizmet kalitemizin artırılması',
          'İzin verilmesi durumunda pazarlama iletişimi',
          'Fraud ve dolandırıcılık önleme'
        ]
      },
      {
        title: '3. Bilgilerin Paylaşımı',
        paragraphs: [
          'Kişisel verileriniz izniniz olmadan üçüncü taraflarla paylaşılmaz. İstisnalar şunlardır:'
        ],
        bullets: [
          'Yasal yükümlülük gereği devlet kurumları ile',
          'Ödeme işlemleri için bankalar ve ödeme kuruluşları ile',
          'Filo yönetim hizmetleri için tedarikçilerimizle (gizlilik anlaşmalı)',
          'Hizmet sağlayıcılarımızla (bulut, e-posta, analitik)'
        ]
      },
      {
        title: '4. Veri Güvenliği',
        paragraphs: [
          'Kişisel verilerinizi korumak için 256-bit SSL şifreleme, çift faktörlü kimlik doğrulama, düzenli güvenlik denetimleri ve endüstri standardı güvenlik önlemleri kullanıyoruz.'
        ]
      },
      {
        title: '5. Çerezler',
        paragraphs: [
          'Web sitemiz kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz, ancak bu bazı özelliklerin çalışmasını etkileyebilir.'
        ]
      },
      {
        title: '6. Haklarınız',
        paragraphs: [
          'KVKK kapsamında kişisel verilerinize ilişkin şu haklara sahipsiniz:'
        ],
        bullets: [
          'Verilerinize erişme hakkı',
          'Yanlış verilerin düzeltilmesini isteme hakkı',
          'Verilerinizin silinmesini talep etme hakkı',
          'Verilerinizin işlenmesine itiraz etme hakkı',
          'Veri taşınabilirliği hakkı'
        ]
      },
      {
        title: '7. İletişim',
        paragraphs: [
          'Gizlilik politikamız hakkında sorularınız için kvkk@rentacar.com adresinden bize ulaşabilirsiniz. Bu politikada değişiklik yapıldığında bu sayfada güncelleme tarihi ile birlikte yayınlanır.',
          'Son güncelleme: 11 Temmuz 2026'
        ]
      }
    ]
  },
  {
    slug: 'kvkk',
    title: 'KVKK Aydınlatma Metni',
    subtitle: '6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme',
    breadcrumbGroup: 'Yardım',
    sections: [
      {
        title: 'Veri Sorumlusu',
        paragraphs: [
          '6698 Sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında RentACar Ticari Filo Yönetim A.Ş. ("Şirket") olarak veri sorumlusu sıfatıyla, aşağıda açıklanan amaçlarla ve mevzuata uygun olarak kişisel verilerinizi işlemekteyiz.'
        ]
      },
      {
        title: 'İşlenen Kişisel Veriler',
        bullets: [
          'Kimlik Bilgileri: Ad, soyad, TC kimlik numarası, doğum tarihi',
          'İletişim Bilgileri: Telefon numarası, e-posta adresi, ikamet adresi',
          'Sürücü Belgesi Bilgileri: Ehliyet sınıfı, ehliyet numarası, veriliş tarihi',
          'Finansal Bilgiler: Ödeme bilgileri, fatura bilgileri, Findeks skoru',
          'Rezervasyon Bilgileri: Kiralama geçmişi, tercih edilen araç tipleri',
          'İşlem Bilgileri: IP adresi, çerezler, tarayıcı bilgileri, kullanım kayıtları'
        ]
      },
      {
        title: 'Kişisel Verilerin İşlenme Amaçları',
        bullets: [
          'Araç kiralama sözleşmesinin kurulması ve ifası',
          'Ödeme işlemlerinin gerçekleştirilmesi',
          'Yasal yükümlülüklerin yerine getirilmesi (vergi, sigorta vb.)',
          'Müşteri hizmetleri ve destek sağlanması',
          'Fraud ve dolandırıcılık önleme',
          'Şirket içi denetim ve raporlama',
          'İzin verildiği takdirde pazarlama ve tanıtım faaliyetleri'
        ]
      },
      {
        title: 'Kişisel Verilerin Aktarılması',
        paragraphs: [
          'Kişisel verileriniz, ilgili mevzuat çerçevesinde ve KVKK\'nın 8. ve 9. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları çerçevesinde aşağıdaki kişilere aktarılabilir:'
        ],
        bullets: [
          'Yetkili kamu kurum ve kuruluşları',
          'Bankalar ve ödeme kuruluşları (Iyzico dahil)',
          'Sigorta şirketleri',
          'Emniyet birimleri (kaza durumunda)',
          'Hukuk ve muhasebe hizmet sağlayıcıları',
          'Bulut hizmet sağlayıcıları (verileriniz Türkiye içinde saklanır)'
        ]
      },
      {
        title: 'İlgili Kişinin Hakları (KVKK m.11)',
        paragraphs: [
          'KVKK\'nın 11. maddesi kapsamında sahip olduğunuz haklar:'
        ],
        bullets: [
          'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
          'İşlenmişse buna ilişkin bilgi talep etme',
          'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme',
          'Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme',
          'Eksik/yanlış işlenmiş olması halinde düzeltilmesini isteme',
          'KVKK\'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini/yok edilmesini isteme',
          'Aleyhine bir sonuç ortaya çıkmasına itiraz etme',
          'Kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması halinde tazminat talep etme'
        ]
      },
      {
        title: 'Başvuru Yolları',
        paragraphs: [
          'Yukarıda yer alan haklarınızı kullanmak için taleplerinizi kvkk@rentacar.com adresine e-posta ile veya İstanbul şubemize ıslak imzalı yazılı olarak iletebilirsiniz. Talebinizi en geç 30 gün içinde yanıtlayacağız.',
          'Yürürlük tarihi: 1 Ocak 2026'
        ]
      }
    ]
  }
];
