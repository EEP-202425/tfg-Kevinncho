import { Component } from '@angular/core';
import { IngresosService } from '../app/costo/ingresos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-lista-ingresos',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './lista-ingresos.component.html',
  styleUrl: './lista-ingresos.component.css'
})
export class ListaIngresosComponent {
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  selectedDay: number = new Date().getDate();
  incomeConcept: string = '';
  incomeAmount: number = 0;
  months = [
    { name: 'Enero', value: 1 },
    { name: 'Febrero', value: 2 },
    { name: 'Marzo', value: 3 },
    { name: 'Abril', value: 4 },
    { name: 'Mayo', value: 5 },
    { name: 'Junio', value: 6 },
    { name: 'Julio', value: 7 },
    { name: 'Agosto', value: 8 },
    { name: 'Septiembre', value: 9 },
    { name: 'Octubre', value: 10 },
    { name: 'Noviembre', value: 11 },
    { name: 'Diciembre', value: 12 }

  ];
  years: number[] = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i);
  days: number[] = [];
  incomes: any[] = [];
  filteredIncomes: any[] = [];

  constructor(private ingresosService: IngresosService) {}
  ngOnInit() {
    this.updateDays();
    this.loadIncomes();
  }

  updateDays() {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    this.filterIncomes(); // Aplicar filtro nuevamente
  }
  saveIncome() {
    if (this.incomeConcept && this.incomeAmount > 0) {
      const newIncome = {
        fecha: `${this.selectedYear}-${this.selectedMonth}-${this.selectedDay}`,
        concepto: this.incomeConcept,
        monto: this.incomeAmount,
      };


      this.ingresosService.saveIncome(newIncome).subscribe((savedIncome) => {
        this.incomes.push(savedIncome);
        this.filterIncomes();
        this.incomeConcept = '';
        this.incomeAmount = 0;
      });
    }
  }

  loadIncomes() {
    this.ingresosService.getIncomes().subscribe((data) => {
      this.incomes = data; // Asegúrate de que sea un arreglo
      this.filterIncomes();
    });
  }

  filterIncomes() {
    const selectedDate = `${this.selectedYear}-${this.selectedMonth}-${this.selectedDay}`;
    this.filteredIncomes = this.incomes.filter((income) => income.fecha === selectedDate);

  }
  showNewIncomeForm: boolean = false;

toggleNewIncomeForm() {
  this.showNewIncomeForm = !this.showNewIncomeForm;
}



}
