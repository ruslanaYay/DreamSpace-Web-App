package com.dreamspace.api.controller;

import com.dreamspace.api.dto.AuthResponse;
import com.dreamspace.api.dto.UserDTO;
import com.dreamspace.api.entity.User;
import com.dreamspace.api.security.JwtService;
import com.dreamspace.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;

    @PostMapping(path="/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserDTO userDTO) {
        User registeredUser = userService.registerUser(userDTO);

        String token = jwtService.generateToken(registeredUser.getEmail(), registeredUser.getRole().name());
        AuthResponse response = new AuthResponse(
                registeredUser.getId(),
                registeredUser.getEmail(),
                token,
                registeredUser.getRole().name());

        return  new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
