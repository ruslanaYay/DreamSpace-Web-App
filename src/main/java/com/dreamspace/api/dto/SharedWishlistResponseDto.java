package com.dreamspace.api.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;

public record SharedWishlistResponseDto(
        @JsonUnwrapped
        WishlistResponseDTO wishlist,

        boolean isOwner
) {
}