package com.gestion_gastos.service;


import com.gestion_gastos.entidades.Usuario;
import com.gestion_gastos.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario registrarUsuario(Usuario usuario) {
        if (usuario.getContrasena() == null || usuario.getContrasena().isEmpty()) {
            throw new IllegalArgumentException("La contraseña no puede estar vacía.");
        }
        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email); // Busca por email
    }
    public Usuario obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}
