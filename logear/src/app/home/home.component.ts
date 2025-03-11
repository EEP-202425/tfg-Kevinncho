import { Component, OnInit, AfterViewInit,ViewChild,ElementRef } from '@angular/core';
import { UsersService } from '../users/users.service';
import { Router } from '@angular/router';
import { FooterComponent } from "../../footer/footer.component";
import { HeaderComponent } from "../../header/header.component";
import { Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransaccionesService } from './transacciones.service';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Chart, ChartData, ChartOptions} from 'chart.js';


interface Transaccion {
  id: number;
  fecha: string;
  concepto: string;
  monto: number;
  tipo: 'ingreso' | 'gasto';
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FooterComponent, HeaderComponent,CommonModule,FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css','../../lista-ingresos/lista-ingresos.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit{
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;

 // Fechas y filtros
 selectedYear: number = new Date().getFullYear();
 selectedMonth: number = new Date().getMonth() + 1;
 selectedDay: number = new Date().getDate();

 // Campos del formulario para crear/editar transacciones
 transactionConcept: string = '';
 transactionAmount: number = 0;
 transactionDate: string = '';
 // Si deseas permitir la selección del tipo, puedes agregar:
 // transactionType: 'ingreso' | 'gasto' = 'ingreso';

 // Arreglos para almacenar la información
 transacciones: any[] = [];
 filteredTransacciones: any[] = [];
 selectedTransacciones: number[] = [];
 editingTransaccionIndex: number | null = null;
 totalTransacciones: number = 0;

 // Parámetros para ordenamiento
 orderBy: string = "null";
 orderByDate: string = "null";

 // Variables para gráficos
 chart: any;
 transaccionesPorDia: { [key: string]: number } = {};

 // Arrays para manejar fechas en el formulario
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
 showNewTransactionForm: boolean = false;
 transactionType: 'INGRESO' | 'GASTO' = 'INGRESO';
 chartLine: any;

  constructor(public userService: UsersService,private router: Router, private http: HttpClient, private transaccionesService: TransaccionesService){
  }
  ngOnInit() {
    this.updateDays();
    this.loadTransacciones();
    this.getUserLogged();

  }
  logout(): void{
    this.userService.logout();

  }
  getUserLogged(){
    this.userService.getUsers().subscribe((user)=>{
      console.log(user);
    });
  }
  updateDays() {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    this.filterTransacciones();
  }

  filterTransacciones() {
    const formattedMonth = this.selectedMonth.toString().padStart(2, '0');
    const formattedYear = this.selectedYear.toString();

    if (this.selectedDay !== null && this.selectedDay !== undefined) {
      // Filtro por día exacto
      const formattedDay = this.selectedDay.toString().padStart(2, '0');
      const selectedDate = `${formattedYear}-${formattedMonth}-${formattedDay}`;
      this.filteredTransacciones = this.transacciones.filter(t => t.fecha.replace(/\"/g, '').trim() === selectedDate);
    } else {
      // Filtro por mes y año
      const selectedMonth = `${formattedYear}-${formattedMonth}`;
      this.filteredTransacciones = this.transacciones.filter(t => t.fecha.replace(/\"/g, '').trim().startsWith(selectedMonth));
      this.updateLineChart();
    }
    this.totalTransacciones = this.filteredTransacciones.reduce((sum, t) => {
      return t.tipo === 'INGRESO' ? sum + t.monto : sum - t.monto;
    }, 0);    this.sortByAmount();
    this.sortByDate();
  }
  toggleNewTransactionForm() {
    this.showNewTransactionForm = !this.showNewTransactionForm;
  }

  resetForm() {
    this.transactionDate = '';
    this.transactionConcept = '';
    this.transactionAmount = 0;
    // this.transactionType = 'ingreso'; // Si decides agregar el tipo en el formulario
  }

  saveTransaccion() {
    const formattedDate = new Date(this.transactionDate).toISOString().split('T')[0];
    if (this.transactionDate && this.transactionConcept && this.transactionAmount > 0) {
      // Define la transacción; en este ejemplo se asigna por defecto "ingreso".
      // Puedes agregar un selector en el formulario para elegir entre 'ingreso' y 'gasto'.
      const newTransaction = {
        fecha: formattedDate,
        concepto: this.transactionConcept.trim(),
        monto: this.transactionAmount,
        tipo: this.transactionType.toUpperCase() as 'INGRESO' | 'GASTO', // Ahora este valor es 'ingreso' o 'gasto'
      };
      console.log('Enviando transacción:', newTransaction); // Depuración: ver la transacción a enviar
      this.transaccionesService.saveTransaccion(newTransaction).subscribe({ next: (savedTransaccion) => {
        console.log('Transacción guardada:', savedTransaccion); // Depuración: ver respuesta exitosa
        this.transacciones.push(savedTransaccion);
        this.filterTransacciones();
        this.loadTransacciones();
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Error al guardar la transacción:', err); // Depuración: ver el error
        alert('Error al guardar la transacción. Revisa la consola para más detalles.');
      }
    });
} else {
  alert('Por favor, completa todos los campos correctamente.');
}
  }

  loadTransacciones() {
    this.transaccionesService.getTransacciones().subscribe((data) => {
      this.transacciones = data;
      this.filterTransacciones();
    });
    this.procesarTransacciones();

  }

  procesarTransacciones() {
    this.transaccionesPorDia = {};
    this.totalTransacciones = 0;
    this.filteredTransacciones.forEach((t) => {
      const fecha = t.fecha.split('T')[0];
      this.transaccionesPorDia[fecha] = (this.transaccionesPorDia[fecha] || 0) + t.monto;
      this.totalTransacciones += t.monto;
    });
  }

  toggleOrder() {
    this.orderBy = this.orderBy === "asc" ? "desc" : "asc";
    this.sortByAmount();
  }

  sortByAmount() {
    if (this.orderBy === 'null') return;
    this.filteredTransacciones.sort((a, b) =>
      this.orderBy === 'desc' ? b.monto - a.monto : a.monto - b.monto
    );
  }

  toggleOrderByDate() {
    this.orderByDate = this.orderByDate === 'asc' ? 'desc' : 'asc';
    this.sortByDate();
  }

  sortByDate() {
    if (this.orderByDate === 'null') return;
    this.filteredTransacciones.sort((a, b) =>
      this.orderByDate === 'asc'
        ? new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        : new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }

  toggleTransaccionSelection(transaccionIndex: number) {
    const selectedIndex = this.selectedTransacciones.indexOf(transaccionIndex);
    if (selectedIndex === -1) {
      this.selectedTransacciones.push(transaccionIndex);
    } else {
      this.selectedTransacciones.splice(selectedIndex, 1);
    }
  }

  saveEditedTransaccion(transaccionIndex: number) {
    const editedTransaccion = this.filteredTransacciones[transaccionIndex];
    if (editedTransaccion.concepto.trim() && editedTransaccion.monto > 0) {
      this.transaccionesService.updateTransaccion(editedTransaccion).subscribe(() => {
        this.loadTransacciones();
        this.editingTransaccionIndex = null;
      });
    } else {
      alert('Por favor, completa todos los campos correctamente.');
    }
  }

  editTransaccion(transaccionIndex: number) {
    this.editingTransaccionIndex = transaccionIndex;
  }

  deleteTransaccion(transaccionIndex: number) {
    const transaccionToDelete = this.filteredTransacciones[transaccionIndex];
    if (confirm(`¿Estás seguro de que deseas eliminar la transacción con el concepto "${transaccionToDelete.concepto}"?`)) {
      this.transaccionesService.deleteTransaccion(transaccionToDelete.transaccionId!).subscribe(() => {
        this.transacciones = this.transacciones.filter(t => t.transaccionId! !== transaccionToDelete.transaccionId!);
        this.filterTransacciones();
      });
    }
  }

  deleteSelectedTransacciones() {
    if (this.selectedTransacciones.length === 0) {
      alert('Selecciona al menos una transacción para eliminar.');
      return;
    }
    const selectedTransacciones = this.selectedTransacciones.map(index => this.filteredTransacciones[index]);
    if (confirm('¿Estás seguro de que deseas eliminar las transacciones seleccionadas?')) {
      this.transaccionesService.deleteTransacciones(selectedTransacciones).subscribe({
        next: () => {
          this.loadTransacciones();
          this.selectedTransacciones = [];
          alert('Transacciones eliminadas con éxito.');
        },
        error: (err) => {
          console.error('Error al eliminar transacciones:', err);
          alert('Ocurrió un error al intentar eliminar las transacciones.');
        }
      });
    }
  }

  exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transacciones');

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Concepto', key: 'concepto', width: 30 },
      { header: 'Monto', key: 'monto', width: 15 },
      { header: 'Tipo', key: 'tipo', width: 10 }
    ];

    this.filteredTransacciones.forEach((t) => {
      worksheet.addRow({
        fecha: t.fecha,
        concepto: t.concepto,
        monto: t.monto,
        tipo: t.tipo
      });
    });

    // Calcular totales
    const totalGastos = this.filteredTransacciones
      .filter(t => t.tipo.toLowerCase() === 'gasto')
      .reduce((sum, t) => sum + t.monto, 0);

    const totalIngresos = this.filteredTransacciones
      .filter(t => t.tipo.toLowerCase() === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);

    const totalGeneral = totalIngresos - totalGastos;

    // Agregar filas de totales
    const totalGastosRow = worksheet.addRow({ fecha: 'Total Gastos', concepto: '', monto: totalGastos, tipo: '' });
    const totalIngresosRow = worksheet.addRow({ fecha: 'Total Ingresos', concepto: '', monto: totalIngresos, tipo: '' });
    const totalGeneralRow = worksheet.addRow({ fecha: 'Total General', concepto: '', monto: totalGeneral, tipo: '' });

    // Estilos para encabezados
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF305496' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Zebra striping en filas de datos
    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex > 1 && rowIndex <= this.filteredTransacciones.length + 1) {
        const isEven = rowIndex % 2 === 0;
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFD9E2F3' : 'FFFFFFFF' } };
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        });
      }
    });

