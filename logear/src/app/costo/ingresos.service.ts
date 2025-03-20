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
    return this.http.post<Ingresos>(this.apiUrl, income);
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
    console.log("Token obtenido:", token);
    if (!token) {
      console.error('Token no encontrado');
      throw new Error('Token no encontrado');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  updateIncome(income: Ingresos): Observable<Ingresos> {
    // Asegúrate de que `income` tenga un `id` válido para usar en la URL
    return this.http.put<Ingresos>(`${this.apiUrl}/${income.idIngreso}`, income);
  }
  deleteIncome(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  deleteMultipleIncomes(ids: number[]): Observable<void> {
    // Realiza múltiples peticiones DELETE para cada ID
    const requests = ids.map(id => this.http.delete<void>(`${this.apiUrl}/${id}`));
    return new Observable(observer => {
      Promise.all(requests)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }
  deleteIncomes(ids: number[]): Observable<void> {
    // Crear una solicitud DELETE para cada ID
    const deleteRequests = ids.map(id => this.http.delete<void>(`${this.apiUrl}/${id}`));

    // Ejecutar todas las solicitudes en paralelo
    return forkJoin(deleteRequests).pipe(
      // Cuando todas las solicitudes terminen, emitir un valor vacío
      map(() => {})
    );
  }



}
