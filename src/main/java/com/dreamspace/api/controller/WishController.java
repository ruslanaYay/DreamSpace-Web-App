package com.dreamspace.api.controller;

import com.dreamspace.api.dto.WishRequestDTO;
import com.dreamspace.api.dto.WishResponseDTO;
import com.dreamspace.api.service.WishService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/wishes")
public class WishController {
    @Autowired
    private WishService wishService;

    @PostMapping
    public ResponseEntity<WishResponseDTO> createWish(@Valid @RequestBody WishRequestDTO requestDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        WishResponseDTO response = wishService.createWish(requestDTO, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

}
