package com.gestion_gastos.jwt;

import lombok.NoArgsConstructor;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.gestion_gastos.service.UsuarioService;
import java.io.IOException;


@NoArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter{

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UsuarioService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");
        System.out.println("Authorization Header: " + authorizationHeader);

        String userGmail = null;
        String jwt = null;

        try {
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                jwt = authorizationHeader.substring(7);
                System.out.println("JWT Token recibido: " + jwt);
                userGmail = jwtUtil.extractGmail(jwt);
                System.out.println("Usuario extraído del token: " + userGmail);
            }
        } catch (Exception ex) {
            System.err.println("Error con el JWT: " + ex.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (userGmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("Cargando usuario desde DB: " + userGmail);
            UserDetails userDetails = userService.loadUserByUsername(userGmail);

            System.out.println("Validando token...");
            if (jwtUtil.validateToken(jwt, userDetails)) {
                System.out.println("Token válido, autenticando usuario...");
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                System.out.println("Token inválido");
            }
        }
        filterChain.doFilter(request, response);
    }


}
