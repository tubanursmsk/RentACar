import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RentalService } from '../../core/services/rental.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row gap-8">
        
        <aside class="w-full md:w-64 flex-shrink-0">
          <div class="bg-white rounded-2xl shadow-sm border border-ink-100 overflow-hidden">
            <div class="p-6 bg-avis-600 text-white text-center">
              <div class="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold mb-3">
                {{ user()?.firstName?.charAt(0) }}
              </div>
              <h2 class="font-bold text-lg">Merhaba, {{ user()?.firstName }}</h2>
              <p class="text-xs opacity-80">Üyelik No: #{{ user()?.id }}</p>
            </div>
            
            <nav class="p-2 flex flex-col gap-1">
              <button (click)="activeTab.set('rentals')" 
                      [class.bg-avis-50]="activeTab() === 'rentals'"
                      [class.text-avis-600]="activeTab() === 'rentals'"
                      class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition hover:bg-ink-50">
                <span>🚗</span> Rezervasyonlarım
              </button>
              
              <button (click)="activeTab.set('history')" 
                      [class.bg-avis-50]="activeTab() === 'history'"
                      [class.text-avis-600]="activeTab() === 'history'"
                      class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition hover:bg-ink-50 text-ink-600">
                <span>🕒</span> Kiralama Geçmişi
              </button>
              
              <button (click)="activeTab.set('billing')" 
                      [class.bg-avis-50]="activeTab() === 'billing'"
                      [class.text-avis-600]="activeTab() === 'billing'"
                      class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition hover:bg-ink-50 text-ink-600">
                <span>📄</span> Harcamalarım
              </button>
              
              <div class="h-px bg-ink-100 my-2"></div> <button (click)="activeTab.set('password')" 
                      [class.bg-avis-50]="activeTab() === 'password'"
                      [class.text-avis-600]="activeTab() === 'password'"
                      class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition hover:bg-ink-50 text-ink-600">
                <span>🔑</span> Parola İşlemleri
              </button>

              <button (click)="activeTab.set('cancel')" 
                      [class.bg-red-50]="activeTab() === 'cancel'"
                      [class.text-red-600]="activeTab() === 'cancel'"
                      class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition hover:bg-red-50 text-ink-600 hover:text-red-600 mt-1">
                <span>⚠️</span> Üyelik İptali
              </button>
            </nav>
          </div>
        </aside>

        <main class="flex-1">
          
          @if (activeTab() === 'rentals') {
            <section class="animate-fade-in">
              <h3 class="text-2xl font-extrabold text-ink-900 mb-6">Mevcut Rezervasyonlar</h3>
              @if (currentRentals().length === 0) {
                <div class="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-ink-100">
                  <p class="text-ink-500">Yaklaşan bir rezervasyonunuz bulunmuyor.</p>
                  <button routerLink="/araclar" class="btn-primary mt-4">Hemen Araç Kirala</button>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (rental of currentRentals(); track rental.id) {
                    <div class="bg-white p-5 rounded-2xl shadow-sm border border-ink-100 flex justify-between items-center">
                      <div class="flex gap-4 items-center">
                        <div class="w-24 h-16 bg-ink-50 rounded-lg flex items-center justify-center text-2xl">🚗</div>
                        <div>
                          <h4 class="font-bold text-ink-900">{{ rental.brandName }} {{ rental.carModelName }}</h4>
                          <p class="text-xs text-ink-500">{{ rental.pickupLocationName }} — {{ rental.rentStartDate | date:'dd MMM yyyy' }}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-lg font-black text-avis-600 mb-2">₺{{ rental.totalPrice }}</div>
                        <button (click)="cancel(rental.id)" class="text-xs font-bold text-ink-400 hover:text-avis-600 transition">İPTAL ET</button>
                      </div>
                    </div>
                  }
                </div>
              }
            </section>
          }

          @if (activeTab() === 'history') {
             <section class="animate-fade-in">
                <h3 class="text-2xl font-extrabold text-ink-900 mb-6">Kiralama Geçmişi</h3>
                <div class="bg-white p-8 text-center rounded-2xl border border-ink-100 shadow-sm">
                  <p class="text-ink-500">Geçmiş kiralama kaydınız bulunmamaktadır.</p>
                </div>
             </section>
          }

          @if (activeTab() === 'billing') {
            <section class="animate-fade-in bg-white p-8 rounded-2xl shadow-sm border border-ink-100">
              <h3 class="text-xl font-bold mb-4 text-ink-900">Toplam Harcama Özeti</h3>
              <div class="text-4xl font-black text-avis-600">₺{{ totalSpent() | number }}</div>
              <p class="text-sm text-ink-500 mt-2">Bugüne kadar toplam {{ rentals().length }} kiralama yaptınız.</p>
            </section>
          }

          @if (activeTab() === 'password') {
            <section class="animate-fade-in bg-white p-8 rounded-2xl shadow-sm border border-ink-100">
              <h3 class="text-2xl font-extrabold text-ink-900 mb-6">Parola Değiştirme</h3>
              <form class="space-y-4 max-w-md">
                <div>
                  <label class="block text-sm font-bold text-ink-700 mb-1">Mevcut Parola</label>
                  <input type="password" class="w-full px-4 py-2 border border-ink-200 rounded-lg focus:border-avis-600 outline-none transition">
                </div>
                <div>
                  <label class="block text-sm font-bold text-ink-700 mb-1">Yeni Parola</label>
                  <input type="password" class="w-full px-4 py-2 border border-ink-200 rounded-lg focus:border-avis-600 outline-none transition">
                </div>
                <div>
                  <label class="block text-sm font-bold text-ink-700 mb-1">Yeni Parola (Tekrar)</label>
                  <input type="password" class="w-full px-4 py-2 border border-ink-200 rounded-lg focus:border-avis-600 outline-none transition">
                </div>
                <button type="button" class="bg-avis-600 hover:bg-avis-700 text-white font-bold py-2.5 px-6 rounded-lg transition w-full mt-4">
                  Parolayı Güncelle
                </button>
              </form>
            </section>
          }

          @if (activeTab() === 'cancel') {
            <section class="animate-fade-in bg-red-50 p-8 rounded-2xl border border-red-100">
              <h3 class="text-2xl font-extrabold text-red-700 mb-4">Üyelik İptali</h3>
              <p class="text-red-900 mb-6 text-sm leading-relaxed">
                <strong>Dikkat:</strong> Üyeliğinizi iptal ettiğinizde RentACar sistemindeki tüm kiralama geçmişiniz, faturalarınız ve kazanmış olduğunuz avantajlar kalıcı olarak silinecektir. Bu işlem geri alınamaz.
              </p>
              
              <div class="max-w-md bg-white p-6 rounded-xl shadow-sm border border-red-100">
                <label class="block text-sm font-bold text-red-900 mb-2">İşlemi onaylamak için parolanızı girin:</label>
                <input type="password" placeholder="Parolanız" class="w-full px-4 py-2.5 border border-red-200 rounded-lg focus:border-red-500 outline-none transition mb-4">
                
                <button type="button" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition">
                  Hesabımı Kalıcı Olarak Sil
                </button>
              </div>
            </section>
          }

        </main>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private rentalService = inject(RentalService);

  protected user = this.auth.user;
  protected activeTab = signal('rentals');
  protected rentals = signal<any[]>([]);

  protected currentRentals = computed(() => 
    this.rentals().filter(r => new Date(r.rentStartDate) > new Date())
  );

  protected totalSpent = computed(() => 
    this.rentals().reduce((acc, r) => acc + r.totalPrice, 0)
  );

  ngOnInit(): void {
    const userId = this.user()?.id;
    if (userId) {
      this.rentalService.getUserRentals(userId).subscribe(res => {
        if (res.success && res.data) {
          this.rentals.set(res.data);
        }
      });
    }
  }

  cancel(id: number): void {
    if (confirm('Rezervasyonunuzu iptal etmek istediğinize emin misiniz?')) {
      this.rentalService.cancelRental(id).subscribe(() => {
        this.rentals.update(list => list.filter(r => r.id !== id));
      });
    }
  }
}