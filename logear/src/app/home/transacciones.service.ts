import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs';
interface Gasto {
  id?: number;
  fecha: string;
  concepto: string;
  monto: number;
}

interface Ingreso {
  id?: number;
  fecha: string;
  concepto: string;
  monto: number;
}
// Interfaz unificada para transacciones, se diferencia por el campo "tipo"
export interface Transaccion {
  id?: number;
  fecha: string;
  concepto: string;
  monto: number;
  tipo: 'ingreso' | 'gasto';
}
@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {

  private ingresosUrl = 'http://localhost:3000/ingresos';
  private gastosUrl = 'http://localhost:3000/gastos';

  constructor(private http: HttpClient) {}

  // Guarda una transacción en el endpoint correspondiente según su tipo
  saveTransaccion(transaccion: Transaccion): Observable<Transaccion> {
    if (transaccion.tipo === 'ingreso') {
      return this.http.post<Transaccion>(this.ingresosUrl, transaccion);
    } else {
      return this.http.post<Transaccion>(this.gastosUrl, transaccion);
    }
  }

  // Obtiene todas las transacciones (ingresos y gastos) en un solo arreglo
  getTransacciones(): Observable<Transaccion[]> {
    return forkJoin({
      ingresos: this.http.get<Transaccion[]>(this.ingresosUrl),
      gastos: this.http.get<Transaccion[]>(this.gastosUrl)
    }).pipe(
      map(result => {
        // Aseguramos que cada registro tenga asignado el tipo correspondiente
        const transaccionesIngresos: Transaccion[] = result.ingresos.map(t => ({ ...t, tipo: 'ingreso' }));
        const transaccionesGastos: Transaccion[] = result.gastos.map(t => ({ ...t, tipo: 'gasto' }));
        return [...transaccionesIngresos, ...transaccionesGastos];
      })
    );
  }

  // Actualiza una transacción en el endpoint correspondiente
  updateTransaccion(transaccion: Transaccion): Observable<Transaccion> {
    if (transaccion.tipo === 'ingreso') {
      return this.http.put<Transaccion>(`${this.ingresosUrl}/${transaccion.id}`, transaccion);
    } else {
      return this.http.put<Transaccion>(`${this.gastosUrl}/${transaccion.id}`, transaccion);
    }
  }

  // Elimina una transacción en el endpoint correspondiente
  deleteTransaccion(transaccion: Transaccion): Observable<void> {
    if (transaccion.tipo === 'ingreso') {
      return this.http.delete<void>(`${this.ingresosUrl}/${transaccion.id}`);
    } else {
      return this.http.delete<void>(`${this.gastosUrl}/${transaccion.id}`);
    }
  }

  // Elimina múltiples transacciones en paralelo
  deleteTransacciones(transacciones: Transaccion[]): Observable<void> {
    const deleteRequests = transacciones.map(transaccion => {
      if (transaccion.tipo === 'ingreso') {
        return this.http.delete<void>(`${this.ingresosUrl}/${transaccion.id}`);
      } else {
        return this.http.delete<void>(`${this.gastosUrl}/${transaccion.id}`);
      }
    });

    return forkJoin(deleteRequests).pipe(
      map(() => { })
    );
  }
}
