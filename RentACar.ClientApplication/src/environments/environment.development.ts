// Development environment
// `ng serve` çalıştırıldığında bu dosya `environment.ts`'in YERİNE geçer.
// (angular.json'daki "fileReplacements" sayesinde.)
// Local dev sırasında direkt localhost'a bağlanır.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5065/api',
  apiBaseUrl: 'http://localhost:5065'
};