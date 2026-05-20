package com.dreamspace.api.service;

import com.dreamspace.api.dto.WishRequestDTO;
import com.dreamspace.api.dto.WishResponseDTO;

public interface WishService {
    WishResponseDTO createWish(WishRequestDTO dto, String currentUserEmail);
}
