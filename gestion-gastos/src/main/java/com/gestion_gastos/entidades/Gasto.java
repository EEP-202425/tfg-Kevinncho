package com.gestion_gastos.entidades;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "gastos")
public class Gasto {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idGasto;
	
	@Column(length = 250,nullable = false)
	private String concepto;
	
	public String getConcepto() {
		return concepto;
	}
	public void setConcepto(String concepto) {
		this.concepto = concepto;
	}
	@Column(nullable = false)
    private double monto;
	
	public Transaccion getTransaccion() {
		return transaccion;
	}
	public void setTransaccion(Transaccion transaccion) {
		this.transaccion = transaccion;
	}
	@Column(nullable = false)
    private LocalDate fecha;
	
	@ManyToOne(fetch = FetchType.EAGER, optional = false) 
	@JoinColumn(name = "transaccionId", nullable = false)
	private Transaccion transaccion;
	
	public Long getIdGasto() {
		return idGasto;
	}
	public void setIdGasto(Long idGasto) {
		this.idGasto = idGasto;
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
	public Gasto() {
	}
    
    
}
