package com.dreamspace.api.service;

import com.dreamspace.api.dto.WishRequestDTO;
import com.dreamspace.api.dto.WishResponseDTO;
import com.dreamspace.api.entity.Wish;
import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.enums.Priority;
import com.dreamspace.api.exception.AccessDeniedException;
import com.dreamspace.api.exception.WishlistNotFoundException;
import com.dreamspace.api.repository.WishRepository;
import com.dreamspace.api.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class WishServiceImpl implements WishService{
    @Autowired
    private WishRepository wishRepository;
    @Autowired
    private WishlistRepository wishlistRepository;

    @Override
    public WishResponseDTO createWish(WishRequestDTO dto, String email){
        Wishlist wishlist = wishlistRepository.findById(dto.getWishlistId())
                .orElseThrow(() -> new WishlistNotFoundException());

        if (!wishlist.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException();
        }

        Wish wish = new Wish();
        wish.setWishlist(wishlist);
        wish.setName(dto.getName());
        wish.setStoreLink(dto.getStoreLink());
        wish.setDescription(dto.getDescription());
        wish.setImageUrl(dto.getImageUrl());

        if (dto.getPrice() == null) {
            wish.setPrice(BigDecimal.ZERO);
        } else {
            wish.setPrice(dto.getPrice());
        }

        if (dto.getPriority() == null || dto.getPriority().trim().isEmpty()) {
            wish.setPriority(Priority.HIGH);
        } else {
            try {
                wish.setPriority(Priority.valueOf(dto.getPriority().toUpperCase())); //що це означає?
            } catch (IllegalArgumentException e) {
                wish.setPriority(Priority.HIGH);
            }
        }
        Wish savedWish = wishRepository.save(wish);

        return new WishResponseDTO(
                savedWish.getId(),
                savedWish.getWishlist().getId(),
                savedWish.getName(),
                savedWish.getStoreLink(),
                savedWish.getPrice(),
                savedWish.getDescription(),
                savedWish.getImageUrl(),
                savedWish.getPriority(),
                savedWish.getCreatedAt()
        );

    }
}
