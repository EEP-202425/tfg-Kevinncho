package com.gestion_gastos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gestion_gastos.entidades.Ingreso;
import com.gestion_gastos.entidades.Transaccion;

@Repository
public interface IngresoRepository extends JpaRepository<Ingreso, Long> {
    // Método para obtener los ingresos de un usuario usando la relación con Transaccion
    List<Ingreso> findByTransaccionUsuarioEmail(String email);
    
    Optional<Ingreso> findByTransaccion(Transaccion transaccion);

}