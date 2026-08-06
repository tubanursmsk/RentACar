import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MyReservationsComponent } from './features/my-reservations/my-reservations.component';
import { ReservationDetailComponent } from './features/my-reservations/reservation-detail.component';
import { ReservationSuccessComponent } from './features/my-reservations/reservation-success.component';
import { PaymentResultComponent } from './features/payment/payment-result.component';
import { InfoPageComponent } from './features/info/info-page.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'RentACar — Avantajlı Araç Kiralama'
  },
  {
    path: 'araclar',
    loadComponent: () =>
      import('./features/cars/car-list/car-list.component').then(m => m.CarListComponent),
    title: 'Araçlar — RentACar'
  },
  {
    path: 'araclar/:id',
    loadComponent: () =>
      import('./features/cars/car-detail/car-detail.component').then(m => m.CarDetailComponent),
    title: 'Araç Detayı — RentACar'
  },
  {
    path: 'ofisler',
    loadComponent: () => import('./features/offices/offices.component').then(m => m.OfficesComponent),
    title: 'Araç Kiralama Ofisleri — RentACar'
  },
  {
    path: 'hizmetler',
    loadComponent: () =>
      import('./features/services/services.component').then(m => m.ServicesComponent),
    title: 'Hizmetler — RentACar'
  },
  {
    path: 'kampanyalar',
    loadComponent: () => import('./features/campaigns/campaigns.component').then(m => m.CampaignsComponent),
    title: 'Kampanyalar — RentACar'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Giriş Yap — RentACar'
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Kayıt Ol — RentACar'
  },
   
 
  // Şifremi Unuttum
  {
    path: 'sifremi-unuttum',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Şifremi Unuttum — RentACar'
  },
 
  // Şifre Sıfırla (Mail'den gelen link buraya düşer)
  {
    path: 'sifre-sifirla',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    title: 'Şifre Sıfırla — RentACar'
  },

  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Profilim — RentACar'
  },

  // ─── REZERVASYON WIZARD ───
  {
    path: 'rezervasyon',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservation/reservation-layout.component').then(m => m.ReservationLayoutComponent),
    children: [
      { path: '', redirectTo: 'ozet', pathMatch: 'full' },
      {
        path: 'ozet',
        loadComponent: () =>
          import('./features/reservation/steps/step-summary.component').then(m => m.StepSummaryComponent),
        title: 'Özet — Rezervasyon'
      },
      {
        path: 'guvence',
        loadComponent: () =>
          import('./features/reservation/steps/step-insurance.component').then(m => m.StepInsuranceComponent),
        title: 'Güvence — Rezervasyon'
      },
      {
        path: 'ek-urunler',
        loadComponent: () =>
          import('./features/reservation/steps/step-extras.component').then(m => m.StepExtrasComponent),
        title: 'Ek Ürünler — Rezervasyon'
      },
      {
        path: 'surucu',
        loadComponent: () =>
          import('./features/reservation/steps/step-driver.component').then(m => m.StepDriverComponent),
        title: 'Sürücü — Rezervasyon'
      },
      {
        path: 'odeme',
        loadComponent: () =>
          import('./features/reservation/steps/step-payment.component').then(m => m.StepPaymentComponent),
        title: 'Ödeme — Rezervasyon'
      }
    ]
  },

  // ─── REZERVASYONLARIM ───
  {
    path: 'rezervasyonlarim',
    component: MyReservationsComponent,
    title: 'Rezervasyonlarım — RentACar',
  },
  {
    path: 'rezervasyonlarim/:id',
    component: ReservationDetailComponent,
    title: 'Rezervasyon Detayı — RentACar',
  },

  // ─── BAŞARI VE ÖDEME SAYFALARI ───
  {
    path: 'rezervasyon-basarili/:id',
    canActivate: [authGuard],
    component: ReservationSuccessComponent,
    title: 'Rezervasyon Başarılı — RentACar',
  },
  {
    path: 'odeme-sonuc',
    component: PaymentResultComponent,
    title: 'Ödeme Sonucu — RentACar',
  },

  // ═══ BİLGİ SAYFALARI — HİZMETLER ═══
  {
    path: 'kurumsal-cozumler',
    component: InfoPageComponent,
    data: { slug: 'kurumsal-cozumler' },
    title: 'Kurumsal Çözümler — RentACar',
  },
  {
    path: 'soforlu-hizmet',
    component: InfoPageComponent,
    data: { slug: 'soforlu-hizmet' },
    title: 'Şoförlü Hizmet — RentACar',
  },
  {
    path: 'uzun-donem-kiralama',
    component: InfoPageComponent,
    data: { slug: 'uzun-donem-kiralama' },
    title: 'Uzun Dönem Kiralama — RentACar',
  },

  // ═══ BİLGİ SAYFALARI — KURUMSAL ═══
  {
    path: 'hakkimizda',
    component: InfoPageComponent,
    data: { slug: 'hakkimizda' },
    title: 'Hakkımızda — RentACar',
  },
  {
    path: 'kariyer',
    component: InfoPageComponent,
    data: { slug: 'kariyer' },
    title: 'Kariyer — RentACar',
  },
  {
    path: 'basin-odasi',
    component: InfoPageComponent,
    data: { slug: 'basin-odasi' },
    title: 'Basın Odası — RentACar',
  },
  {
    path: 'iletisim',
    component: InfoPageComponent,
    data: { slug: 'iletisim' },
    title: 'İletişim — RentACar',
  },

  // ═══ BİLGİ SAYFALARI — YARDIM ═══
  {
    path: 'sikca-sorulan-sorular',
    component: InfoPageComponent,
    data: { slug: 'sikca-sorulan-sorular' },
    title: 'Sıkça Sorulan Sorular — RentACar',
  },
  {
    path: 'kiralama-kosullari',
    component: InfoPageComponent,
    data: { slug: 'kiralama-kosullari' },
    title: 'Kiralama Koşulları — RentACar',
  },
  {
    path: 'gizlilik-politikasi',
    component: InfoPageComponent,
    data: { slug: 'gizlilik-politikasi' },
    title: 'Gizlilik Politikası — RentACar',
  },
  {
    path: 'kvkk',
    component: InfoPageComponent,
    data: { slug: 'kvkk' },
    title: 'KVKK — RentACar',
  },




  // ⚠️ WILDCARD — HER ZAMAN EN SONDA olsun
  // Yukarıdaki hiçbir route eşleşmezse buraya düşer, ana sayfaya yönlendirir.
  {
    path: '**',
    redirectTo: ''
  },
];





