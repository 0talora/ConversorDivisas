import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

const storageKey = 'otalora-theme';
const choices = ['system', 'light', 'dark'] as const;
type Theme = typeof choices[number];

@Injectable({ providedIn: 'root' })
export class ThemePreference {
  private readonly document = inject(DOCUMENT);
  private readonly selected = signal<Theme>('system');
  readonly value = this.selected.asReadonly();
  readonly choices = choices;

  constructor() {
    let saved: string | null = null;
    try { saved = localStorage.getItem(storageKey); } catch { /* Use the system theme. */ }
    this.apply(saved === 'light' || saved === 'dark' ? saved : 'system');
  }

  set(value: string): void {
    if (value !== 'system' && value !== 'light' && value !== 'dark') return;
    this.apply(value);
    try { localStorage.setItem(storageKey, value); } catch { /* Keep the choice for this visit. */ }
  }

  private apply(value: Theme): void {
    this.selected.set(value);
    this.document.documentElement.dataset['theme'] = value;
  }
}
