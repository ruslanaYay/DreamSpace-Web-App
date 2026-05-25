package com.dreamspace.api.service;

import com.dreamspace.api.dto.WishlistDetailsDTO;
import com.dreamspace.api.dto.WishlistRequestDTO; // Додався новий імпорт
import com.dreamspace.api.dto.WishlistResponseDTO;
import com.dreamspace.api.dto.WishlistUpdateRequestDTO;

import java.util.List;

public interface WishlistService {

    List<WishlistResponseDTO> getUserWishlists(String email);


    WishlistResponseDTO createWishlist(String email, WishlistRequestDTO dto);
    WishlistDetailsDTO getWishlistDetails(Long id, String email);
    WishlistResponseDTO updateWishlist(Long id, WishlistUpdateRequestDTO dto, String currentUserEmail);

    void deleteWishlist(Long id, String currentUserEmail);

}