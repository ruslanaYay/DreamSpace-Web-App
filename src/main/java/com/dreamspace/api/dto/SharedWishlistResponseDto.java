package com.dreamspace.api.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;

public record SharedWishlistResponseDto(
        @JsonUnwrapped
        WishlistDetailsDTO wishlist,

        boolean isOwner
) {
}