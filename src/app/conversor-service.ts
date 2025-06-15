import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConversorService {

  private http = inject(HttpClient);
  private apiUrl = 'https://api.frankfurter.app/latest';

convertir(from: string, to: string, amount: number): Observable<number> {
  const url = `${this.apiUrl}?amount=${amount}&from=${from}&to=${to}`;
  return this.http.get<{ rates: Record<string, number> }>(url).pipe(
    map(res => res.rates[to])
  );
}

  constructor() {}

}