import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  constructor(public userService: UsersService,private router: Router){
  }
  logout(): void{
    this.userService.logout();

  }
  ngOnInit(){
    this.getUserLogged();
  }
  getUserLogged(){
    this.userService.getUsers().subscribe((user)=>{
      console.log(user);
    });
  }
}
