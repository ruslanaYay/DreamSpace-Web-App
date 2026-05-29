package com.dreamspace.api.controller;

import com.dreamspace.api.dto.PageResponseDTO;
import com.dreamspace.api.dto.SharedWishlistResponseDto;
import com.dreamspace.api.dto.WishResponseDTO;
import com.dreamspace.api.service.WishlistShareService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @GetMapping("/share/{shareToken}/wishes")
    public ResponseEntity<PageResponseDTO<WishResponseDTO>> getSharedWishlistWishes(@PathVariable String shareToken,
                                                                                    @RequestParam(defaultValue = "0") int page,
                                                                                    @RequestParam(defaultValue = "11") int size) {
        PageResponseDTO<WishResponseDTO> wishes = wishlistShareService.getSharedWishlistWishes(shareToken, page, size);
        return ResponseEntity.ok(wishes);
    }
}