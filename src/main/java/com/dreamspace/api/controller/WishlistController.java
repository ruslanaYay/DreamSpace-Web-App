package com.dreamspace.api.controller;

import com.dreamspace.api.dto.WishlistRequestDTO;
import com.dreamspace.api.dto.WishlistResponseDTO;
import com.dreamspace.api.dto.WishlistUpdateRequestDTO;
import com.dreamspace.api.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @GetMapping
    public ResponseEntity<List<WishlistResponseDTO>> getWishlists() {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<WishlistResponseDTO> myWishlists = wishlistService.getUserWishlists(email);

        return new ResponseEntity<>(myWishlists, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<WishlistResponseDTO> createWishlist(@Valid @RequestBody WishlistRequestDTO requestDTO) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        WishlistResponseDTO responseDTO = wishlistService.createWishlist(email, requestDTO);

        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }


    @PutMapping("/{id}")
    public ResponseEntity<WishlistResponseDTO> updateWishlist(
            @PathVariable Long id,
            @Valid @RequestBody WishlistUpdateRequestDTO requestDTO) {


        String email = SecurityContextHolder.getContext().getAuthentication().getName();


        WishlistResponseDTO responseDTO = wishlistService.updateWishlist(id, requestDTO, email);


        return new ResponseEntity<>(responseDTO, HttpStatus.OK);
    }

}