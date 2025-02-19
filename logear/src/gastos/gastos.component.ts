import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GastosService } from './gastos.service';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import { HeaderComponent } from '../header/header.component';
@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule,FormsModule,HeaderComponent],
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
  totalGastos: number = 0;



  orderBy: string = "null";
  orderByDate: string = "null"; // Orden de la fecha
  chart: any;
  gastosPorDia: { [key: string]: number } = {};



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
  ngOnInit() {
    this.updateDays();
    this.loadGastos();
    this.updateChart();
  }

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
      this.updateChart();
    }

    this.totalGastos = this.filteredGastos.reduce((sum, income) => sum + income.monto, 0);
    this.sortByAmount();
    this.sortByDate();

}

toggleNewGastoForm() {
  this.showNewIncomeForm = !this.showNewIncomeForm;
}
resetForm() {
  this.gastoFecha = '';
  this.gastoConcept = '';
  this.cantidadGasto = 0;
}

saveGasto() {
  const formattedDate = new Date(this.gastoFecha).toISOString().split('T')[0];

  if (this.gastoFecha && this.gastoConcept && this.cantidadGasto > 0) {
    const newIncome = {
      fecha: formattedDate,
      concepto: this.gastoConcept.trim(),
      monto: this.cantidadGasto,
    };

    this.gastosService.saveGasto(newIncome).subscribe((savedGasto) => {
      this.gastos.push(savedGasto);
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
  this.generarGrafico();
  this.procesarGastos();

}
procesarGastos() {
  this.gastosPorDia = {};
  this.totalGastos = 0;

  this.filteredGastos.forEach((gastos) => {
    const fecha = gastos.fecha.split('T')[0]; // Formato YYYY-MM-DD
    this.gastosPorDia[fecha] = (this.gastosPorDia[fecha] || 0) + gastos.monto;
    this.totalGastos += gastos.monto;
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
toggleGastoSelection(gastosIndex: number) {
  const selectedIndex  = this.selectedGastos.indexOf(gastosIndex);
  if (selectedIndex  === -1) {
    this.selectedGastos.push(gastosIndex);
  } else {
    this.selectedGastos.splice(selectedIndex , 1);
  }
}
saveEditedGasto(gastosIndex: number) {
  const editedGastos = this.filteredGastos[gastosIndex];

  if (editedGastos.concepto.trim() && editedGastos.monto > 0) {
    this.gastosService.updateGastos(editedGastos).subscribe(() => {
      this.loadGastos(); // Recargar la lista de ingresos
      this.editingGastoIndex = null; // Salir del modo de edición
    });
  } else {
    alert('Por favor, completa todos los campos correctamente.');
  }
}
editGasto(gastosIndex: number) {
  this.editingGastoIndex = gastosIndex;
}
deleteGasto(gastosIndex: number) {
  const gastosDelete = this.filteredGastos[gastosIndex];

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
exportToExcel() {
    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Gastos');

    // Definir columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Concepto', key: 'concepto', width: 30 },
      { header: 'Monto', key: 'monto', width: 15 },
    ];

    // Añadir datos a la hoja
    this.filteredGastos.forEach((gastos) => {
      worksheet.addRow({
        fecha: gastos.fecha,
        concepto: gastos.concepto,
        monto: gastos.monto,
      });
    });

    // Calcular total de ingresos y añadirlo al final
    const total = this.filteredGastos.reduce((sum, gastos) => sum + gastos.monto, 0);
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
      saveAs(blob, 'Gastos.xlsx');
    });
  }
  updateChart() {
    if (this.chart) {
      this.chart.destroy(); // Destruir el gráfico anterior
    }

    const ingresosPorDia = this.filteredGastos.reduce((acc, gastos) => {
      const dia = new Date(gastos.fecha).getDate();
      acc[dia] = (acc[dia] || 0) + gastos.monto;
      return acc;
    }, {});

    const dias = Object.keys(ingresosPorDia).map(dia => Number(dia)).sort((a, b) => a - b);
    const montos = dias.map(dia => ingresosPorDia[dia]);

    const ctx = document.getElementById('gastosChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dias, // Eje X con días del mes
        datasets: [{
          label: `Gastos de ${this.months[this.selectedMonth - 1]?.name} ${this.selectedYear}`,
          data: montos,
          borderColor: 'red',
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
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
  generarGrafico() {
    if (this.chart) {
      this.chart.destroy();
    }

    const fechas = Object.keys(this.gastosPorDia).sort();
    const montosAcumulados = fechas.reduce((acc, fecha, index) => {
      acc.push((acc[index - 1] || 0) + this.gastosPorDia[fecha]);
      return acc;
    }, [] as number[]);

    const ctx = document.getElementById('gastosChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Crecimiento de Gastos',
          data: montosAcumulados,
          borderColor: 'blue',
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
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

}
