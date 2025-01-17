import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IngresosService } from './ingresos.service';
import { response } from 'express';

@Component({
  selector: 'app-costo',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './costo.component.html',
  styleUrl: './costo.component.css'
})
export class CostoComponent {
 // Opciones para el selector de meses
 months = [
  { value: 1, name: 'Enero' },
  { value: 2, name: 'Febrero' },
  { value: 3, name: 'Marzo' },
  { value: 4, name: 'Abril' },
  { value: 5, name: 'Mayo' },
  { value: 6, name: 'Junio' },
  { value: 7, name: 'Julio' },
  { value: 8, name: 'Agosto' },
  { value: 9, name: 'Septiembre' },
  { value: 10, name: 'Octubre' },
  { value: 11, name: 'Noviembre' },
  { value: 12, name: 'Diciembre' },
];

// Opciones para los años
years: number[] = [];
days: number[] = [];

// Valores seleccionados
selectedMonth: number = 1; // Enero
selectedYear: number = new Date().getFullYear(); // Año actual
selectedDay: number = 1;
incomeConcept: string = '';
incomeAmount: number = 0;

constructor(private ingresosService: IngresosService) {
  // Llenar los años disponibles (por ejemplo, 2020-2030)
  for (let i = 2020; i <= 2030; i++) {
    this.years.push(i);
  }
  this.updateDays(); // Generar días iniciales
}

// Actualizar los días basados en el mes y el año seleccionados
updateDays(): void {
  const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
  this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  if (this.selectedDay > daysInMonth) {
    this.selectedDay = daysInMonth;
  }
}

// Guardar el ingreso (puede incluir lógica para enviar datos al backend)
saveIncome(): void {
  const income = {
    fecha: `${this.selectedDay}/${this.selectedMonth}/${this.selectedYear}`,
    concepto: this.incomeConcept,
    monto: this.incomeAmount,
  };
  alert('Ingreso registrado con éxito.');

  this.ingresosService.saveIncome(income).subscribe(
    (response) =>{
      console.log('Ingreso guardado exitosamente:', response);
      alert('Ingreso registrado con éxito.');
      // Opcional: Reiniciar los campos
      this.incomeConcept = '';
      this.incomeAmount = 0;
    },
    (error) => {
      console.error('Error al guardar el ingreso:', error);
      alert('Ocurrió un error al guardar el ingreso.');
    }
  );
}

}
