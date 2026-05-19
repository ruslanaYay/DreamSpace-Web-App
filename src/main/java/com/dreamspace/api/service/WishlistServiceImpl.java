package com.dreamspace.api.service;

import com.dreamspace.api.dto.WishlistRequestDTO;
import com.dreamspace.api.dto.WishlistResponseDTO;
import com.dreamspace.api.entity.User;
import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.enums.PrivacyStatus;
import com.dreamspace.api.exception.UserNotFoundException;
import com.dreamspace.api.repository.UserRepository;
import com.dreamspace.api.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WishlistServiceImpl implements WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<WishlistResponseDTO> getUserWishlists(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException());

        List<Wishlist> wishlists = wishlistRepository.findAllByUser(user);

        return wishlists.stream()
                .map(wishlist -> new WishlistResponseDTO(
                        wishlist.getId(),
                        wishlist.getName(),
                        0,
                        null,
                        wishlist.getPrivacyStatus()
                ))
                .toList();
    }

    @Override
    @Transactional
    public WishlistResponseDTO createWishlist(String email, WishlistRequestDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException());

        Wishlist wishlist = new Wishlist();
        wishlist.setName(dto.getName());
        wishlist.setDescription(dto.getDescription());
        wishlist.setUser(user);
        wishlist.setCreatedAt(LocalDateTime.now());

        if (dto.getPrivacyStatus() == null || dto.getPrivacyStatus().isEmpty()) {
            wishlist.setPrivacyStatus(PrivacyStatus.LINK);
        } else {
            wishlist.setPrivacyStatus(PrivacyStatus.valueOf(dto.getPrivacyStatus().toUpperCase()));
        }

        if (dto.getShowBooked() == null) {
            wishlist.setShowBooked(false);
        } else {
            wishlist.setShowBooked(dto.getShowBooked());
        }

        Wishlist savedWishlist = wishlistRepository.save(wishlist);

        WishlistResponseDTO responseDTO = new WishlistResponseDTO();
        responseDTO.setId(savedWishlist.getId());
        responseDTO.setName(savedWishlist.getName());
        responseDTO.setDescription(savedWishlist.getDescription());
        responseDTO.setPrivacyStatus(savedWishlist.getPrivacyStatus());
        responseDTO.setShowBooked(savedWishlist.getShowBooked());
        responseDTO.setCreatedAt(savedWishlist.getCreatedAt());
        responseDTO.setItemCount(0);
        responseDTO.setCoverImageUrl(null);

        return responseDTO;
    }
}