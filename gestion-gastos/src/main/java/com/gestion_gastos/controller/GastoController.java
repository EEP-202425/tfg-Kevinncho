package com.gestion_gastos.controller;

import com.gestion_gastos.jwt.JwtUtil;
import com.gestion_gastos.service.GastoService;
import com.gestion_gastos.service.UsuarioService;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gestion_gastos.entidades.Gasto;
import com.gestion_gastos.entidades.Usuario;

@RestController
@RequestMapping("/gastos")
@CrossOrigin(origins = "http://localhost:4200")
public class GastoController {

    @Autowired
    private GastoService gastoService;
    
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UsuarioService usuarioService; // Servicio para obtener al usuario autenticado

 // Endpoint para obtener los gastos del usuario autenticado
    @GetMapping
    public List<Gasto> obtenerGastos(@RequestHeader("Authorization") String token) {
        // Eliminar el prefijo "Bearer " del token
        String tokenJWT = token.substring(7);
        // Extraer el email del token
        String email = jwtUtil.extractGmail(tokenJWT);
        // Retornar los gastos asociados a ese email
        return gastoService.obtenerGastosPorEmail(email);
    }
    @GetMapping("/email/{email}")
    public ResponseEntity<List<Gasto>> obtenerGastosPorEmail(@PathVariable String email) {
        List<Gasto> gastos = gastoService.obtenerGastosPorEmail(email);
        if (gastos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(gastos);
    }

    @PostMapping
    public ResponseEntity<Gasto> agregarGasto(@RequestBody Gasto gasto, 
                                               @RequestHeader("Authorization") String token) {
        // Extraer el token y el email
        String tokenJWT = token.substring(7);
        String email = jwtUtil.extractGmail(tokenJWT);
        
        // Buscar el usuario por email
        Usuario usuario = usuarioService.buscarPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + email));
        
        // Guardar el gasto, creando la transacción asociada si es necesario
        Gasto gastoGuardado = gastoService.guardarGasto(gasto, usuario);
        return ResponseEntity.ok(gastoGuardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Gasto> actualizarGastoYTransaccion(@PathVariable Long id, @RequestBody Gasto nuevoGasto) {
        Gasto gastoActualizado = gastoService.actualizarGastoYTransaccion(id, nuevoGasto);
        if (gastoActualizado != null) {
            return ResponseEntity.ok(gastoActualizado);
        }
        return ResponseEntity.notFound().build();
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarGastoYTransaccion(@PathVariable Long id) {
        boolean eliminado = gastoService.eliminarGastoYTransaccion(id);
        
        if (eliminado) {
            return ResponseEntity.ok("Gasto y transacción eliminados correctamente.");
        }
        return ResponseEntity.notFound().build();
    }
}