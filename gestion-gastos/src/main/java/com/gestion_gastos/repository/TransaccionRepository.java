package com.gestion_gastos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gestion_gastos.entidades.Transaccion;
import com.gestion_gastos.entidades.Usuario;

@Repository
public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {
    
 // Método para buscar transacciones por el email del usuario
    List<Transaccion> findByUsuarioEmail(String email);
  
    
}
