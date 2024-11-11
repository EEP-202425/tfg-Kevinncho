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
  errorMessage: string='';

  constructor(private userService: UsersService, private router: Router) {}


  login() {
    const user = { email: this.email, password: this.password };
    this.userService.login(user).subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigate(['/home']); // Navega a la página de inicio
        } else {
          this.errorMessage = 'Usuario o contraseña incorrectos'; // Muestra mensaje de error
        }
      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    });
  }
}
