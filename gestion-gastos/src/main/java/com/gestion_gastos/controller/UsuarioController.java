package com.gestion_gastos.controller;

import com.gestion_gastos.entidades.Usuario;
import com.gestion_gastos.service.UsuarioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService; // Usar el servicio, no el repositorio

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        if (usuario.getContrasena() == null || usuario.getContrasena().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La contraseña es obligatoria");
        }
        usuarioService.registrarUsuario(usuario);
        return ResponseEntity.ok("Usuario registrado");

    }
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuario(@PathVariable Long id) {
        Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
        return ResponseEntity.ok(usuario);
    }
}