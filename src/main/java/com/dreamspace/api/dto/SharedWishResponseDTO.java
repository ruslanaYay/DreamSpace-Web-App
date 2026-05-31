package com.dreamspace.api.dto;
import com.fasterxml.jackson.annotation.JsonUnwrapped;

public record SharedWishResponseDTO(
        @JsonUnwrapped
        WishResponseDTO wish,
        boolean isOwner

) {
}