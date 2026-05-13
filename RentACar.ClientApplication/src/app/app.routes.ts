import { Routes } from '@angular/router';

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
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Üye Ol — RentACar'
  },
  {
    path: '**',
    redirectTo: ''
  }
];