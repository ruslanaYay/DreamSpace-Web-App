package com.dreamspace.api.controller;

import com.dreamspace.api.dto.WishlistResponseDTO;
import com.dreamspace.api.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
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
        //отримання пошти поточного користувача
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<WishlistResponseDTO> myWishlists = wishlistService.getUserWishlists(email);

        return new ResponseEntity<>(myWishlists, HttpStatus.OK);
    }
}
