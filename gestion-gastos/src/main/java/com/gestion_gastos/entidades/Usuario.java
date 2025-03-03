package com.gestion_gastos.entidades;
import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long usuarioId;
	
	@Column(nullable = false)
	private String contrasena;
	
	@NotBlank(message = "El email no puede estar vacío")
    @Email(message = "Debe proporcionar un email válido")
	@Column(nullable = false)
	private String email;
	

	
	public Usuario(String contrasena,
			@NotBlank(message = "El email no puede estar vacío") @Email(message = "Debe proporcionar un email válido") String email) {
		this.contrasena = contrasena;
		this.email = email;
	}
	
	
	@OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true) 
	@JsonIgnore
	private Set<Transaccion> transacciones= new HashSet<>();
	
	public Set<Transaccion> getTransacciones() {
		return transacciones;
	}
	public void setTransacciones(Set<Transaccion> transacciones) {
		this.transacciones = transacciones;
	}
	
	public Long getUsuarioId() {
		return usuarioId;
	}
	public void setUsuarioId(Long usuarioId) {
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
