package com.dreamspace.api.controller;

import com.dreamspace.api.dto.WishlistRequestDTO; // Додали новий імпорт
import com.dreamspace.api.dto.WishlistResponseDTO;
import com.dreamspace.api.service.WishlistService;
import jakarta.validation.Valid; // Додали для активації валідації (@NotBlank)
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/wishlists")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistResponseDTO>> getWishlists() {
        // Отримання пошти поточного користувача
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<WishlistResponseDTO> myWishlists = wishlistService.getUserWishlists(email);

        return new ResponseEntity<>(myWishlists, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<WishlistResponseDTO> createWishlist(@Valid @RequestBody WishlistRequestDTO requestDTO) {
        // Отримуємо email поточного авторизованого користувача з токена
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // Викликаємо сервіс, який створить запис у БД і поверне нам результат
        WishlistResponseDTO responseDTO = wishlistService.createWishlist(email, requestDTO);

        // Повертаємо статус 201 Created разом із заповненим JSON об'єкта
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }
}