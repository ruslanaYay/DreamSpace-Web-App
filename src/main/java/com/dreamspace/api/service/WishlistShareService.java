package com.dreamspace.api.service;

import com.dreamspace.api.dto.PageResponseDTO;
import com.dreamspace.api.dto.SharedWishlistResponseDto;
import com.dreamspace.api.dto.WishResponseDTO;
import com.dreamspace.api.dto.WishlistDetailsDTO;
import com.dreamspace.api.entity.Wish;
import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.enums.PrivacyStatus;
import com.dreamspace.api.exception.AccessDeniedException;
import com.dreamspace.api.exception.WishNotFoundException;
import com.dreamspace.api.exception.WishlistNotFoundException;
import com.dreamspace.api.repository.WishRepository;
import com.dreamspace.api.repository.WishlistRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;


@Service
public class WishlistShareService {

    private final WishlistRepository wishlistRepository;
    private final WishlistService wishlistService;
    private final WishRepository wishRepository;

    public WishlistShareService(WishlistRepository wishlistRepository, WishlistService wishlistService, WishRepository wishRepository) {
        this.wishlistRepository = wishlistRepository;
        this.wishlistService = wishlistService;
        this.wishRepository = wishRepository;
    }

    public SharedWishlistResponseDto getWishlistByShareToken(String shareToken) {

        Wishlist wishlist = wishlistRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new WishlistNotFoundException());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isOwner = false;
        String currentUsername = null;

        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getName().equals("anonymousUser")) {

            currentUsername = authentication.getName();

            if (wishlist.getUser() != null && wishlist.getUser().getEmail().equals(currentUsername)) {
                isOwner = true;
            }
        }

        if (wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE && !isOwner) {
            throw new AccessDeniedException("Ви не можете переглядати цей вішліст");
        }

        WishlistDetailsDTO baseDto = wishlistService.getWishlistDetails(wishlist.getId(), currentUsername);

        return new SharedWishlistResponseDto(baseDto, isOwner);
    }
    @Transactional(readOnly = true)
    public PageResponseDTO<WishResponseDTO> getSharedWishlistWishes(String shareToken, int page, int size){
        Wishlist wishlist = wishlistRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new WishlistNotFoundException());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isOwner = false;
        String currentUsername = null;
        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getName().equals("anonymousUser")) {
            currentUsername = authentication.getName();
            if (wishlist.getUser() != null && wishlist.getUser().getEmail().equals(currentUsername)) {
                isOwner = true;
            }
        }
        if (wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE && !isOwner) {
            throw new AccessDeniedException("Ви не можете переглядати цей вішліст");
        }
        if (page < 0) {page = 0;}
        if (size <= 0) {size = 11;}
        if (size > 11) {size = 11;}

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Wish> wishesPage = wishRepository.findAllByWishlist_Id(wishlist.getId(), pageable);
        Page<WishResponseDTO> dtoPage = wishesPage.map(wish -> new WishResponseDTO(
                wish.getId(),
                wish.getWishlist().getId(),
                wish.getName(),
                wish.getStoreLink(),
                wish.getPrice(),
                wish.getDescription(),
                wish.getImageUrl(),
                wish.getPriority(),
                wish.getCreatedAt(),
                wish.getIsCompleted()
        ));
        return new PageResponseDTO<>(dtoPage);
    }
    public WishResponseDTO getSharedWishDetails(String shareToken, Long id){
        Wishlist wishlist = wishlistRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new WishlistNotFoundException());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isOwner = false;
        String currentUsername = null;
        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getName().equals("anonymousUser")) {
            currentUsername = authentication.getName();
            if (wishlist.getUser() != null && wishlist.getUser().getEmail().equals(currentUsername)) {
                isOwner = true;
            }
        }
        if (wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE && !isOwner) {
            throw new AccessDeniedException("Ви не можете переглядати цей вішліст");
        }

        //Перевірка існування і приналежності бажання до вказаного вішліста
        Wish wish = wishRepository.findByIdAndWishlist_ShareToken(id, shareToken)
                .orElseThrow(() -> new WishNotFoundException());
        BigDecimal finalPrice = (wish.getPrice() == null || wish.getPrice().compareTo(BigDecimal.ZERO) == 0)
                ? new BigDecimal("0.00")
                : wish.getPrice();

        String finalStoreLink = (wish.getStoreLink() == null || wish.getStoreLink().trim().isEmpty())
                ? null
                : wish.getStoreLink();

        String finalDescription = (wish.getDescription() == null || wish.getDescription().trim().isEmpty())
                ? null
                : wish.getDescription();
        return new WishResponseDTO(
                wish.getId(),
                wishlist.getId(),
                wish.getName(),
                finalStoreLink,
                finalPrice,
                finalDescription,
                wish.getImageUrl(),
                wish.getPriority(),
                wish.getCreatedAt(),
                wish.getIsCompleted()
        );
    }
}