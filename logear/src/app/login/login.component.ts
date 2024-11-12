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
  loginForm!: FormGroup;
  constructor(private userService: UsersService, private router: Router, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
  }





  login() {
    if (this.loginForm.invalid) {
      this.mensajeErr = 'Por favor, ingrese un correo y contraseña válidos';
      return;
    }
      const usuarios = this.loginForm.value;
    this.userService.login(usuarios).subscribe({
      next: (autenticar) => {
        if (autenticar) {
          this.router.navigate(['/home']); // Navega a la página de inicio
        } else {
          this.mensajeErr = 'Usuario o contraseña incorrectos'; // Muestra mensaje de error
        }
      },
      error: (error) => {
        this.mensajeErr = error.message;
      }
    });
  }
}
