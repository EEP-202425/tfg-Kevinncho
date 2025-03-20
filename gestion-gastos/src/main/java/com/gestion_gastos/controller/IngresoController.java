package com.gestion_gastos.controller;

import com.gestion_gastos.jwt.JwtUtil;
import com.gestion_gastos.service.IngresoService;
import com.gestion_gastos.service.UsuarioService;
import com.gestion_gastos.entidades.Ingreso;
import com.gestion_gastos.entidades.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/ingresos")
@CrossOrigin(origins = "http://localhost:4200")
public class IngresoController {

    @Autowired
    private IngresoService ingresoService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UsuarioService usuarioService;

    // Obtener ingresos del usuario autenticado
    @GetMapping
    public List<Ingreso> obtenerIngresos(@RequestHeader("Authorization") String token) {
        String tokenJWT = token.substring(7);
        String email = jwtUtil.extractGmail(tokenJWT);
        return ingresoService.obtenerIngresosPorEmail(email);
    }

    // Obtener ingresos por email
    @GetMapping("/email/{email}")
    public ResponseEntity<List<Ingreso>> obtenerIngresosPorEmail(@PathVariable String email) {
        List<Ingreso> ingresos = ingresoService.obtenerIngresosPorEmail(email);
        if (ingresos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(ingresos);
    }

    // Agregar un nuevo ingreso
    @PostMapping
    public ResponseEntity<Ingreso> agregarIngreso(@RequestBody Ingreso ingreso, 
                                                  @RequestHeader("Authorization") String token) {
        String tokenJWT = token.substring(7);
        String email = jwtUtil.extractGmail(tokenJWT);
        
        Usuario usuario = usuarioService.buscarPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + email));
        
        Ingreso ingresoGuardado = ingresoService.guardarIngreso(ingreso, usuario);
        return ResponseEntity.ok(ingresoGuardado);
    }

    // Actualizar ingreso y su transacción
    @PutMapping("/{id}")
    public ResponseEntity<Ingreso> actualizarIngresoYTransaccion(@PathVariable Long id, @RequestBody Ingreso nuevoIngreso) {
        Ingreso ingresoActualizado = ingresoService.actualizarIngresoYTransaccion(id, nuevoIngreso);
        if (ingresoActualizado != null) {
            return ResponseEntity.ok(ingresoActualizado);
        }
        return ResponseEntity.notFound().build();
    }

    // Eliminar ingreso y su transacción
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarIngresoYTransaccion(@PathVariable Long id) {
        boolean eliminado = ingresoService.eliminarIngresoYTransaccion(id);
        
        if (eliminado) {
            return ResponseEntity.ok("Ingreso y transacción eliminados correctamente.");
        }
        return ResponseEntity.notFound().build();
    }
}
