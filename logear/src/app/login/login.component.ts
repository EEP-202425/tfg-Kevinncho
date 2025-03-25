import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule,FormBuilder,FormGroup,Validators } from '@angular/forms';
import { UsersService } from '../users/users.service';
import { Router, RouterModule } from '@angular/router';
import { error } from 'console';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  mensajeErr: string='';
  email: string='';
  contrasena: string='';
  loginForm!: FormGroup;
  showPassword = false;
  constructor(private userService: UsersService, private router: Router, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
  }
  get emailControl(){
    return this.loginForm.get('email');
  }




  login() {
    const { email, contrasena } = this.loginForm.value;

    this.userService.login({ email, contrasena }).subscribe({
      next: autenticar => {
        if (autenticar) {
          this.router.navigate(['/home']); // Navega a la página de inicio
          alert('Inicio de sesión exitoso');
          // Redirige a la página deseada después del login
        }
      },
      error: err => {
        alert(err.message); // Muestra el mensaje de error en un alert
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
