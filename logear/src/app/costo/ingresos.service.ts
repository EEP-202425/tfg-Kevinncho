import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
interface Ingresos{
  id?: number;
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
  updateIncome(income: Ingresos): Observable<Ingresos> {
    // Asegúrate de que `income` tenga un `id` válido para usar en la URL
    return this.http.put<Ingresos>(`${this.apiUrl}/${income.id}`, income);
  }
  deleteIncome(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


}
