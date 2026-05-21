package com.dreamspace.api.service;


import com.dreamspace.api.dto.WishlistDetailsDTO;
import com.dreamspace.api.dto.WishlistRequestDTO; // Додали новий імпорт
import com.dreamspace.api.dto.WishlistResponseDTO;
import com.dreamspace.api.dto.WishlistUpdateRequestDTO; // Додали новий імпорт
import com.dreamspace.api.entity.User;
import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.enums.PrivacyStatus; // Додали для роботи з енумом приватності
import com.dreamspace.api.exception.AccessDeniedException;
import com.dreamspace.api.exception.UserNotFoundException;
import com.dreamspace.api.exception.WishlistNotFoundException;
import com.dreamspace.api.repository.UserRepository;
import com.dreamspace.api.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.dreamspace.api.repository.WishRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class WishlistServiceImpl implements WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WishRepository wishRepository;

    @Override
    public List<WishlistResponseDTO> getUserWishlists(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException());

        List<Wishlist> wishlists = wishlistRepository.findAllByUser(user);

        return wishlists.stream()
                .map(wishlist -> {
                    int itemCount = (int) wishRepository.countByWishlistId(wishlist.getId());
                    String coverImageUrl = wishRepository
                            .findFirstByWishlistIdAndImageUrlIsNotNullOrderByCreatedAtAsc(wishlist.getId())
                            .map(wish -> wish.getImageUrl())
                            .orElse(null);

                    return new WishlistResponseDTO(
                            wishlist.getId(),
                            wishlist.getName(),
                            wishlist.getDescription(),
                            itemCount,
                            coverImageUrl,
                            wishlist.getPrivacyStatus(),
                            wishlist.getShowBooked() != null ? wishlist.getShowBooked() : false,
                            wishlist.getCreatedAt()
                    );
                })
                .toList();
    }

    @Override
    public WishlistDetailsDTO getWishlistDetails(Long id, String email){
        Wishlist wishlist = wishlistRepository.findById(id)
                .orElseThrow(() -> new WishlistNotFoundException());
        boolean isOwner = wishlist.getUser().getEmail().equals(email); // що це значить?
        if (!isOwner && wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE) {
            throw new AccessDeniedException();
        }
        return new WishlistDetailsDTO(
                wishlist.getId(),
                wishlist.getName(),
                wishlist.getDescription(),
                wishlist.getPrivacyStatus(),
                wishlist.getShowBooked()
        );

    }


    @Override
    @Transactional // Гарантує, що транзакція в БД виконається коректно
    public WishlistResponseDTO createWishlist(String email, WishlistRequestDTO dto) {
        // пошук користувача за email з токена для прив'язки
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException());

        // створення нової сутності Wishlist для збереження в БД
        Wishlist wishlist = new Wishlist();
        wishlist.setName(dto.getName());
        wishlist.setDescription(dto.getDescription());
        wishlist.setUser(user); // Фізична прив'язка до поточного користувача
        wishlist.setCreatedAt(LocalDateTime.now()); // Час створення вішліста

        // Перевірка параметрів приватності (значення за замовчуванням — LINK)
        if (dto.getPrivacyStatus() == null || dto.getPrivacyStatus().isEmpty()) {
            wishlist.setPrivacyStatus(PrivacyStatus.LINK);
        } else {
            // Перетворення String у Enum безпечно
            wishlist.setPrivacyStatus(PrivacyStatus.valueOf(dto.getPrivacyStatus().toUpperCase()));
        }
        // Перевірка бронювання (значення за замовчуванням — false)
        if (dto.getShowBooked() == null) {
            wishlist.setShowBooked(false);
        } else {
            wishlist.setShowBooked(dto.getShowBooked());
        }

        //Запис даних у базу даних
        Wishlist savedWishlist = wishlistRepository.save(wishlist);

        //Формування успішної відповіді (WishlistResponseDTO) для фронтенду
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


    @Override
    @Transactional
    public WishlistResponseDTO updateWishlist(Long id, WishlistUpdateRequestDTO dto, String currentUserEmail) {

        Wishlist wishlist = wishlistRepository.findById(id)
                .orElseThrow(() -> new WishlistNotFoundException());

        if (!wishlist.getUser().getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException();
        }

        wishlist.setName(dto.getName());
        wishlist.setDescription(dto.getDescription());

        if (dto.getPrivacyStatus() != null && !dto.getPrivacyStatus().isEmpty()) {
            wishlist.setPrivacyStatus(PrivacyStatus.valueOf(dto.getPrivacyStatus().toUpperCase()));
        }

        if (dto.getShowBooked() != null) {
            wishlist.setShowBooked(dto.getShowBooked());
        }

        Wishlist updatedWishlist = wishlistRepository.save(wishlist);

        int itemCount = (int) wishRepository.countByWishlistId(updatedWishlist.getId());
        String coverImageUrl = wishRepository
                .findFirstByWishlistIdAndImageUrlIsNotNullOrderByCreatedAtAsc(updatedWishlist.getId())
                .map(wish -> wish.getImageUrl())
                .orElse(null);

        WishlistResponseDTO responseDTO = new WishlistResponseDTO();
        responseDTO.setId(updatedWishlist.getId());
        responseDTO.setName(updatedWishlist.getName());
        responseDTO.setDescription(updatedWishlist.getDescription());
        responseDTO.setPrivacyStatus(updatedWishlist.getPrivacyStatus());
        responseDTO.setShowBooked(updatedWishlist.getShowBooked());
        responseDTO.setCreatedAt(updatedWishlist.getCreatedAt());
        responseDTO.setItemCount(itemCount);
        responseDTO.setCoverImageUrl(coverImageUrl);

        return responseDTO;
    }
}