import searchContent from './search-content.json';
import { DOCUMENT, CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { catchError, combineLatest, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { ConversorService } from './conversor-service';

const currencyCodes = [
  'USD', 'EUR', 'JPY', 'GBP', 'CNY', 'CHF', 'CAD', 'AUD', 'INR', 'MXN', 'BRL',
  'BGN', 'CZK', 'DKK', 'HKD', 'HUF', 'IDR', 'ILS', 'ISK', 'KRW', 'MYR', 'NOK',
  'NZD', 'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'TRY', 'ZAR'
];

export const languages = { es: 'Español', en: 'English', fr: 'Français', de: 'Deutsch' };
type Language = keyof typeof languages;
const languageKey = 'currency-converter-language';
const copy = {
  es: {
    title: 'Conversor de divisas', description: 'Consulta el cambio entre las principales monedas del mundo.',
    language: 'Idioma', amount: 'Cantidad', from: 'Convertir de', to: 'Convertir a',
    result: 'Importe convertido', loading: 'Consultando el tipo de cambio…',
    error: 'No se pudo obtener el cambio. Inténtalo de nuevo.',
    sameCurrency: 'Elige dos monedas distintas.', developed: 'Desarrollado con', by: 'por Pablo Otalora'
  },
  en: {
    title: 'Currency converter', description: 'Check exchange rates between the world’s major currencies.',
    language: 'Language', amount: 'Amount', from: 'Convert from', to: 'Convert to',
    result: 'Converted amount', loading: 'Getting the exchange rate…',
    error: 'Could not get the exchange rate. Please try again.',
    sameCurrency: 'Choose two different currencies.', developed: 'Built with', by: 'by Pablo Otalora'
  },
  fr: {
    title: 'Convertisseur de devises', description: 'Consultez les taux de change des principales devises mondiales.',
    language: 'Langue', amount: 'Montant', from: 'Convertir de', to: 'Convertir en',
    result: 'Montant converti', loading: 'Récupération du taux de change…',
    error: 'Impossible de récupérer le taux. Réessayez.',
    sameCurrency: 'Choisissez deux devises différentes.', developed: 'Développé avec', by: 'par Pablo Otalora'
  },
  de: {
    title: 'Währungsrechner', description: 'Vergleiche Wechselkurse der wichtigsten Währungen weltweit.',
    language: 'Sprache', amount: 'Betrag', from: 'Umrechnen von', to: 'Umrechnen in',
    result: 'Umgerechneter Betrag', loading: 'Wechselkurs wird abgerufen…',
    error: 'Wechselkurs konnte nicht abgerufen werden. Bitte erneut versuchen.',
    sameCurrency: 'Wähle zwei verschiedene Währungen.', developed: 'Entwickelt mit', by: 'von Pablo Otalora'
  }
};

function isLanguage(value: string): value is Language {
  return Object.hasOwn(languages, value);
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly converter = inject(ConversorService);
  private readonly document = inject(DOCUMENT);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly languages = languages;
  protected readonly languageCodes = Object.keys(languages) as Language[];
  protected language: Language;
  protected readonly fromControl = new FormControl('EUR', { nonNullable: true });
  protected readonly toControl = new FormControl('USD', { nonNullable: true });
  protected readonly amountControl = new FormControl(1, { nonNullable: true });
  protected readonly result = signal<number | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly sameCurrency = signal(false);
  protected readonly currencyOptions = signal<{ code: string; name: string }[]>([]);
  protected get searchText() {
    return searchContent[this.language];
  }

  protected languagePath(language: Language): string {
    return language === 'es' ? '/' : `/${language}/`;
  }

  protected readonly strings = () => copy[this.language];

  constructor() {
    this.language = this.detectLanguage();
    this.updateCurrencyNames();
    this.updateMetadata();
    combineLatest([
      this.fromControl.valueChanges.pipe(startWith(this.fromControl.value), distinctUntilChanged()),
      this.toControl.valueChanges.pipe(startWith(this.toControl.value), distinctUntilChanged()),
      this.amountControl.valueChanges.pipe(startWith(this.amountControl.value), distinctUntilChanged())
    ]).pipe(
      switchMap(([from, to, amount]) => {
        this.result.set(null);
        this.error.set(false);
        if (!Number.isFinite(amount) || amount <= 0) {
          this.loading.set(false);
          this.sameCurrency.set(false);
          return of(null);
        }
        if (from === to) {
          this.loading.set(false);
          this.sameCurrency.set(true);
          return of(null);
        }
        this.sameCurrency.set(false);
        this.loading.set(true);
        return this.converter.convertir(from, to, amount).pipe(
          map(value => ({ value, failed: false })),
          catchError(() => of({ value: null, failed: true }))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(response => {
      this.loading.set(false);
      this.error.set(Boolean(response?.failed));
      this.result.set(response?.value === null ? null : Number(response?.value.toFixed(2)));
    });
  }

  changeLanguage(value: string): void {
    if (!isLanguage(value)) return;
    if (this.document.documentElement.hasAttribute('data-page-language') && value !== this.language) {
      this.document.location.assign(this.languagePath(value));
      return;
    }
    try {
      localStorage.setItem(languageKey, value);
    } catch {
      // The selected language remains active for this page.
    }
    this.language = value;
    this.updateMetadata();
    this.updateCurrencyNames();
  }

  getFormattedResult(): string {
    const value = this.result();
    if (value === null) return '—';
    return new Intl.NumberFormat(this.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }

  private detectLanguage(): Language {
    const pageLanguage = this.document.documentElement.dataset['pageLanguage'];
    if (pageLanguage && isLanguage(pageLanguage)) return pageLanguage;
    try {
      const saved = localStorage.getItem(languageKey);
      if (saved && isLanguage(saved)) return saved;
    } catch {
      // Browser language detection remains available when storage is blocked.
    }
    return (navigator.languages.length ? navigator.languages : [navigator.language])
      .map(locale => locale.toLowerCase().split('-')[0])
      .find(isLanguage) ?? 'es';
  }

  private updateMetadata(): void {
    this.document.documentElement.lang = this.language;
    this.titleService.setTitle(this.searchText.title);
    this.metaService.updateTag({ name: 'description', content: this.searchText.description });
  }

  private updateCurrencyNames(): void {
    const names = new Intl.DisplayNames([this.language], { type: 'currency' });
    this.currencyOptions.set(currencyCodes.map(code => ({ code, name: names.of(code) ?? code })));
  }
}
