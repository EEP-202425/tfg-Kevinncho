import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GastosService } from './gastos.service';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css','../lista-ingresos/lista-ingresos.component.css']
})
export class GastosComponent {
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  selectedDay: number = new Date().getDate();
  gastoConcept: string = '';
  cantidadGasto: number = 0;
  gastoFecha: string= '';
  gastos: any[] = [];
  filteredGastos: any[] = [];
  selectedGastos: number[] = [];
  editingGastoIndex: number | null = null;
  totalIngresos: number = 0;



  orderBy: string = "null";
  orderByDate: string = "null"; // Orden de la fecha


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

  showNewIncomeForm: boolean = false;

  constructor(private gastosService: GastosService){}

  updateDays() {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    this.filterGastos(); // Aplicar filtro nuevamente
  }
  filterGastos() {
    const formattedMonth = this.selectedMonth.toString().padStart(2, '0'); // Asegura "01", "02", ..., "12"
    const formattedYear = this.selectedYear.toString();

    if (this.selectedDay !== null && this.selectedDay !== undefined) {
      // Filtro por día exacto
      const formattedDay = this.selectedDay.toString().padStart(2, '0');
      const selectedDate = `${formattedYear}-${formattedMonth}-${formattedDay}`;

      // Eliminamos las comillas escapadas y espacios en blanco antes de hacer la comparación
      this.filteredGastos = this.gastos.filter(gastos => gastos.fecha.replace(/\"/g, '').trim() === selectedDate);
    } else {
      // Filtro por mes y año
      const selectedMonth = `${formattedYear}-${formattedMonth}`;

      // Eliminamos las comillas escapadas y espacios en blanco antes de hacer la comparación
      this.filteredGastos = this.gastos.filter(gastos => gastos.fecha.replace(/\"/g, '').trim().startsWith(selectedMonth));
      //this.updateChart();
    }

    this.totalIngresos = this.filteredGastos.reduce((sum, income) => sum + income.monto, 0);
    this.sortByAmount();
    //this.sortByDate();

}

toggleNewIncomeForm() {
  this.showNewIncomeForm = !this.showNewIncomeForm;
}
resetForm() {
  this.gastoFecha = '';
  this.gastoConcept = '';
  this.cantidadGasto = 0;
}

saveIncome() {
  const formattedDate = new Date(this.gastoFecha).toISOString().split('T')[0];

  if (this.gastoFecha && this.gastoConcept && this.cantidadGasto > 0) {
    const newIncome = {
      fecha: formattedDate,
      concepto: this.gastoConcept.trim(),
      monto: this.cantidadGasto,
    };

    this.gastosService.saveIncome(newIncome).subscribe((savedIncome) => {
      this.gastos.push(savedIncome);
      this.filterGastos();
      this.loadGastos();
      this.resetForm(); // Limpiar formulario después de guardar
    });
  } else {
    alert('Por favor, completa todos los campos correctamente.');
  }
}

loadGastos() {
  this.gastosService.getGastos().subscribe((data) => {
    this.gastos = data; // Asegúrate de que sea un arreglo
    this.filterGastos();
  });

}
toggleOrder() {
  this.orderBy = this.orderBy === "asc" ? "desc" : "asc";
  this.sortByAmount();
}
sortByAmount() {
  if (this.orderBy === 'null') return; // No ordenar si no está seleccionado

  this.filteredGastos.sort((a, b) =>
    this.orderBy === 'desc' ? b.monto - a.monto : a.monto - b.monto
  );
}
toggleOrderByDate() {
  this.orderByDate = this.orderByDate === 'asc' ? 'desc' : 'asc';
  this.sortByDate();
}
sortByDate() {
  if (this.orderByDate === 'null') return; // No ordenar si no está seleccionado

  this.filteredGastos.sort((a, b) =>
    this.orderByDate === 'asc'
      ? new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      : new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
}
toggleIncomeSelection(incomeIndex: number) {
  const selectedIndex  = this.selectedGastos.indexOf(incomeIndex);
  if (selectedIndex  === -1) {
    this.selectedGastos.push(incomeIndex);
  } else {
    this.selectedGastos.splice(selectedIndex , 1);
  }
}
saveEditedIncome(incomeIndex: number) {
  const editedGastos = this.filteredGastos[incomeIndex];

  if (editedGastos.concepto.trim() && editedGastos.monto > 0) {
    this.gastosService.updateGastos(editedGastos).subscribe(() => {
      this.loadGastos(); // Recargar la lista de ingresos
      this.editingGastoIndex = null; // Salir del modo de edición
    });
  } else {
    alert('Por favor, completa todos los campos correctamente.');
  }
}
editIncome(incomeIndex: number) {
  this.editingGastoIndex = incomeIndex;
}
deleteGasto(incomeIndex: number) {
  const gastosDelete = this.filteredGastos[incomeIndex];

  if (confirm(`¿Estás seguro de que deseas eliminar el ingreso con el concepto "${gastosDelete.concepto}"?`)) {
    this.gastosService.deleteGasto(gastosDelete.id).subscribe(() => {
      // Remover ingreso de la lista local después de eliminarlo del servidor
      this.gastos = this.gastos.filter((gastos) => gastos.id !== gastosDelete.id);
      this.filterGastos(); // Actualizar la lista filtrada
    });
  }
}
deleteSelectedGastos() {
  if (this.selectedGastos.length === 0) {
    alert('Selecciona al menos un ingreso para eliminar.');
    return;
  }

  const selectedIds = this.selectedGastos.map((index) => this.filteredGastos[index]?.id);

  if (confirm('¿Estás seguro de que deseas eliminar los ingresos seleccionados?')) {
    this.gastosService.deleteGastos(selectedIds).subscribe({
      next: () => {
        // Recargar ingresos tras la eliminación
        this.loadGastos();
        this.selectedGastos = []; // Limpiar selección
        alert('Ingresos eliminados con éxito.');
      },
      error: (err) => {
        console.error('Error al eliminar ingresos:', err);
        alert('Ocurrió un error al intentar eliminar los ingresos.');
      }
    });
  }
}

}
