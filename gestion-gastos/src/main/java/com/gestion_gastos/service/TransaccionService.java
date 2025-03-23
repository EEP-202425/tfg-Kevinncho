package com.gestion_gastos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gestion_gastos.entidades.Gasto;
import com.gestion_gastos.entidades.Ingreso;
import com.gestion_gastos.entidades.TipoTransaccion;
import com.gestion_gastos.entidades.Transaccion;
import com.gestion_gastos.entidades.Usuario;
import com.gestion_gastos.jwt.JwtUtil;
import com.gestion_gastos.repository.GastoRepository;
import com.gestion_gastos.repository.IngresoRepository;
import com.gestion_gastos.repository.TransaccionRepository;
import com.gestion_gastos.repository.UsuarioRepository;

@Service
public class TransaccionService {

    @Autowired
    private TransaccionRepository transaccionRepository;
    
    @Autowired
    private GastoRepository gastoRepository;
    
    @Autowired
    private IngresoRepository ingresoRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public Transaccion guardarTransaccion(Transaccion transaccion, String tokenJWT) {
        // Extraer el email del token
        String userEmail = jwtUtil.extractGmail(tokenJWT);

        // Buscar el usuario en la base de datos usando el email
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                                          .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Asociar el usuario a la transacción
        transaccion.setUsuario(usuario);

        // Guardar la transacción en la base de datos
        transaccion = transaccionRepository.save(transaccion);

        // Verificar el tipo de transacción y guardarla en la tabla correspondiente
        if (transaccion.getTipo() == TipoTransaccion.GASTO) {
            Gasto gasto = new Gasto();
            gasto.setConcepto(transaccion.getConcepto());
            gasto.setMonto(transaccion.getMonto());
            gasto.setFecha(transaccion.getFecha());
            gasto.setTransaccion(transaccion);
            gastoRepository.save(gasto);
        } else if (transaccion.getTipo() == TipoTransaccion.INGRESO) {
            Ingreso ingreso = new Ingreso();
            ingreso.setConcepto(transaccion.getConcepto());
            ingreso.setMonto(transaccion.getMonto());
            ingreso.setFecha(transaccion.getFecha());
            ingreso.setTransaccion(transaccion);
            ingresoRepository.save(ingreso);
        }

        return transaccion;
    }
    public void eliminarTransaccion(Long id) {
        Optional<Transaccion> transaccionOpt = transaccionRepository.findById(id);

        if (transaccionOpt.isPresent()) {
            Transaccion transaccion = transaccionOpt.get();

            // Verificar si la transacción está asociada a un ingreso y eliminarlo
            ingresoRepository.findByTransaccion(transaccion).ifPresent(ingresoRepository::delete);

            // Verificar si la transacción está asociada a un gasto y eliminarlo
            gastoRepository.findByTransaccion(transaccion).ifPresent(gastoRepository::delete);

            // Finalmente, eliminar la transacción
            transaccionRepository.delete(transaccion);
        } else {
            throw new RuntimeException("Transacción no encontrada con ID: " + id);
        }
    }

    public Transaccion actualizarTransaccionYTipo(Long id, Transaccion nuevaTransaccion) {
        return transaccionRepository.findById(id).map(transaccion -> {
            // Actualizar los datos de la transacción
            transaccion.setConcepto(nuevaTransaccion.getConcepto());
            transaccion.setMonto(nuevaTransaccion.getMonto());
            transaccion.setFecha(nuevaTransaccion.getFecha());

            // Guardar la transacción actualizada
            Transaccion transaccionActualizada = transaccionRepository.save(transaccion);

            // Verificar si la transacción pertenece a un Gasto o a un Ingreso
            if (transaccion.getTipo() == TipoTransaccion.GASTO) {
                // Buscar el gasto asociado y actualizarlo
                Optional<Gasto> gastoExistente = gastoRepository.findByTransaccion(transaccion);
                gastoExistente.ifPresent(gasto -> {
                    gasto.setConcepto(nuevaTransaccion.getConcepto());
                    gasto.setMonto(nuevaTransaccion.getMonto());
                    gasto.setFecha(nuevaTransaccion.getFecha());
                    gastoRepository.save(gasto);
                });
            } else if (transaccion.getTipo() == TipoTransaccion.INGRESO) {
                // Buscar el ingreso asociado y actualizarlo
                Optional<Ingreso> ingresoExistente = ingresoRepository.findByTransaccion(transaccion);
                ingresoExistente.ifPresent(ingreso -> {
                    ingreso.setConcepto(nuevaTransaccion.getConcepto());
                    ingreso.setMonto(nuevaTransaccion.getMonto());
                    ingreso.setFecha(nuevaTransaccion.getFecha());
                    ingresoRepository.save(ingreso);
                });
            }

            return transaccionActualizada;
        }).orElseThrow(() -> new RuntimeException("Transacción no encontrada"));
    }
    public List<Transaccion> obtenerTransaccionesPorEmail(String email) {
        return transaccionRepository.findByUsuarioEmail(email); // Suponiendo que tienes este método en el repositorio
    }
}
