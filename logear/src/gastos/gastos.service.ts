import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from 'rxjs';
import { forkJoin } from 'rxjs';
interface Gastos{
  id?: number;
  fecha: string;
  concepto: string;
  monto: number;
}
@Injectable({
  providedIn: 'root'
})
export class GastosService {

  private apiUrl = 'http://localhost:3000/gastos'; // Ruta para los gastos


  constructor(private http: HttpClient) { }
  saveGasto(income: Gastos): Observable<Gastos> {
      return this.http.post<Gastos>(this.apiUrl, income);
  }
  getGastos(): Observable<Gastos[]> {
      return this.http.get<Gastos[]>(this.apiUrl);
    }
    updateGastos(gastos: Gastos): Observable<Gastos> {
      // Asegúrate de que `income` tenga un `id` válido para usar en la URL
      return this.http.put<Gastos>(`${this.apiUrl}/${gastos.id}`, gastos);
    }
    deleteGasto(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
deleteGastos(ids: number[]): Observable<void> {
    // Crear una solicitud DELETE para cada ID
    const deleteRequests = ids.map(id => this.http.delete<void>(`${this.apiUrl}/${id}`));

    // Ejecutar todas las solicitudes en paralelo
    return forkJoin(deleteRequests).pipe(
      // Cuando todas las solicitudes terminen, emitir un valor vacío
      map(() => {})
    );
  }


}
