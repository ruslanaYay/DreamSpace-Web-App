package com.dreamspace.api.service;

import com.dreamspace.api.dto.PageResponseDTO;
import com.dreamspace.api.dto.WishRequestDTO;
import com.dreamspace.api.dto.WishResponseDTO;
import com.dreamspace.api.dto.WishUpdateRequestDTO;
import com.dreamspace.api.entity.Reservation;
import com.dreamspace.api.entity.Wish;
import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.enums.Priority;
import com.dreamspace.api.enums.PrivacyStatus;
import com.dreamspace.api.enums.ReservationType;
import com.dreamspace.api.exception.AccessDeniedException;
import com.dreamspace.api.exception.WishlistNotFoundException;
import com.dreamspace.api.exception.WishNotFoundException;
import com.dreamspace.api.mapper.WishResponseMapper;
import com.dreamspace.api.repository.UserRepository;
import com.dreamspace.api.repository.WishRepository;
import com.dreamspace.api.repository.WishlistRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import com.dreamspace.api.entity.User;

import java.math.BigDecimal;
import java.util.List;

@Service
public class WishServiceImpl implements WishService {
    @Autowired
    private WishRepository wishRepository;
    @Autowired
    private WishlistRepository wishlistRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private WishResponseMapper wishResponseMapper;

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
                savedWish.getCreatedAt(),
                savedWish.getIsCompleted()
        );
    }

    @Override
    public PageResponseDTO<WishResponseDTO> getWishlistWishes(Long wishlistId, String email, int page, int size){
        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new WishlistNotFoundException());
        boolean isOwner = wishlist.getUser().getEmail().equals(email);
        if (!isOwner && wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE) {
            throw new AccessDeniedException();
        }
        if (page < 0) {page = 0;}
        if (size <= 0) {size = 15;}
        if (size > 15) {size = 15;}

        Long currentUserId = userRepository.findByEmail(email).map(User::getId).orElse(null);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Wish> wishesPage = wishRepository.findAllByWishlist_Id(wishlistId, pageable);
        Page<WishResponseDTO> dtoPage = wishesPage.map(wish -> wishResponseMapper.toDTO(wish, currentUserId, isOwner, false));
        return new PageResponseDTO<>(dtoPage);
    }

    @Override
    public WishResponseDTO updateWish(Long wishId, WishUpdateRequestDTO dto, String currentUserEmail){
        Wish wish = wishRepository.findById(wishId)
                .orElseThrow(() -> new WishNotFoundException());
        Wishlist wishlist = wish.getWishlist();
        if (!wishlist.getUser().getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException();
        }

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
        Wish updatedWish = wishRepository.save(wish);

        Long currentUserId = userRepository.findByEmail(currentUserEmail).map(User::getId).orElse(null);
        return wishResponseMapper.toDTO(updatedWish, currentUserId, true, false);
    }

    @Override
    @Transactional
    public WishResponseDTO getWishDetails(Long id, String email) {

        Wish wish = wishRepository.findById(id)
                .orElseThrow(() -> new WishNotFoundException());

        Wishlist wishlist = wish.getWishlist();

        boolean isOwner = wishlist.getUser().getEmail().equals(email);
        if (!isOwner && wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE) {
            throw new AccessDeniedException();
        }
        Long currentUserId = userRepository.findByEmail(email).map(User::getId).orElse(null);
        return wishResponseMapper.toDTO(wish, currentUserId, isOwner,true);
    }

    @Override
    public WishResponseDTO toggleWishStatus(Long id, String email) {
        Wish wish = wishRepository.findById(id)
                .orElseThrow(() -> new WishNotFoundException());
        if (!wish.getWishlist().getUser().getEmail().equals(email)) {
            throw new AccessDeniedException();
        }

        wish.setCompleted(!wish.getIsCompleted());
        Wish savedWish = wishRepository.save(wish);
        Long currentUserId = userRepository.findByEmail(email).map(User::getId).orElse(null);
        return wishResponseMapper.toDTO(savedWish, currentUserId, true, false);
    }
    @Override
    public void deleteWish(Long id, String email) {
        Wish wish = wishRepository.findById(id)
                .orElseThrow(() -> new WishNotFoundException());

        if (!wish.getWishlist().getUser().getEmail().equals(email)) {
            throw new AccessDeniedException();
        }

        wishRepository.delete(wish);
    }
}


