package com.dreamspace.api.service;

import com.dreamspace.api.dto.WishlistResponseDTO;
import com.dreamspace.api.entity.User;
import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.exception.UserNotFoundException;
import com.dreamspace.api.repository.UserRepository;
import com.dreamspace.api.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class WishlistServiceImpl implements WishlistService{
    @Autowired
    private WishlistRepository wishlistRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public List<WishlistResponseDTO> getUserWishlists(String email){
        //пошук користувача за поштою
        User user = userRepository.findByEmail(email)
                .orElseThrow();
        //Пошук вішлістів користувача
        List<Wishlist> wishlists = wishlistRepository.findAllByUser(user);
        //формування DTO
        return wishlists.stream()
                .map(wishlist ->
                        new WishlistResponseDTO(
                                wishlist.getId(),
                                wishlist.getName(),
                                0,
                                null,
                                wishlist.getPrivacyStatus()
                        ))
                .toList();
    }

    @Override
    public void createWishlist(String email, WishlistResponseDTO dto) {
        // Тут має бути код створення, але ми робимо "заглушку",
        // щоб фронтенд отримав успішний статус 201 і не виснув:
        System.out.println("Бекенд отримав запит на створення вішліста для: " + email);
        System.out.println("Назва: " + dto.getName());
    }
}
