import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UsersService } from '../users/users.service';
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
  transaccionId?: number;
  fecha: string;
  concepto: string;
  monto: number;
  tipo: 'INGRESO' | 'GASTO';
}
@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {

  //private ingresosUrl = 'http://localhost:3000/ingresos';
  //private gastosUrl = 'http://localhost:3000/gastos';

  // URL unificada para todas las transacciones en Spring Boot
  private transaccionesUrl = 'http://localhost:8080/transacciones';


  constructor(private http: HttpClient, private userService: UsersService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.userService.getToken(); // Obtener el token desde UserService

    if (!token) {
      console.error('Token no encontrado');
      throw new Error('Token no encontrado');
    }

    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  saveTransaccion(transaccion: Transaccion): Observable<Transaccion> {
    const token = this.userService.getToken(); // Obtener el token desde UserService

    if (!token) {
      console.error('Token no encontrado');
      return throwError(() => new Error('Token no encontrado')); // Si no hay token, devolvemos un error
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);


    return this.http.post<Transaccion>(this.transaccionesUrl, transaccion, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al guardar transacción', error);
          return throwError(() => new Error('Error al guardar transacción'));
        })
      );
  }

getTransacciones(): Observable<any> {
  const token = this.userService.getToken(); // Obtener el token desde UserService

  if (!token) {
    console.error('Token no encontrado');
    return of([]); // Si no hay token, devolvemos un arreglo vacío
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.get<any>(this.transaccionesUrl, { headers })
    .pipe(
      catchError(error => {
        console.error('Error en la solicitud:', error);
        return throwError(() => new Error(error));
      })
    );
}


   // Actualiza una transacción existente (incluye headers para enviar el token)
   updateTransaccion(transaccion: Transaccion): Observable<Transaccion> {
    if (!transaccion.transaccionId) {
      return throwError(() => new Error('ID de transacción no proporcionado'));
    }
    const headers = this.getAuthHeaders();
    return this.http.put<Transaccion>(`${this.transaccionesUrl}/${transaccion.transaccionId}`, transaccion, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al actualizar transacción', error);
          return throwError(() => new Error('Error al actualizar transacción'));
        })
      );
  }

  // Elimina una transacción (incluye headers para enviar el token)
  deleteTransaccion(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.transaccionesUrl}/${id}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al eliminar transacción', error);
          return throwError(() => new Error('Error al eliminar transacción'));
        })
      );
  }
    // Elimina múltiples transacciones en paralelo (también incluye headers)
  deleteTransacciones(transacciones: Transaccion[]): Observable<void> {
    const headers = this.getAuthHeaders();
    const deleteRequests = transacciones.map(transaccion => {
      return this.http.delete<void>(`${this.transaccionesUrl}/${transaccion.transaccionId}`, { headers });
    });

    return forkJoin(deleteRequests).pipe(
      map(() => { })
    );
  }
}
