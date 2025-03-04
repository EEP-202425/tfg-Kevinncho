package com.gestion_gastos.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gestion_gastos.entidades.Transaccion;
import com.gestion_gastos.entidades.Usuario;
import com.gestion_gastos.repository.TransaccionRepository;

@Service
public class TransaccionService {

    @Autowired
    private TransaccionRepository transaccionRepository;

    public List<Transaccion> obtenerTransaccionesPorUsuario(Usuario usuario) {
        return transaccionRepository.findByUsuario(usuario);
    }

    public Transaccion guardarTransaccion(Transaccion transaccion) {
        return transaccionRepository.save(transaccion);
    }

    public void eliminarTransaccion(Long id) {
        transaccionRepository.deleteById(id);
    }

    public Transaccion actualizarTransaccion(Long id, Transaccion nuevaTransaccion) {
        return transaccionRepository.findById(id).map(t -> {
            t.setMonto(nuevaTransaccion.getMonto());
            t.setDescripcion(nuevaTransaccion.getDescripcion());
            t.setFecha(nuevaTransaccion.getFecha());
            t.setTipo(nuevaTransaccion.getTipo());
            return transaccionRepository.save(t);
        }).orElseThrow(() -> new RuntimeException("Transacción no encontrada"));
    }
}
