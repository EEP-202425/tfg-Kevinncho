import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
interface Ingresos{
  fecha: string;
  concepto: string;
  monto: number;
}
@Injectable({
  providedIn: 'root'
})
export class IngresosService {
  private apiUrl = 'http://localhost:3000/ingresos'; // Ruta para los ingresos

  constructor(private http: HttpClient) { }

  saveIncome(income: Ingresos): Observable<Ingresos> {
    return this.http.post<Ingresos>(this.apiUrl, income);
  }
   // Método opcional para obtener ingresos
   getIncomes(): Observable<Ingresos[]> {
    return this.http.get<Ingresos[]>(this.apiUrl);
  }

}
