package com.dreamspace.api.controller;

import com.dreamspace.api.dto.SharedWishlistResponseDto;
import com.dreamspace.api.service.WishlistShareService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wishlists")
public class WishlistShareController {

    private final WishlistShareService wishlistShareService;


    public WishlistShareController(WishlistShareService wishlistShareService) {
        this.wishlistShareService = wishlistShareService;
    }


    @GetMapping("/share/{shareToken}")
    public ResponseEntity<SharedWishlistResponseDto> getSharedWishlist(@PathVariable String shareToken) {
        SharedWishlistResponseDto response = wishlistShareService.getWishlistByShareToken(shareToken);
        return ResponseEntity.ok(response);
    }
}