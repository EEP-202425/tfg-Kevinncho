
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
  private usersUrl = 'http://localhost:3000/users';
  private tokenKey = 'authToken';
  constructor(private http: HttpClient, private router: Router ) {}

  registrer(usuarios: { email: string; contrasena: string, confirmcontrasena: string }): Observable<any> {
    if(!usuarios.email || !usuarios.contrasena || !usuarios.confirmcontrasena){
      return throwError(()=> new Error('Todos los campos son obligatorios.'));
    }
    if(usuarios.contrasena !== usuarios.confirmcontrasena){
      return throwError(()=> new Error('Las contraseñas no coinciden'));
    }
    return this.http.post<any>(this.usersUrl, {email: usuarios.email,contrasena: usuarios.contrasena    }).pipe(
      catchError(error => {
        const mensajeErr = 'Error al intentar registrar el usuario.';
        console.error(mensajeErr, error);
        return throwError(() => new Error(mensajeErr));
      })
    );
  }

  login(usuario: { email: string; contrasena: string }): Observable<any> {
    if(!usuario.email || !usuario.contrasena){
      return throwError(()=> new Error('Ingrese su correo y contraseña, por favor.'));
    }
    return this.http.get<any[]>(this.usersUrl).pipe(
      map(usuarios =>{
        const encontrarUsuarios= usuarios.find(u => u.email === usuario.email && u.contrasena === usuario.contrasena);
      if(encontrarUsuarios){
        return true;
      }else{
        throw new Error('Usuario o contraseña incorrectos')
      }
      }),
      catchError( error=> {
        console.error(error.message);
        return throwError(() => new Error(error.message));
      })
    );

  }
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token); // Almacena el token en localStorage
    console.log("Guardando el token en localStorage", token)
    console.log("Verificación inmediata:", localStorage.getItem(this.tokenKey));
  }

  getToken(): string | null {
    return localStorage.getItem('authToken'); // Recupera el token de localStorage
  }
   isAuthenticated(): boolean {
    const token = this.getToken();
    if(!token){
      return false;
    }
    const payload= JSON.parse(atob(token.split('.')[1]));
    const exp= payload.exp* 1000;
    return Date.now() < exp;
   }
   logout(): void{
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
