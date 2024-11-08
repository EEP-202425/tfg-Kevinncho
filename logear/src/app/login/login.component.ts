import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../users/users.service';
import { Router, RouterModule } from '@angular/router';
import { error } from 'console';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string='';
  password: string='';

  constructor(public userService: UsersService, public router: Router) {}


  login() {
    const user = { email: this.email, password: this.password };
    this.userService.login(user).subscribe(
      data => {
        if (data) {
          this.userService.setToken(data.token);
          this.router.navigateByUrl("/home"); // Redirige a la página de inicio
        } else {
          alert("Credenciales inválidas");
        }
      },
      error => {
        console.log(error);
        alert("Ocurrió un error al iniciar sesión");
      }
    );
  }
}
  

