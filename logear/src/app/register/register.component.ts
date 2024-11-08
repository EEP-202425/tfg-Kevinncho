import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../users/users.service';
import { RouterModule } from '@angular/router';

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

    constructor(public userService: UsersService) {}

    register() {
     console.log("ejxe")
    }

}
