package com.gestion_gastos.entidades;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "transaciones")
public class Transaccion {

	@OneToMany(mappedBy = "transaccion", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonIgnore
	private Set<Gasto> gastos = new HashSet<>();
	
	@OneToMany(mappedBy = "transaccion", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonIgnore
	private Set<Gasto> ingresos = new HashSet<>();

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long transaccionId;

	@Column(length = 250, nullable = false)
	private String descripcion;

	@Column(nullable = false)
	private double monto;

	@Column(nullable = false)
	private LocalDate fecha;

	@Column(nullable = false)
	@Enumerated(EnumType.STRING)  // Guarda como "GASTO" o "INGRESO"
	private TipoTransaccion tipo;


	public TipoTransaccion getTipo() {
		return tipo;
	}

	public void setTipo(TipoTransaccion tipo) {
		this.tipo = tipo;
	}



	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "usuarioId", nullable = false)
	private Usuario usuario;

	public Set<Gasto> getGastos() {
		return gastos;
	}

	public void setGastos(Set<Gasto> gastos) {
		this.gastos = gastos;
	}

	public Set<Gasto> getIngresos() {
		return ingresos;
	}

	public void setIngresos(Set<Gasto> ingresos) {
		this.ingresos = ingresos;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
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

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public Long getTransaccionId() {
		return transaccionId;
	}

	public void setTransaccionId(Long transaccionId) {
		this.transaccionId = transaccionId;
	}

	

	public Transaccion() {
	}

}
