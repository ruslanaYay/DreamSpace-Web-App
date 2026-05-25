package com.dreamspace.api.service;

import com.dreamspace.api.dto.WishRequestDTO;
import com.dreamspace.api.dto.WishResponseDTO;

import java.util.List;

public interface WishService {
    WishResponseDTO createWish(WishRequestDTO dto, String currentUserEmail);
    List<WishResponseDTO> getWishlistWishes(Long wishlistId, String email);

    WishResponseDTO getWishDetails(Long id, String email);
}