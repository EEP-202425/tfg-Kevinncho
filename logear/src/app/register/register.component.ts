import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../users/users.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    email: string='';
    password: string='';
    confirmPassword: string='';
    passwordError: boolean=false;

    constructor(public userService: UsersService, private router: Router) {}

    register() {
      // Verifica si las contraseñas coinciden
      if (this.password !== this.confirmPassword) {
        this.passwordError = true;
        alert('Las contraseñas no coinciden.');
        return; // Detiene el flujo si las contraseñas no coinciden
      }

      // Crea el objeto user
      const user = { email: this.email, password: this.password, confirmPassword: this.confirmPassword };

      // Llama al servicio para registrar al usuario
      this.userService.registrer(user).subscribe({
        next: () => {
          alert('Registro exitoso');
          this.router.navigate(['/login']); // Navega a la página de login después del registro
        },
        error: (error) => alert(error.message) // Muestra el error en un alert
      });
    }
  }
