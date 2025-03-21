import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { Component } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { CarruselComponent } from './carrusel/carrusel.component';
import { CostoComponent } from './costo/costo.component';
import { ListaIngresosComponent } from '../lista-ingresos/lista-ingresos.component';
import { GastosComponent } from '../gastos/gastos.component';
const routeConfig: Routes = [
  { path: "", redirectTo:"/login", pathMatch: "full" },
  { path: "login", component: LoginComponent, pathMatch: "full" },
  { path: "register", component: RegisterComponent, pathMatch: "full" },
  {path: "home", component: HomeComponent, pathMatch: "full"},
  {path: "carrusel", component: CarruselComponent, pathMatch: "full"},
  {path: "costo", component: CostoComponent, pathMatch: "full"},
  {path: "lista-ingreso", component: ListaIngresosComponent, pathMatch: "full"},
  {path: "gastos", component: GastosComponent, pathMatch: "full"},
];
export default routeConfig;
