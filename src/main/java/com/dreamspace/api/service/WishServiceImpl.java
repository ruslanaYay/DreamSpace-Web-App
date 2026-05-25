package com.dreamspace.api.service;

import com.dreamspace.api.dto.WishRequestDTO;
import com.dreamspace.api.dto.WishResponseDTO;
import com.dreamspace.api.dto.WishlistDetailsDTO;
import com.dreamspace.api.entity.Wish;
import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.enums.Priority;
import com.dreamspace.api.enums.PrivacyStatus;
import com.dreamspace.api.exception.AccessDeniedException;
import com.dreamspace.api.exception.WishlistNotFoundException;
import com.dreamspace.api.exception.WishNotFoundException;
import com.dreamspace.api.repository.WishRepository;
import com.dreamspace.api.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class WishServiceImpl implements WishService {
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
                wish.setPriority(Priority.valueOf(dto.getPriority().toUpperCase()));
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

    @Override
    public List<WishResponseDTO> getWishlistWishes(Long wishlistId, String email){
        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new WishlistNotFoundException());
        boolean isOwner = wishlist.getUser().getEmail().equals(email);
        if (!isOwner && wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE) {
            throw new AccessDeniedException();
        }
        List<Wish> wishes = wishRepository.findAllByWishlist_IdOrderByCreatedAtDesc(wishlistId);
        return wishes.stream()
                .map(wish -> new WishResponseDTO(
                        wish.getId(),
                        wish.getWishlist().getId(),
                        wish.getName(),
                        wish.getStoreLink(),
                        wish.getPrice(),
                        wish.getDescription(),
                        wish.getImageUrl(),
                        wish.getPriority(),
                        wish.getCreatedAt()
                ))
                .toList();
    }

    @Override
    public WishResponseDTO getWishDetails(Long id, String email) {

        Wish wish = wishRepository.findById(id)
                .orElseThrow(() -> new WishNotFoundException());

        Wishlist wishlist = wish.getWishlist();


        boolean isOwner = wishlist.getUser().getEmail().equals(email);
        if (!isOwner && wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE) {
            throw new AccessDeniedException();
        }

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
                wish.getCreatedAt()
        );
    }
}