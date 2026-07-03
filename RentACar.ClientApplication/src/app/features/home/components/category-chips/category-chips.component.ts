import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Category {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-category-chips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Ortalanmış yatay chip listesi -->
      <div class="flex items-center justify-center gap-2 overflow-x-auto scroll-hide">
        @for (cat of categories; track cat.id) {
          <button (click)="selectCategory(cat.id)"
                  [class]="isActive(cat.id) ? 'chip-active' : 'chip'"
                  class="whitespace-nowrap flex-shrink-0">
            @switch (cat.icon) {
              @case ('all') {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              }
              @case ('plane') {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              }
              @case ('calendar') {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              }
              @case ('pin') {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              }
              @case ('delivery') {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1"/>
                </svg>
              }
              @case ('city') {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              }
            }
            {{ cat.label }}
          </button>
        }
      </div>
    </div>
  `
})
export class CategoryChipsComponent {
  @Output() categoryChanged = new EventEmitter<string>();

  protected activeCategory = signal<string>('all');

  protected categories: Category[] = [
    { id: 'all',        label: 'Tüm',            icon: 'all' },
    { id: 'airport',    label: 'Havalimanları',  icon: 'plane' },
    { id: 'monthly',    label: 'Aylık',          icon: 'calendar' },
    { id: 'nearby',     label: 'Yakında',        icon: 'pin' },
    { id: 'delivery',   label: 'Teslim edilmiş', icon: 'delivery' },
    { id: 'istanbul',   label: 'Şehirler',       icon: 'city' },
  ];

  isActive(id: string): boolean {
    return this.activeCategory() === id;
  }

  selectCategory(id: string): void {
    this.activeCategory.set(id);
    this.categoryChanged.emit(id);
  }
}