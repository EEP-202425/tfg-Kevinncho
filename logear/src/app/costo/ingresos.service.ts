import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs';
import { UsersService } from '../users/users.service';
import { catchError,throwError } from 'rxjs';

interface Ingresos{
  idIngreso?: number;
  fecha: string;
  concepto: string;
  monto: number;
}
@Injectable({
  providedIn: 'root'
})
export class IngresosService {
  private apiUrl = 'http://localhost:8080/ingresos'; // Ruta para los ingresos

  constructor(private http: HttpClient, private userService: UsersService) { }

  saveIncome(income: Ingresos): Observable<Ingresos> {
    const token = this.userService.getToken(); // Obtener el token desde UserService

    if (!token) {
      console.error('Token no encontrado');
      return throwError(() => new Error('Token no encontrado')); // Si no hay token, devolvemos un error
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Ingresos>(this.apiUrl, income, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al guardar ingreso', error);
          return throwError(() => new Error('Error al guardar ingreso'));
        })
      );
  }
  getIncomes(): Observable<Ingresos[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Ingresos[]>(this.apiUrl, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en la solicitud de ingresos:', error);
          return throwError(() => new Error('Error en la solicitud de ingresos'));
        })
      );
  }
  private getAuthHeaders(): HttpHeaders {
    const token = this.userService.getToken();
    if (!token) {
      console.error('Token no encontrado');
      throw new Error('Token no encontrado');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  updateIncome(income: Ingresos): Observable<Ingresos> {
    if (!income.idIngreso) {
      console.error('ID de ingreso no proporcionado');
      return throwError(() => new Error('ID de ingreso no proporcionado'));
    }

    const token = this.userService.getToken(); // Obtener el token desde UserService

    if (!token) {
      console.error('Token no encontrado');
      return throwError(() => new Error('Token no encontrado')); // Si no hay token, devolvemos un error
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<Ingresos>(`${this.apiUrl}/${income.idIngreso}`, income, { headers })
      .pipe(
        catchError(error => {
          console.error('Error al actualizar ingreso', error);
          return throwError(() => new Error('Error al actualizar ingreso'));
        })
      );
  }
  deleteIncome(idIngreso: number): Observable<void> {
    if (!idIngreso) {
      console.error('ID de ingreso no proporcionado');
      return throwError(() => new Error('ID de ingreso no proporcionado'));
    }

    const token = this.userService.getToken(); // Obtener el token desde UserService
    if (!token) {
      console.error('Token no encontrado');
      return throwError(() => new Error('Token no encontrado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Especificamos responseType: 'text' para que Angular no intente parsear un JSON vacío.
    return this.http.delete(`${this.apiUrl}/${idIngreso}`, { headers, responseType: 'text' })
      .pipe(
        map(() => {}), // Convertir la respuesta (texto) en void
        catchError(error => {
          console.error('Error al eliminar ingreso', error);
          return throwError(() => new Error('Error al eliminar ingreso'));
        })
      );
  }

  deleteIncomes(ids: number[]): Observable<void> {
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
        console.error('Error al eliminar ingresos', error);
        return throwError(() => new Error('Error al eliminar ingresos'));
      })
    );
  }



}
