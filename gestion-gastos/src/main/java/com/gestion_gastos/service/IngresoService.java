package com.gestion_gastos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gestion_gastos.entidades.Ingreso;
import com.gestion_gastos.entidades.TipoTransaccion;
import com.gestion_gastos.entidades.Transaccion;
import com.gestion_gastos.entidades.Usuario;
import com.gestion_gastos.repository.IngresoRepository;
import com.gestion_gastos.repository.TransaccionRepository;

@Service
public class IngresoService {

    @Autowired
    private IngresoRepository ingresoRepository;
    
    @Autowired
    private TransaccionRepository transaccionRepository;

    // Obtener todos los ingresos para un usuario dado (usando el email)
    public List<Ingreso> obtenerIngresosPorEmail(String email) {
        return ingresoRepository.findByTransaccionUsuarioEmail(email);
    }

    // Guardar un nuevo ingreso, creando una transacción asociada si no se envía una
    public Ingreso guardarIngreso(Ingreso ingreso, Usuario usuario) {
        if (ingreso.getTransaccion() == null) {
            Transaccion nuevaTransaccion = new Transaccion();
            nuevaTransaccion.setConcepto(ingreso.getConcepto());
            nuevaTransaccion.setMonto(ingreso.getMonto());
            nuevaTransaccion.setFecha(ingreso.getFecha());
            nuevaTransaccion.setTipo(TipoTransaccion.INGRESO);
            nuevaTransaccion.setUsuario(usuario);
            
            nuevaTransaccion = transaccionRepository.save(nuevaTransaccion);
            ingreso.setTransaccion(nuevaTransaccion);
        }
        return ingresoRepository.save(ingreso);
    }

    public Ingreso actualizarIngresoYTransaccion(Long id, Ingreso nuevoIngreso) {
        Optional<Ingreso> ingresoExistente = ingresoRepository.findById(id);

        if (ingresoExistente.isPresent()) {
            Ingreso ingreso = ingresoExistente.get();

            ingreso.setConcepto(nuevoIngreso.getConcepto());
            ingreso.setMonto(nuevoIngreso.getMonto());
            ingreso.setFecha(nuevoIngreso.getFecha());

            Transaccion transaccion = ingreso.getTransaccion();
            if (transaccion != null) {
                transaccion.setConcepto(nuevoIngreso.getConcepto());
                transaccion.setMonto(nuevoIngreso.getMonto());
                transaccion.setFecha(nuevoIngreso.getFecha());
                transaccionRepository.save(transaccion);
            }

            return ingresoRepository.save(ingreso);
        }
        return null;
    }

    public boolean eliminarIngresoYTransaccion(Long id) {
        Optional<Ingreso> ingresoExistente = ingresoRepository.findById(id);
        if (ingresoExistente.isPresent()) {
            Ingreso ingreso = ingresoExistente.get();
            
            Transaccion transaccion = ingreso.getTransaccion();
            
            ingresoRepository.delete(ingreso);
            
            if (transaccion != null) {
                transaccionRepository.delete(transaccion);
            }
            
            return true;
        }
        return false;
    }
}
