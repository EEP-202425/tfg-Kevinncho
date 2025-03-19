import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {map} from 'rxjs';
import { forkJoin } from 'rxjs';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { UsersService } from '../app/users/users.service';
import { catchError } from 'rxjs';
interface Gastos{
  idGasto?: number;
  fecha: string;
  concepto: string;
  monto: number;
}
@Injectable({
  providedIn: 'root'
})
export class GastosService {

  private apiUrl = 'http://localhost:8080/gastos';

  constructor(private http: HttpClient, private userService: UsersService) { }
  saveGasto(gasto: Gastos): Observable<Gastos> {
    const token = this.userService.getToken(); // Obtener el token desde UserService

    if (!token) {
      console.error('Token no encontrado');
      return throwError(() => new Error('Token no encontrado')); // Si no hay token, devolvemos un error
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Gastos>(this.apiUrl, gasto, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al guardar gasto', error);
          return throwError(() => new Error('Error al guardar gasto'));
        })
      );
  }
  private getAuthHeaders(): HttpHeaders {
    const token = this.userService.getToken();
    console.log("Token obtenido:", token);
    if (!token) {
      console.error('Token no encontrado');
      throw new Error('Token no encontrado');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getGastos(): Observable<Gastos[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Gastos[]>(this.apiUrl, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en la solicitud de gastos:', error);
          return throwError(() => new Error('Error en la solicitud de gastos'));
        })
      );
  }
  updateGastos(gasto: Gastos): Observable<Gastos> {
    if (!gasto.idGasto) {
      console.error('ID de gasto no proporcionado');
      return throwError(() => new Error('ID de gasto no proporcionado'));
    }

    const token = this.userService.getToken(); // Obtener el token desde UserService

    if (!token) {
      console.error('Token no encontrado');
      return throwError(() => new Error('Token no encontrado')); // Si no hay token, devolvemos un error
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<Gastos>(`${this.apiUrl}/${gasto.idGasto}`, gasto, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al actualizar gasto', error);
          return throwError(() => new Error('Error al actualizar gasto'));
        })
      );
  }


  deleteGasto(idGasto: number): Observable<void> {
    if (!idGasto) {
      console.error('ID de gasto no proporcionado');
      return throwError(() => new Error('ID de gasto no proporcionado'));
    }

    const token = this.userService.getToken(); // Obtener el token desde UserService
    if (!token) {
      console.error('Token no encontrado');
      return throwError(() => new Error('Token no encontrado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Especificamos responseType: 'text' para que Angular no intente parsear un JSON vacío.
    return this.http.delete(`${this.apiUrl}/${idGasto}`, { headers, responseType: 'text' })
      .pipe(
        map(() => {}), // Convertir la respuesta (texto) en void
        catchError(error => {
          console.error('Error al eliminar gasto', error);
          return throwError(() => new Error('Error al eliminar gasto'));
        })
      );
  }
  deleteGastos(ids: number[]): Observable<void> {
    const token = this.userService.getToken(); // Obtener el token desde UserService

    if (!token) {
      console.error('Token no encontrado');
      return throwError(() => new Error('Token no encontrado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Crear una solicitud DELETE para cada ID, especificando responseType: 'text'
    const deleteRequests = ids.map(id =>
      this.http.delete(`${this.apiUrl}/${id}`, { headers, responseType: 'text' })
    );

    // Ejecutar todas las solicitudes en paralelo y mapear la respuesta a void
    return forkJoin(deleteRequests).pipe(
      map(() => {}),
      catchError(error => {
        console.error('Error al eliminar gastos', error);
        return throwError(() => new Error('Error al eliminar gastos'));
      })
    );
  }


}
