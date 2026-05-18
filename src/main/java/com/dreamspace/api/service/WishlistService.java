package com.dreamspace.api.service;

import com.dreamspace.api.dto.WishlistRequestDTO; // Додався новий імпорт
import com.dreamspace.api.dto.WishlistResponseDTO;

import java.util.List;

public interface WishlistService {

    List<WishlistResponseDTO> getUserWishlists(String email);

    // Змінюємо void на WishlistResponseDTO, а тип dto — на WishlistRequestDTO
    WishlistResponseDTO createWishlist(String email, WishlistRequestDTO dto);
}