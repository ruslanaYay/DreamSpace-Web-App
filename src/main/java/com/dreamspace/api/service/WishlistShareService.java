package com.dreamspace.api.service;

import com.dreamspace.api.dto.SharedWishlistResponseDto;
import com.dreamspace.api.dto.WishlistResponseDTO;
import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.enums.PrivacyStatus;
import com.dreamspace.api.exception.AccessDeniedException;
import com.dreamspace.api.exception.WishlistNotFoundException;
import com.dreamspace.api.repository.WishlistRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


@Service
public class WishlistShareService {

    private final WishlistRepository wishlistRepository;
    private final WishlistService wishlistService;

    public WishlistShareService(WishlistRepository wishlistRepository, WishlistService wishlistService) {
        this.wishlistRepository = wishlistRepository;
        this.wishlistService = wishlistService;
    }

    public SharedWishlistResponseDto getWishlistByShareToken(String shareToken) {

        Wishlist wishlist = wishlistRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new WishlistNotFoundException());


        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isOwner = false;

        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getName().equals("anonymousUser")) {

            String currentUsername = authentication.getName();
            if (wishlist.getUser() != null && wishlist.getUser().getEmail().equals(currentUsername)) {
                isOwner = true;
            }
        }


        if (wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE && !isOwner) {
            throw new AccessDeniedException();
        }


        WishlistResponseDTO baseDto = wishlistService.getWishlistById(wishlist.getId());

        return new SharedWishlistResponseDto(baseDto, isOwner);
    }
}