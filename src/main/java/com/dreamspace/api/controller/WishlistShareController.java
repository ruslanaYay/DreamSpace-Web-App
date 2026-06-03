package com.dreamspace.api.controller;

import com.dreamspace.api.dto.PageResponseDTO;
import com.dreamspace.api.dto.SharedWishResponseDTO;
import com.dreamspace.api.dto.SharedWishlistResponseDto;
import com.dreamspace.api.dto.WishResponseDTO;
import com.dreamspace.api.dto.ReservationRequestDTO;
import com.dreamspace.api.dto.ReservationResponseDTO;
import com.dreamspace.api.service.WishlistShareService;
import org.springframework.http.HttpStatus;
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
                                                                                    @RequestParam(defaultValue = "15") int size) {
        PageResponseDTO<WishResponseDTO> wishes = wishlistShareService.getSharedWishlistWishes(shareToken, page, size);
        return ResponseEntity.ok(wishes);
    }
    @GetMapping("/share/{shareToken}/wishes/{id}")
    public ResponseEntity<SharedWishResponseDTO> getSharedWishDetails(@PathVariable String shareToken, @PathVariable Long id) {
        SharedWishResponseDTO response = wishlistShareService.getSharedWishDetails(shareToken, id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/share/{shareToken}/wishes/{id}/reserve")
    public ResponseEntity<ReservationResponseDTO> reserveWish(
            @PathVariable String shareToken,
            @PathVariable Long id,
            @RequestBody ReservationRequestDTO requestDto) {
        ReservationResponseDTO response = wishlistShareService.reserveWish(shareToken, id, requestDto);

        return ResponseEntity.ok(response);
    }
}