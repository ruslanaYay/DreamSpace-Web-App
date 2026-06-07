package com.dreamspace.api.service;


import com.dreamspace.api.dto.*;
import com.dreamspace.api.entity.User;
import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.enums.PrivacyStatus; // Додали для роботи з енумом приватності
import com.dreamspace.api.exception.AccessDeniedException;
import com.dreamspace.api.exception.UserNotFoundException;
import com.dreamspace.api.exception.WishlistNotFoundException;
import com.dreamspace.api.repository.UserRepository;
import com.dreamspace.api.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.dreamspace.api.repository.WishRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistServiceImpl implements WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WishRepository wishRepository;

    @Override
    public PageResponseDTO<WishlistResponseDTO> getUserWishlists(String email, String query, int page, int size) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException());
        //Якщо будуть некоректні значення
        if (page < 0) {page = 0;}
        if (size <= 0) {size = 12;}
        //if (size > 12) {size = 12;}
        //об'єкт пагінації
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Wishlist> wishlistsPage;

        if(query==null || query.isEmpty()) {
            wishlistsPage = wishlistRepository.findAllByUser(user, pageable);
        }
        else{
            wishlistsPage = wishlistRepository.findAllByUserAndNameContainingIgnoreCase(user, query.trim(), pageable);
        }

        Page<WishlistResponseDTO> dtoPage = wishlistsPage.map(wishlist -> {
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
                });
        return new PageResponseDTO<>(dtoPage);
    }
    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponseDTO> getAllUserWishlists(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException());
        List<Wishlist> wishlists = wishlistRepository.findAllByUserOrderByCreatedAtDesc(user);

        return wishlists.stream().map(wishlist -> {
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
        }).collect(Collectors.toList());
    }
    @Override
    public WishlistDetailsDTO getWishlistDetails(Long id, String email){
        Wishlist wishlist = wishlistRepository.findById(id)
                .orElseThrow(() -> new WishlistNotFoundException());
        boolean isOwner = wishlist.getUser().getEmail().equals(email);
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

        wishlistRepository.findByNameAndUser(dto.getName(), user)
                .ifPresent(existingWishlist -> {
                    throw new com.dreamspace.api.exception.BadRequestException("Вішліст з такою назвою вже існує");
                });

        // створення нової сутності Wishlist для збереження в БД
        Wishlist wishlist = new Wishlist();
        wishlist.setName(dto.getName());
        wishlist.setDescription(dto.getDescription());
        wishlist.setUser(user); // Fizична прив'язка до поточного користувача
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

        var duplicateOptional = wishlistRepository.findByNameAndUser(dto.getName(), wishlist.getUser());
        if (duplicateOptional.isPresent()) {

            if (!duplicateOptional.get().getId().equals(id)) {
                throw new com.dreamspace.api.exception.BadRequestException("Вішліст з такою назвою вже існує");
            }
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

    @Override
    @Transactional
    public void deleteWishlist(Long id, String currentUserEmail) {

        Wishlist wishlist = wishlistRepository.findById(id)
                .orElseThrow(() -> new WishlistNotFoundException());


        if (!wishlist.getUser().getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException();
        }


        wishlistRepository.delete(wishlist);
    }

    @Override
    public String getShareLink(Long id, String currentUserEmail) {
        // перевірка існування вішліста
        Wishlist wishlist = wishlistRepository.findById(id)
                .orElseThrow(() -> new WishlistNotFoundException());
        // перевірка права доступу
        if (!wishlist.getUser().getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException();
        }
        // повне посилання
        String baseUrl = "http://localhost:5173/wishlist/share/";
        return baseUrl + wishlist.getShareToken();
    }
    @Override
    public WishlistResponseDTO getWishlistById(Long id) {
        Wishlist wishlist = wishlistRepository.findById(id)
                .orElseThrow(() -> new WishlistNotFoundException());

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
    }
}