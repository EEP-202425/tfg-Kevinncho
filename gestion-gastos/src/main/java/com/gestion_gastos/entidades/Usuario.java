package com.gestion_gastos.entidades;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "usarios")
public class Usuario {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long usuarioId;
	
	@Column(nullable = false)
	private String contrasena;
	
	@Column(nullable = false)
	private String email;
	
	@Column(nullable = false)
	private String confirmcontrasena;
	
	@OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true) 
	@JsonIgnore
	private Set<Transaccion> transacciones= new HashSet<>();
	
	public Set<Transaccion> getTransacciones() {
		return transacciones;
	}
	public void setTransacciones(Set<Transaccion> transacciones) {
		this.transacciones = transacciones;
	}
	
	public String getConfirmcontrasena() {
		return confirmcontrasena;
	}
	public void setConfirmcontrasena(String confirmcontrasena) {
		this.confirmcontrasena = confirmcontrasena;
	}
	public Long getusuarioId() {
		return usuarioId;
	}
	public void setusuarioId(Long usuarioId) {
		this.usuarioId = usuarioId;
	}
	public String getContrasena() {
		return contrasena;
	}
	public void setContrasena(String contrasena) {
		this.contrasena = contrasena;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public Usuario() {
	}

	
}
