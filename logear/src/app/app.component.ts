import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./login/login.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent,RouterModule],
  templateUrl: './app.component.html',
  template: ` `,

  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'logear';
  
}
