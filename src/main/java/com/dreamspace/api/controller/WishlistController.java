package com.dreamspace.api.controller;

import com.dreamspace.api.dto.*;
import com.dreamspace.api.service.WishService;
import com.dreamspace.api.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/wishlists")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;
    @Autowired
    private WishService wishService;

    @GetMapping
    public ResponseEntity<List<WishlistResponseDTO>> getWishlists(@RequestParam(required = false) String query) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<WishlistResponseDTO> myWishlists = wishlistService.getUserWishlists(email, query);

        return new ResponseEntity<>(myWishlists, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<WishlistResponseDTO> createWishlist(@Valid @RequestBody WishlistRequestDTO requestDTO) {
        // Отримання email поточного авторизованого користувача з токена
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        // Виклик сервісу, який створить запис у БД і поверне результат
        WishlistResponseDTO responseDTO = wishlistService.createWishlist(email, requestDTO);
        // Повернення статусу 201 Created разом із заповненим JSON об'єкта
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }
    // для отримання інформації про вішліст
    @GetMapping("/{id}")
    public ResponseEntity<WishlistDetailsDTO> getWishlistById(@PathVariable Long id) {
        // Отримання пошти поточного користувача
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        WishlistDetailsDTO WishlistDetails = wishlistService.getWishlistDetails(id, email);
        // 200 OK
        return new ResponseEntity<>(WishlistDetails, HttpStatus.OK);
    }
    @PutMapping("/{id}")
    public ResponseEntity<WishlistResponseDTO> updateWishlist(@PathVariable Long id, @Valid @RequestBody WishlistUpdateRequestDTO requestDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        WishlistResponseDTO responseDTO = wishlistService.updateWishlist(id, requestDTO, email);
        return new ResponseEntity<>(responseDTO, HttpStatus.OK);
    }

    //отримання всіх бажань вішліста
    @GetMapping("/{wishlistId}/wishes")
    public ResponseEntity<List<WishResponseDTO>> getWishlistWishes(@PathVariable Long wishlistId){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<WishResponseDTO> wishes = wishService.getWishlistWishes(wishlistId, email);
        return new ResponseEntity<>(wishes, HttpStatus.OK);
    }

    // видалення вішліста
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWishlist(@PathVariable Long id) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();


        wishlistService.deleteWishlist(id, email);


        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // отримання посилання на вішліст
    @GetMapping("/{id}/share-link")
    public ResponseEntity<java.util.Map<String, String>> getShareLink(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        String link = wishlistService.getShareLink(id, email);

        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("shareLink", link);

        return ResponseEntity.ok(response);
    }

}