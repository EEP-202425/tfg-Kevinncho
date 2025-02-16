import { Component } from '@angular/core';
import { IngresosService } from '../app/costo/ingresos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {Chart, ChartData, ChartOptions  } from 'chart.js/auto';
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

  totalIngresos: number = 0;
  orderBy: string = "null";

  orderByDate: string = "null"; // Orden de la fecha


  ingresosPorDia: { [key: string]: number } = {};

  chart: any;
  constructor(private ingresosService: IngresosService) {}
  ngOnInit() {
    this.updateDays();
    this.loadIncomes();
    this.updateChart();
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
    this.procesarIngresos();
    this.generarGrafico();
  }
  procesarIngresos() {
    this.ingresosPorDia = {};
    this.totalIngresos = 0;

    this.filteredIncomes.forEach((income) => {
      const fecha = income.fecha.split('T')[0]; // Formato YYYY-MM-DD
      this.ingresosPorDia[fecha] = (this.ingresosPorDia[fecha] || 0) + income.monto;
      this.totalIngresos += income.monto;
    });
  }
  generarGrafico() {
    if (this.chart) {
      this.chart.destroy();
    }

    const fechas = Object.keys(this.ingresosPorDia).sort();
    const montosAcumulados = fechas.reduce((acc, fecha, index) => {
      acc.push((acc[index - 1] || 0) + this.ingresosPorDia[fecha]);
      return acc;
    }, [] as number[]);

    const ctx = document.getElementById('ingresosChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Crecimiento de Ingresos',
          data: montosAcumulados,
          borderColor: 'green',
          backgroundColor: 'rgba(20, 253, 94, 0.2)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }


  filterIncomes() {
    const formattedMonth = this.selectedMonth.toString().padStart(2, '0'); // Asegura "01", "02", ..., "12"
    const formattedYear = this.selectedYear.toString();

    if (this.selectedDay !== null && this.selectedDay !== undefined) {
      // Filtro por día exacto
      const formattedDay = this.selectedDay.toString().padStart(2, '0');
      const selectedDate = `${formattedYear}-${formattedMonth}-${formattedDay}`;

      // Eliminamos las comillas escapadas y espacios en blanco antes de hacer la comparación
      this.filteredIncomes = this.incomes.filter(income => income.fecha.replace(/\"/g, '').trim() === selectedDate);
    } else {
      // Filtro por mes y año
      const selectedMonth = `${formattedYear}-${formattedMonth}`;

      // Eliminamos las comillas escapadas y espacios en blanco antes de hacer la comparación
      this.filteredIncomes = this.incomes.filter(income => income.fecha.replace(/\"/g, '').trim().startsWith(selectedMonth));
      this.updateChart();
    }

    this.totalIngresos = this.filteredIncomes.reduce((sum, income) => sum + income.monto, 0);
    this.sortByAmount();
    this.sortByDate();

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

    if (confirm('¿Estás seguro de que deseas eliminar los ingresos seleccionados?')) {
      this.ingresosService.deleteIncomes(selectedIds).subscribe({
        next: () => {
          // Recargar ingresos tras la eliminación
          this.loadIncomes();
          this.selectedIncomes = []; // Limpiar selección
          alert('Ingresos eliminados con éxito.');
        },
        error: (err) => {
          console.error('Error al eliminar ingresos:', err);
          alert('Ocurrió un error al intentar eliminar los ingresos.');
        }
      });
    }
  }

  exportToExcel() {
    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ingresos');

    // Definir columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Concepto', key: 'concepto', width: 30 },
      { header: 'Monto', key: 'monto', width: 15 },
    ];

    // Añadir datos a la hoja
    this.filteredIncomes.forEach((income) => {
      worksheet.addRow({
        fecha: income.fecha,
        concepto: income.concepto,
        monto: income.monto,
      });
    });

    // Calcular total de ingresos y añadirlo al final
    const total = this.filteredIncomes.reduce((sum, income) => sum + income.monto, 0);
    const totalRow = worksheet.addRow({ fecha: 'Total', concepto: '', monto: total });

    // Estilos para los encabezados
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Blanco
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF305496' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
      // Estilo alternado para filas (zebra striping)
  worksheet.eachRow((row, rowIndex) => {
    if (rowIndex > 1) {
      const isEven = rowIndex % 2 === 0;
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFD9E2F3' : 'FFFFFFFF' }, // Azul claro y blanco
        };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      });
    }
  });

    // Estilos para la fila de totales
    totalRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Blanco
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF305496' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Añadir bordes a todas las celdas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });
     // Centrar la columna "Monto"
  worksheet.getColumn('monto').eachCell((cell) => {
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });


    // Generar el archivo Excel
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveAs(blob, 'Ingresos.xlsx');
    });
  }
  updateChart() {
    if (this.chart) {
      this.chart.destroy(); // Destruir el gráfico anterior
    }

    const ingresosPorDia = this.filteredIncomes.reduce((acc, income) => {
      const dia = new Date(income.fecha).getDate();
      acc[dia] = (acc[dia] || 0) + income.monto;
      return acc;
    }, {});

    const dias = Object.keys(ingresosPorDia).map(dia => Number(dia)).sort((a, b) => a - b);
    const montos = dias.map(dia => ingresosPorDia[dia]);

    const ctx = document.getElementById('ingresosChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dias, // Eje X con días del mes
        datasets: [{
          label: `Ingresos de ${this.months[this.selectedMonth - 1]?.name} ${this.selectedYear}`,
          data: montos,
          borderColor: 'green',
          backgroundColor: 'rgba(0, 254, 102, 0.2)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: 'Días del mes' } },
          y: { title: { display: true, text: 'Ingresos ($)' } }
        }
      }
    });
  }



  toggleOrder() {
    this.orderBy = this.orderBy === "asc" ? "desc" : "asc";
    this.sortByAmount();
  }
// Método para alternar orden de los ingresos por fecha
toggleOrderByDate() {
  this.orderByDate = this.orderByDate === 'asc' ? 'desc' : 'asc';
  this.sortByDate();
}
sortByDate() {
  if (this.orderByDate === 'null') return; // No ordenar si no está seleccionado

  this.filteredIncomes.sort((a, b) =>
    this.orderByDate === 'asc'
      ? new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      : new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
}
sortByAmount() {
  if (this.orderBy === 'null') return; // No ordenar si no está seleccionado

  this.filteredIncomes.sort((a, b) =>
    this.orderBy === 'desc' ? b.monto - a.monto : a.monto - b.monto
  );
}


}
