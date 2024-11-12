import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../users/users.service';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule,ReactiveFormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    email: string='';
    contrasena: string='';
    confirmcontrasena: string='';
    errorcontrasena: boolean=false;
    registreForm!: FormGroup;

    constructor(public userService: UsersService, private router: Router, private fb: FormBuilder) {
      this.registreForm= this.fb.group({
        email: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
      confirmcontrasena: ['', Validators.required]
      })
    }
    get emailControl(){
      return this.registreForm.get('email');
    }
    get getcontrasena(){
      return this.registreForm.get('contrasena');
    }
    get getconfirmcontrasena(){
      return this.registreForm.get('confirmcontrasena');
    }
    registrar() {
      // Verifica si las contraseñas coinciden
      if (this.contrasena !== this.confirmcontrasena) {
        this.errorcontrasena = true;
        alert('Las contraseñas no coinciden.');
        return; // Detiene el flujo si las contraseñas no coinciden
      }

      // Crea el objeto user
      const usuarios = this.registreForm.value;
      // Llama al servicio para registrar al usuario
      this.userService.registrer(usuarios).subscribe({
        next: () => {
          alert('Registro exitoso');
          this.router.navigate(['/login']); // Navega a la página de login después del registro
        },
        error: (error) => {alert(error.message)
          this.registreForm.markAllAsTouched();
        } // Muestra el error en un alert

      });
    }
  }
