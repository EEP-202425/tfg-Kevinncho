package com.gestion_gastos.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gestion_gastos.dto.NuevoUserDto;
import com.gestion_gastos.entidades.Usuario;
import com.gestion_gastos.jwt.JwtUtil;

@Service
public class AuthService {

    private final UsuarioService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    @Autowired
    public AuthService(UsuarioService userService, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, AuthenticationManagerBuilder authenticationManagerBuilder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManagerBuilder = authenticationManagerBuilder;
    }

    public String authenticate(String username, String password){
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, password);
        Authentication authResult = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authResult);
        return jwtUtil.generateToken(authResult);
    }

    public void registerUser(NuevoUserDto newUserDto){
        if (userService.existsByUserName(newUserDto.getEmail())) {
            throw new IllegalArgumentException("El nombre de usuario ya existe");
        }

        // Crear usuario sin roles
        Usuario user = new Usuario(passwordEncoder.encode(newUserDto.getContrasena()), newUserDto.getEmail());
        userService.save(user);
    }
}
