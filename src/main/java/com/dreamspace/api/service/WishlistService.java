package com.dreamspace.api.service;

import com.dreamspace.api.dto.*;
import org.springframework.data.domain.Page;

import java.util.List;

public interface WishlistService {

    PageResponseDTO<WishlistResponseDTO> getUserWishlists(String email, String query, int page, int size);

    WishlistResponseDTO createWishlist(String email, WishlistRequestDTO dto);
    WishlistDetailsDTO getWishlistDetails(Long id, String email);
    WishlistResponseDTO updateWishlist(Long id, WishlistUpdateRequestDTO dto, String currentUserEmail);

    void deleteWishlist(Long id, String currentUserEmail);
    String getShareLink(Long id, String currentUserEmail);
    WishlistResponseDTO getWishlistById(Long id);
}