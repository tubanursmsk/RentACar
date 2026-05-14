import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Giriş Yap — RentACar'
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

  // ─── BAŞARI SAYFASI ───
  {
    path: 'rezervasyon-basarili/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservation/reservation-success.component').then(m => m.ReservationSuccessComponent),
    title: 'Rezervasyon Tamamlandı'
  },

  {
    path: '**',
    redirectTo: ''
  }
];