    // Estilos para las filas de totales
    [totalGastosRow, totalGeneralRow].forEach(row => {
      row.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF305496' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });
     // Estilos para la fila de Total Ingresos (fondo blanco, texto azul)
  totalIngresosRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FF305496' } }; // Texto azul
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }; // Fondo blanco
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

    // Bordes para todas las celdas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    worksheet.getColumn('monto').eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveAs(blob, 'Transacciones.xlsx');
    });
  }




  ngAfterViewInit() {
    // Ahora que la vista está renderizada, se pueden crear los gráficos
    this.updateLineChart();
  }
  updateLineChart() {
    if (this.chartLine) {
      this.chartLine.destroy();
    }

    // Acumular montos por día para cada tipo
    const ingresosPorDia: { [key: number]: number } = {};
    const gastosPorDia: { [key: number]: number } = {};

    this.filteredTransacciones.forEach(transaccion => {
      const dia = new Date(transaccion.fecha).getDate();
      if (transaccion.tipo === 'INGRESO') {
        ingresosPorDia[dia] = (ingresosPorDia[dia] || 0) + transaccion.monto;
      } else if (transaccion.tipo === 'GASTO') {
        gastosPorDia[dia] = (gastosPorDia[dia] || 0) + transaccion.monto;
      }
    });

    // Generar etiquetas para todos los días del mes
    const maxDia = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    const labels = Array.from({ length: maxDia }, (_, i) => i + 1);

    // Mapear datos para cada día
    const ingresosData = labels.map(dia => ingresosPorDia[dia] || 0);
    const gastosData = labels.map(dia => gastosPorDia[dia] || 0);

    const ctx = document.getElementById('transaccionesLineChart') as HTMLCanvasElement;
    this.chartLine = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ingresos',
            data: ingresosData,
            borderColor: 'green',
            backgroundColor: 'rgba(0,128,0,0.2)',
            fill: true
          },
          {
            label: 'Gastos',
            data: gastosData,
            borderColor: 'red',
            backgroundColor: 'rgba(255,0,0,0.2)',
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: 'Días del mes' } },
          y: { title: { display: true, text: 'Monto ($)' } }
        }
      }
    });
  }
}
