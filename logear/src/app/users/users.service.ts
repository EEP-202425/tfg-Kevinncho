
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable, catchError, of } from "rxjs";
import { CookieService } from "ngx-cookie-service";

interface User{
  email: string;
  password: string;
}
@Injectable({
  providedIn: "root",
})
export class UsersService {
  private usersUrl = 'http://localhost:3000/users';
  constructor(private http: HttpClient ) {}

  login(user: { email: string; password: string }): Observable<{ token: string } | null> {
    return this.http.get<{ users: User[] }>(this.usersUrl).pipe(
      map(data => {
        console.log('Datos recibidos de la API:', data);  // Agrega este log para depuración
        if (Array.isArray(data.users) && data.users.length > 0) {
          const foundUser = data.users.find(u=>u.email === user.email && u.password === user.password);
          if (foundUser) {
            return { token: 'dummy-token' }; // Simula un token de autenticación
          } else {
            throw new Error('Credenciales inválidas');
          }
        } else {
          throw new Error('No se encontraron usuarios');
        }
      }),
      catchError(error => {
        console.error('Error en el servicio:', error);
        return of(null); // Devuelve null si hay un error
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token); // Almacena el token en localStorage
  }

  getToken(): string | null {
    return localStorage.getItem('authToken'); // Recupera el token de localStorage
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl).pipe( // Usar la URL correcta
      catchError(error => {
        console.error('Error en la solicitud de usuarios:', error);
        return of([]); // Devuelve un array vacío en caso de error
      }),
      map(users => {
        if (users && users.length > 0) {
          return users;
        } else {
          throw new Error('No se encontraron usuarios');
        }
      })
    );
  }
}
