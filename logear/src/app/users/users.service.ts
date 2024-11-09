
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable, catchError, of } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import { tap } from "rxjs";

interface User{
  email: string;
  password: string;
}
@Injectable({
  providedIn: "root",
})
export class UsersService {
  private usersUrl = 'http://localhost:3000/users';
  private tokenKey = 'authToken';
  constructor(private http: HttpClient, private router: Router ) {}

  login(user: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(this.usersUrl, {email: user.email,password: user.password}).pipe(
      tap(response => {
        console.log("Respuesta del servidor:", response)
        if(response.token && response){
          console.log("Token recibido",response.token);
          this.setToken(response.token);
        }else{
          console.warn("No se recibio token en la respuesta.")
        }
      })
    )
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
