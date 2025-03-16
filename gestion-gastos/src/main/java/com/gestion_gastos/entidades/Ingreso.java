package com.gestion_gastos.entidades;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "ingresos")
public class Ingreso {

		@Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long idIngreso;
		
		public Long getIdIngreso() {
			return idIngreso;
		}
		public void setIdIngreso(Long idIngreso) {
			this.idIngreso = idIngreso;
		}
		@Column(length = 250,nullable = false)
		private String concepto;
		
		@Column(nullable = false)
	    private double monto;
		
		@Column(nullable = false)
	    private LocalDate fecha;
		
		@ManyToOne(fetch = FetchType.EAGER, optional = false) 
		@JoinColumn(name = "transaccionId", nullable = false)
		private Transaccion transaccion;

		
		public String getConcepto() {
			return concepto;
		}
		public void setConcepto(String concepto) {
			this.concepto = concepto;
		}
		public double getMonto() {
			return monto;
		}
		public void setMonto(double monto) {
			this.monto = monto;
		}
		public LocalDate getFecha() {
			return fecha;
		}
		public void setFecha(LocalDate fecha) {
			this.fecha = fecha;
		}
		public Ingreso() {
		}

}
