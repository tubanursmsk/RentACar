import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoData {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonical?: string;
  noindex?: boolean;
  author?: string;
  lang?: 'tr' | 'en';
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  // ═══ Sabitler ═══
  private readonly SITE_NAME = 'RentACar';
  private readonly BASE_URL = 'https://rentacar.tubanursimsek.com.tr';
  private readonly DEFAULT_IMAGE = `${this.BASE_URL}/assets/og-default.jpg`;
  private readonly DEFAULT_DESCRIPTION =
    "RentACar, Türkiye'nin dört bir yanında 7/24 hizmet veren güvenilir araç kiralama platformu. " +
    "Ekonomiden lükse geniş araç filosu ile en uygun fiyatlarla araç kiralama fırsatı.";

  /**
   * Ana metod — Bir sayfanın tüm SEO ayarlarını tek çağrıyla uygular
   */
  updateSeo(data: SeoData): void {
    const fullTitle = data.title.includes(this.SITE_NAME)
      ? data.title
      : `${data.title} — ${this.SITE_NAME}`;

    // ═══ Standart meta tags ═══
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: data.description });

    if (data.keywords) {
      this.meta.updateTag({ name: 'keywords', content: data.keywords });
    }

    if (data.author) {
      this.meta.updateTag({ name: 'author', content: data.author });
    }

    // Robots direktifi
    if (data.noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }

    // ═══ Open Graph (Facebook, LinkedIn, WhatsApp) ═══
    this.meta.updateTag({ property: 'og:title', content: data.ogTitle || fullTitle });
    this.meta.updateTag({ property: 'og:description', content: data.ogDescription || data.description });
    this.meta.updateTag({ property: 'og:image', content: data.ogImage || this.DEFAULT_IMAGE });
    this.meta.updateTag({ property: 'og:type', content: data.ogType || 'website' });
    this.meta.updateTag({ property: 'og:url', content: data.ogUrl || this.getCurrentUrl() });
    this.meta.updateTag({ property: 'og:site_name', content: this.SITE_NAME });
    this.meta.updateTag({ property: 'og:locale', content: data.lang === 'en' ? 'en_US' : 'tr_TR' });

    // ═══ Twitter Card ═══
    this.meta.updateTag({ name: 'twitter:card', content: data.twitterCard || 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: data.ogTitle || fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: data.ogDescription || data.description });
    this.meta.updateTag({ name: 'twitter:image', content: data.ogImage || this.DEFAULT_IMAGE });

    // ═══ Canonical URL ═══
    this.setCanonicalUrl(data.canonical || this.getCurrentUrl());

    // ═══ Language ═══
    if (data.lang) {
      this.doc.documentElement.lang = data.lang;
    }
  }

  /**
   * Hızlı title güncelleme
   */
  setTitle(title: string): void {
    const fullTitle = title.includes(this.SITE_NAME)
      ? title
      : `${title} — ${this.SITE_NAME}`;
    this.title.setTitle(fullTitle);
  }

  /**
   * Canonical URL — Google'a "asıl adres bu" der (duplicate content önler)
   */
  private setCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.doc.querySelector("link[rel='canonical']");

    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  /**
   * hreflang tags — Aynı içerik farklı dillerde varsa Google'a bildirir
   */
  setHreflangs(currentPath: string): void {
    // Mevcut hreflang'ları temizle
    const existing = this.doc.querySelectorAll("link[rel='alternate']");
    existing.forEach(el => el.remove());

    const trUrl = `${this.BASE_URL}${currentPath}`;
    const enUrl = `${this.BASE_URL}/en${currentPath}`;

    this.addHreflang('tr', trUrl);
    this.addHreflang('en', enUrl);
    this.addHreflang('x-default', trUrl);
  }

  private addHreflang(lang: string, url: string): void {
    const link = this.doc.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', lang);
    link.setAttribute('href', url);
    this.doc.head.appendChild(link);
  }

  /**
   * JSON-LD Schema.org markup — Structured data
   * Google'ın zengin sonuç göstermesini sağlar (yıldız, fiyat, telefon...)
   */
  setJsonLd(schema: object): void {
    // Önceki schema'yı temizle
    const existing = this.doc.querySelector("script[type='application/ld+json']");
    if (existing) existing.remove();

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }

  private getCurrentUrl(): string {
    if (typeof window !== 'undefined') {
      return `${this.BASE_URL}${window.location.pathname}`;
    }
    return this.BASE_URL;
  }

  // ═══ Public getters ═══
  get baseUrl(): string { return this.BASE_URL; }
  get siteName(): string { return this.SITE_NAME; }
  get defaultImage(): string { return this.DEFAULT_IMAGE; }
  get defaultDescription(): string { return this.DEFAULT_DESCRIPTION; }
}
