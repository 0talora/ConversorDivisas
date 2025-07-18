import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import {  RouterOutlet } from '@angular/router'; // Importa el módulo, no RouterOutlet
import { ConversorService } from './conversor-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'ConversorDivisas';

  cantidad: number = 1;
  from = signal<string>('EUR');
  to = signal<string>('USD');
  resultado = signal<number | null>(null);

  fromControl = new FormControl('EUR');
  toControl = new FormControl('USD');

constructor(private conversorService: ConversorService) {
  this.fromControl.valueChanges.subscribe(valor => {
    this.from.set(valor ?? '');
    this.convertir();
  });

  this.toControl.valueChanges.subscribe(valor => {
    this.to.set(valor ?? '');
    this.convertir();
  });
}

monedas: { siglas: string; nombre: string; imagen: string }[] = [
  { siglas: "USD", nombre: "Dólar estadounidense", imagen: "assets/banderas/estados-unidos-de-america.png" },
  { siglas: "EUR", nombre: "Euro", imagen: "assets/banderas/union-europea.png" },
  { siglas: "JPY", nombre: "Yen japonés", imagen: "assets/banderas/japon.png" },
  { siglas: "GBP", nombre: "Libra esterlina", imagen: "assets/banderas/reino-unido.png" },
  { siglas: "CNY", nombre: "Yuan renminbi chino", imagen: "assets/banderas/porcelana.png" },
  { siglas: "CHF", nombre: "Franco suizo", imagen: "assets/banderas/suiza.png" },
  { siglas: "CAD", nombre: "Dólar canadiense", imagen: "assets/banderas/canada.png" },
  { siglas: "AUD", nombre: "Dólar australiano", imagen: "assets/banderas/australia.png" },
  { siglas: "INR", nombre: "Rupia india", imagen: "assets/banderas/mundo.png" }, // No se encontró India
  { siglas: "MXN", nombre: "Peso mexicano", imagen: "assets/banderas/mundo.png" }, // No se encontró México
  { siglas: "BRL", nombre: "Real brasileño", imagen: "assets/banderas/brasil.png" },

  // Resto de monedas
  { siglas: "BGN", nombre: "Lev búlgaro", imagen: "assets/banderas/bulgaria.png" },
  { siglas: "CZK", nombre: "Corona checa", imagen: "assets/banderas/republica-checa.png" },
  { siglas: "DKK", nombre: "Corona danesa", imagen: "assets/banderas/dinamarca.png" },
  { siglas: "HKD", nombre: "Dólar de Hong Kong", imagen: "assets/banderas/hong-kong.png" },
  { siglas: "HUF", nombre: "Florín húngaro", imagen: "assets/banderas/hungria.png" },
  { siglas: "IDR", nombre: "Rupia indonesia", imagen: "assets/banderas/bandera-de-indonesia.png" },
  { siglas: "ILS", nombre: "Nuevo séquel israelí", imagen: "assets/banderas/israel.png" },
  { siglas: "ISK", nombre: "Corona islandesa", imagen: "assets/banderas/islandia.png" },
  { siglas: "KRW", nombre: "Won surcoreano", imagen: "assets/banderas/corea-del-sur.png" },
  { siglas: "MYR", nombre: "Ringgit malayo", imagen: "assets/banderas/malasia.png" },
  { siglas: "NOK", nombre: "Corona noruega", imagen: "assets/banderas/noruega.png" },
  { siglas: "NZD", nombre: "Dólar neozelandés", imagen: "assets/banderas/nueva-zelanda.png" },
  { siglas: "PHP", nombre: "Peso filipino", imagen: "assets/banderas/filipinas.png" },
  { siglas: "PLN", nombre: "Złoty polaco", imagen: "assets/banderas/polonia.png" },
  { siglas: "RON", nombre: "Leu rumano", imagen: "assets/banderas/rumania.png" },
  { siglas: "SEK", nombre: "Corona sueca", imagen: "assets/banderas/suecia.png" },
  { siglas: "SGD", nombre: "Dólar singapurense", imagen: "assets/banderas/singapur.png" },
  { siglas: "THB", nombre: "Baht tailandés", imagen: "assets/banderas/tailandia.png" },
  { siglas: "TRY", nombre: "Lira turca", imagen: "assets/banderas/pavo.png" },
  { siglas: "ZAR", nombre: "Rand sudafricano", imagen: "assets/banderas/sudafrica.png" },
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
      console.log('Datos incompletos o inválidos:', { from, to, amount });
    }
  }

  getImagen(siglas: string | null): string | undefined {
    return this.monedas.find(m => m.siglas === siglas)?.imagen;
  }


}