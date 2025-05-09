package com.gestion_gastos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gestion_gastos.entidades.Transaccion;
import com.gestion_gastos.entidades.Usuario;
import com.gestion_gastos.jwt.JwtUtil;
import com.gestion_gastos.service.TransaccionService;

@RestController
@RequestMapping("/transacciones")
@CrossOrigin(origins = "http://localhost:4200")
public class TransaccionController {

    @Autowired
    private TransaccionService transaccionService;
    @Autowired
    private JwtUtil jwtUtil;  

    @GetMapping
    public List<Transaccion> obtenerTransacciones(@RequestHeader("Authorization") String token) {
        // Eliminar "Bearer " del token
        String tokenJWT = token.substring(7); // Eliminar el prefijo "Bearer " (7 caracteres)
        
        // Extraer el email del token
        String userEmail = jwtUtil.extractGmail(tokenJWT); 

        // Obtener las transacciones del usuario con el email extraído
        return transaccionService.obtenerTransaccionesPorEmail(userEmail);
    }
    @PostMapping
    public ResponseEntity<Transaccion> agregar(@RequestBody Transaccion transaccion, @RequestHeader("Authorization") String token) {
        // Eliminar "Bearer " del token
        String tokenJWT = token.substring(7); // Eliminar el prefijo "Bearer "
        
        // Llamar al servicio para guardar la transacción
        Transaccion transaccionGuardada = transaccionService.guardarTransaccion(transaccion, tokenJWT);
        
        return ResponseEntity.ok(transaccionGuardada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaccion> editar(@PathVariable Long id, @RequestBody Transaccion transaccion) {
        return ResponseEntity.ok(transaccionService.actualizarTransaccionYTipo(id, transaccion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        transaccionService.eliminarTransaccion(id);
        return ResponseEntity.noContent().build();
    }
}