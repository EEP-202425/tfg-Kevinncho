
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable, catchError, of, throwError } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import { tap } from "rxjs";
import { error } from "node:console";

interface User{
  email: string;
  contrasena: string;
  confirmcontrasena: string;

  token?: string;
}
@Injectable({
  providedIn: "root",
})
export class UsersService {
  //private usersUrl = 'http://localhost:3000/users';
  private usersUrl = 'http://localhost:8080/auth'; // URL de la API de Spring Boot
  private tokenKey = 'authToken';
  constructor(private http: HttpClient, private router: Router ) {}

  registrer(usuarios: { email: string; contrasena: string, confirmcontrasena: string }): Observable<any> {
    if(!usuarios.email || !usuarios.contrasena || !usuarios.confirmcontrasena){
      return throwError(() => new Error('Todos los campos son obligatorios.'));
    }
    if(usuarios.contrasena !== usuarios.confirmcontrasena){
      return throwError(() => new Error('Las contraseñas no coinciden'));
    }
    return this.http.post<any>(`${this.usersUrl}/register`, { email: usuarios.email, contrasena: usuarios.contrasena }, { responseType: 'text' as 'json' }).pipe(
      catchError(error => {
        let mensajeErr = 'Error al intentar registrar el usuario.';
      // Si el error es 400 y el mensaje indica que el usuario ya existe
      if (error.status === 400 && error.error && typeof error.error === 'string' && error.error.includes("ya existe")) {
        mensajeErr = 'El usuario ya existe.';
      }
      console.error(mensajeErr, error);
      return throwError(() => new Error(mensajeErr));
    })
  );
}
login(usuario: { email: string; contrasena: string }): Observable<any> {
  if (!usuario.email || !usuario.contrasena) {
    return throwError(() => new Error('Ingrese su correo y contraseña, por favor.'));
  }

  return this.http.post(`${this.usersUrl}/login`, usuario, { responseType: 'text' }).pipe(
    tap((token: string) => {
      this.setToken(token.trim()); // Guardar el token eliminando espacios en blanco
    }),
    catchError(error => {
      console.error('Error en el login:', error);
      return throwError(() => new Error('Usuario o contraseña incorrectos.'));
    })
  );
}
/** ALMACENAR TOKEN */
setToken(token: string): void {
  localStorage.setItem(this.tokenKey, token);
  console.log("Token guardado en localStorage:", token);
}

/** OBTENER TOKEN */
getToken(): string | null {
  return localStorage.getItem(this.tokenKey);
}

/** VERIFICAR SI EL USUARIO ESTÁ AUTENTICADO */
isAuthenticated(): boolean {
  const token = this.getToken();
  if (!token) {
    return false;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() < payload.exp * 1000; // Comparar la fecha de expiración
  } catch (e) {
    return false;
  }
}

/** CERRAR SESIÓN */
logout(): void {
  localStorage.removeItem(this.tokenKey);
  this.router.navigate(['/login']);
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
