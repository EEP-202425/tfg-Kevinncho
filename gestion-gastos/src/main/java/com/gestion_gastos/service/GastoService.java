package com.gestion_gastos.service;

import com.gestion_gastos.entidades.Gasto;
import com.gestion_gastos.entidades.TipoTransaccion;
import com.gestion_gastos.entidades.Transaccion;
import com.gestion_gastos.entidades.Usuario;
import com.gestion_gastos.repository.GastoRepository;
import com.gestion_gastos.repository.TransaccionRepository;

import java.util.List;
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

    // Actualizar un gasto existente
    public Gasto actualizarGasto(Long id, Gasto gastoActualizado) {
        return gastoRepository.findById(id).map(gasto -> {
            gasto.setConcepto(gastoActualizado.getConcepto());
            gasto.setMonto(gastoActualizado.getMonto());
            gasto.setFecha(gastoActualizado.getFecha());
            // Aquí puedes actualizar otros campos si es necesario
            return gastoRepository.save(gasto);
        }).orElseThrow(() -> new RuntimeException("Gasto no encontrado con ID: " + id));
    }

    // Eliminar un gasto
    public void eliminarGasto(Long id) {
        gastoRepository.deleteById(id);
    }
}

