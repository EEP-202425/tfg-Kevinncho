import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpInterceptor } from '@angular/common/http';
import { HttpRequest, HttpHandler,HttpEvent } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

  @Injectable()
  export class AuthInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const token = localStorage.getItem('authToken'); // Obtener el token almacenado

      if (token) {
        const clonedReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` } // Agregar el token en la cabecera
        });
        return next.handle(clonedReq);
      }
      return next.handle(req);
    }

}
