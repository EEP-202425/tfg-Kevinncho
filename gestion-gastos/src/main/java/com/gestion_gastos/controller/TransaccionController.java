package com.gestion_gastos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_gastos.entidades.Transaccion;
import com.gestion_gastos.entidades.Usuario;
import com.gestion_gastos.service.TransaccionService;

@RestController
@RequestMapping("/transacciones")
@CrossOrigin(origins = "http://localhost:4200")
public class TransaccionController {

    @Autowired
    private TransaccionService transaccionService;

    @GetMapping
    public List<Transaccion> listar() {
        // Se obtiene el usuario autenticado del contexto de seguridad
        Usuario usuarioActual = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return transaccionService.obtenerTransaccionesPorUsuario(usuarioActual);
    }

    @PostMapping
    public ResponseEntity<Transaccion> agregar(@RequestBody Transaccion transaccion) {
        return ResponseEntity.ok(transaccionService.guardarTransaccion(transaccion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaccion> editar(@PathVariable Long id, @RequestBody Transaccion transaccion) {
        return ResponseEntity.ok(transaccionService.actualizarTransaccion(id, transaccion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        transaccionService.eliminarTransaccion(id);
        return ResponseEntity.noContent().build();
    }
}