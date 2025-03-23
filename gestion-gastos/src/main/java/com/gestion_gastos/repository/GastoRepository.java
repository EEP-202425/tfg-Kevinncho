package com.gestion_gastos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gestion_gastos.entidades.Gasto;
import com.gestion_gastos.entidades.Transaccion;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {
	// Método para obtener los gastos de un usuario (si la relación se define en Transaccion)
    // Esto asume que el objeto Gasto tiene una relación con Transaccion y ésta a su vez contiene la información del usuario.
    List<Gasto> findByTransaccionUsuarioEmail(String email);
    
    Optional<Gasto> findByTransaccion(Transaccion transaccion);

    
    
}
