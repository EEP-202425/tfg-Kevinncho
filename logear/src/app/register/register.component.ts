import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../users/users.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
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
      const user = { email: this.email, password: this.password };
      this.userService.register(user).subscribe((data) => {
        this.userService.setToken(data.token)
      });
    }

}
