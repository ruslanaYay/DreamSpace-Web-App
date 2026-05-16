package com.dreamspace.api.service;

import com.dreamspace.api.dto.WishlistResponseDTO;

import java.util.List;

public interface WishlistService {
    List<WishlistResponseDTO> getUserWishlists(String email);
}

