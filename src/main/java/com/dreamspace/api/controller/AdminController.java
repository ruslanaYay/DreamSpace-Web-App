package com.dreamspace.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

//Це простий контроллер для перевірки чи парвильно працює JwtAuthFilter
@RestController
@CrossOrigin
@RequestMapping("/api/admin")
public class AdminController {
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> adminEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Доступ підтверджено.");
        response.put("status", "Success");

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
