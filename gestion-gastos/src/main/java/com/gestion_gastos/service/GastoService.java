package com.gestion_gastos.service;

import com.gestion_gastos.entidades.Gasto;
import com.gestion_gastos.entidades.TipoTransaccion;
import com.gestion_gastos.entidades.Transaccion;
import com.gestion_gastos.entidades.Usuario;
import com.gestion_gastos.repository.GastoRepository;
import com.gestion_gastos.repository.TransaccionRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class GastoService {

    @Autowired
    private GastoRepository gastoRepository;
    @Autowired
    private TransaccionRepository transaccionRepository;

    // Obtener todos los gastos para un usuario dado (usando el email)
    public List<Gasto> obtenerGastosPorEmail(String email) {
        return gastoRepository.findByTransaccionUsuarioEmail(email);
    }

 // Guardar un nuevo gasto, creando una transacción asociada si no se envía una
    public Gasto guardarGasto(Gasto gasto, Usuario usuario) {
        // Si el gasto no tiene una transacción asociada, la creamos
        if (gasto.getTransaccion() == null) {
            Transaccion nuevaTransaccion = new Transaccion();
            // Asignamos los valores de la transacción basándonos en el gasto
            nuevaTransaccion.setConcepto(gasto.getConcepto());
            nuevaTransaccion.setMonto(gasto.getMonto());
            nuevaTransaccion.setFecha(gasto.getFecha());
            nuevaTransaccion.setTipo(TipoTransaccion.GASTO); // Usamos el enum correcto
            nuevaTransaccion.setUsuario(usuario);  // Asociamos el usuario autenticado
            // Guardamos la transacción en la BD
            nuevaTransaccion = transaccionRepository.save(nuevaTransaccion);
            // Asignamos la transacción creada al gasto
            gasto.setTransaccion(nuevaTransaccion);
        }
        // Guardamos el gasto en la BD
        return gastoRepository.save(gasto);
    }

    public Gasto actualizarGastoYTransaccion(Long id, Gasto nuevoGasto) {
        Optional<Gasto> gastoExistente = gastoRepository.findById(id);

        if (gastoExistente.isPresent()) {
            Gasto gasto = gastoExistente.get();

            // Actualizar los datos del gasto
            gasto.setConcepto(nuevoGasto.getConcepto());
            gasto.setMonto(nuevoGasto.getMonto());
            gasto.setFecha(nuevoGasto.getFecha());

            // Obtener la transacción asociada
            Transaccion transaccion = gasto.getTransaccion();
            if (transaccion != null) {
                transaccion.setConcepto(nuevoGasto.getConcepto()); // Sincronizar concepto
                transaccion.setMonto(nuevoGasto.getMonto()); // Sincronizar monto
                transaccion.setFecha(nuevoGasto.getFecha()); // Sincronizar fecha
                transaccionRepository.save(transaccion); // Guardar la transacción actualizada
            }

            return gastoRepository.save(gasto); // Guardar el gasto actualizado
        }
        return null; // Retorna null si el gasto no existe
    }
    public boolean eliminarGastoYTransaccion(Long id) {
        Optional<Gasto> gastoExistente = gastoRepository.findById(id);
        if (gastoExistente.isPresent()) {
            Gasto gasto = gastoExistente.get();
            
            Transaccion transaccion = gasto.getTransaccion();
            
            // Eliminar el gasto
            gastoRepository.delete(gasto);
            
            if (transaccion != null) {
                transaccionRepository.delete(transaccion);
            }
            
            return true;
        }
        return false;
    }
}

