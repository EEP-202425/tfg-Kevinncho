
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable, catchError, of, throwError } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import { tap } from "rxjs";
import { error } from "node:console";

interface User{
  email: string;
  password: string;
  confirmPassword: string;

  token?: string;
}
@Injectable({
  providedIn: "root",
})
export class UsersService {
  private usersUrl = 'http://localhost:3000/users';
  private tokenKey = 'authToken';
  constructor(private http: HttpClient, private router: Router ) {}

  registrer(user: { email: string; password: string, confirmPassword: string }): Observable<any> {
    if(!user.email || !user.password || !user.confirmPassword){
      return throwError(()=> new Error('Todos los campos son obligatorios.'));
    }
    if(user.password !== user.confirmPassword){
      return throwError(()=> new Error('Las contraseñas no coinciden'));
    }
    return this.http.post<any>(this.usersUrl, {email: user.email,password: user.password    }).pipe(
      catchError(error => {
        const errorMessage = 'Error al intentar registrar el usuario.';
        console.error(errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }


  login(user: { email: string; password: string }): Observable<any> {
    return this.http.get<any[]>(this.usersUrl).pipe(
      map(users =>{
        const foundUser= users.find(u => u.email === user.email && u.password === user.password);
      if(foundUser){
        return true;
      }else{
        throw new Error('Usuario o contraseña incorrectos')
      }
      }),
      catchError( error=> {
        console.error(error.message);
        return of(false);
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
