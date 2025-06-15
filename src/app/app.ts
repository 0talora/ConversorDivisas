import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ConversorService } from './conversor-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'ConversorDivisas';

  cantidad: number=1;
  from = signal<string>('EUR');
  to = signal<string>('USD');
  resultado = signal<number | null>(null);

  fromControl = new FormControl('EUR');
  toControl = new FormControl('USD');

  constructor(private conversorService: ConversorService) {
    this.fromControl.valueChanges.subscribe(valor => this.from.set(valor ?? ''));
    this.toControl.valueChanges.subscribe(valor => this.to.set(valor ?? ''));
  }


  monedas: { siglas: string; nombre: string }[] = [
    { siglas: "AUD", nombre: "Dólar australiano" },
    { siglas: "BGN", nombre: "Lev búlgaro" },
    { siglas: "BRL", nombre: "Real brasileño" },
    { siglas: "CAD", nombre: "Dólar canadiense" },
    { siglas: "CHF", nombre: "Franco suizo" },
    { siglas: "CNY", nombre: "Yuan renminbi chino" },
    { siglas: "CZK", nombre: "Corona checa" },
    { siglas: "DKK", nombre: "Corona danesa" },
    { siglas: "EUR", nombre: "Euro" },
    { siglas: "GBP", nombre: "Libra esterlina" },
    { siglas: "HKD", nombre: "Dólar de Hong Kong" },
    { siglas: "HUF", nombre: "Florín húngaro" },
    { siglas: "IDR", nombre: "Rupia indonesia" },
    { siglas: "ILS", nombre: "Nuevo séquel israelí" },
    { siglas: "INR", nombre: "Rupia india" },
    { siglas: "ISK", nombre: "Corona islandesa" },
    { siglas: "JPY", nombre: "Yen japonés" },
    { siglas: "KRW", nombre: "Won surcoreano" },
    { siglas: "MXN", nombre: "Peso mexicano" },
    { siglas: "MYR", nombre: "Ringgit malayo" },
    { siglas: "NOK", nombre: "Corona noruega" },
    { siglas: "NZD", nombre: "Dólar neozelandés" },
    { siglas: "PHP", nombre: "Peso filipino" },
    { siglas: "PLN", nombre: "Złoty polaco" },
    { siglas: "RON", nombre: "Leu rumano" },
    { siglas: "SEK", nombre: "Corona sueca" },
    { siglas: "SGD", nombre: "Dólar singapurense" },
    { siglas: "THB", nombre: "Baht tailandés" },
    { siglas: "TRY", nombre: "Lira turca" },
    { siglas: "USD", nombre: "Dólar estadounidense" },
    { siglas: "ZAR", nombre: "Rand sudafricano" },
  ];

 ngOnInit(): void {
    this.convertir();
  }

convertir() {
  console.log('convertir() llamado');
  const from = this.from();
  const to = this.to();
  const amount = this.cantidad ?? 0;

  if (from && to && amount > 0) {
    this.conversorService.convertir(from, to, amount).subscribe(resultado => {
      const resultadoRedondeado = Number(resultado.toFixed(2));
      this.resultado.set(resultadoRedondeado);
    });
  } else {
    console.log('Datos incompletos o inválidos:', {from, to, amount});
  }
}


}
