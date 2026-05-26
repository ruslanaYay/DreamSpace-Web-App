package com.dreamspace.api.service;

import com.dreamspace.api.dto.WishRequestDTO;
import com.dreamspace.api.dto.WishResponseDTO;
import com.dreamspace.api.dto.WishUpdateRequestDTO;

import java.util.List;

public interface WishService {
    WishResponseDTO createWish(WishRequestDTO dto, String currentUserEmail);
    List<WishResponseDTO> getWishlistWishes(Long wishlistId, String email);
    WishResponseDTO updateWish(Long wishId, WishUpdateRequestDTO dto, String currentUserEmail);
    WishResponseDTO getWishDetails(Long id, String email);
    WishResponseDTO toggleWishStatus(Long id, String email);
    void deleteWish(Long id, String email);
}

