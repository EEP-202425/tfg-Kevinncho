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
  incomeFech: string= '';
  showNewIncomeForm: boolean = false;
  selectedIncomes: number[] = [];
  editingIncomeIndex: number | null = null;


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
  selectedIds: number[] = []; // IDs seleccionados para eliminar


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
    const formattedDate = new Date(this.incomeFech).toISOString().split('T')[0];

    if (this.incomeFech && this.incomeConcept && this.incomeAmount > 0) {
      const newIncome = {
        fecha: formattedDate,
        concepto: this.incomeConcept.trim(),
        monto: this.incomeAmount,
      };

      this.ingresosService.saveIncome(newIncome).subscribe((savedIncome) => {
        this.incomes.push(savedIncome);
        this.filterIncomes();
        this.loadIncomes();
        this.resetForm(); // Limpiar formulario después de guardar
      });
    } else {
      alert('Por favor, completa todos los campos correctamente.');
    }
  }

  loadIncomes() {
    this.ingresosService.getIncomes().subscribe((data) => {
      this.incomes = data; // Asegúrate de que sea un arreglo
      this.filterIncomes();
    });
  }

  filterIncomes() {
    const selectedDate = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}-${this.selectedDay.toString().padStart(2, '0')}`;
    console.log('Fecha seleccionada:', selectedDate);
    console.log('Ingresos:', this.incomes);

    this.filteredIncomes = this.incomes.filter((income) => income.fecha === selectedDate);
  }

toggleNewIncomeForm() {
  this.showNewIncomeForm = !this.showNewIncomeForm;
}
 resetForm() {
    this.incomeFech = '';
    this.incomeConcept = '';
    this.incomeAmount = 0;
  }

  toggleIncomeSelection(incomeIndex: number) {
    const selectedIndex  = this.selectedIncomes.indexOf(incomeIndex);
    if (selectedIndex  === -1) {
      this.selectedIncomes.push(incomeIndex);
    } else {
      this.selectedIncomes.splice(selectedIndex , 1);
    }
  }


  isIncomeSelected(incomeIndex: number): boolean {
    return this.selectedIncomes.includes(incomeIndex);
  }
  saveEditedIncome(incomeIndex: number) {
    const editedIncome = this.filteredIncomes[incomeIndex];

    if (editedIncome.concepto.trim() && editedIncome.monto > 0) {
      this.ingresosService.updateIncome(editedIncome).subscribe(() => {
        this.loadIncomes(); // Recargar la lista de ingresos
        this.editingIncomeIndex = null; // Salir del modo de edición
      });
    } else {
      alert('Por favor, completa todos los campos correctamente.');
    }
  }
  editIncome(incomeIndex: number) {
    this.editingIncomeIndex = incomeIndex;
  }
  deleteIncome(incomeIndex: number) {
    const incomeToDelete = this.filteredIncomes[incomeIndex];

    if (confirm(`¿Estás seguro de que deseas eliminar el ingreso con el concepto "${incomeToDelete.concepto}"?`)) {
      this.ingresosService.deleteIncome(incomeToDelete.id).subscribe(() => {
        // Remover ingreso de la lista local después de eliminarlo del servidor
        this.incomes = this.incomes.filter((income) => income.id !== incomeToDelete.id);
        this.filterIncomes(); // Actualizar la lista filtrada
      });
    }
  }
  toggleSelection(id: number): void {
    if (this.selectedIds.includes(id)) {
      this.selectedIds = this.selectedIds.filter(selectedId => selectedId !== id);
    } else {
      this.selectedIds.push(id);
    }
  }

  deleteSelectedIncomes() {
    if (this.selectedIncomes.length === 0) {
      alert('Selecciona al menos un ingreso para eliminar.');
      return;
    }

    const selectedIds = this.selectedIncomes.map((index) => this.filteredIncomes[index]?.id);

    // Llamar al servicio para eliminar
    this.ingresosService.deleteIncomes(selectedIds).subscribe(() => {
      // Actualizar ingresos tras la eliminación
      this.incomes = this.incomes.filter((_, i) => !this.selectedIncomes.includes(i));
      this.filterIncomes();
      this.selectedIncomes = []; // Limpiar selección
    });
  }



}
