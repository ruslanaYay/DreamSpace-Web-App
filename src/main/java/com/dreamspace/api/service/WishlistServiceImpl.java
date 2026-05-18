package com.dreamspace.api.service;

import com.dreamspace.api.dto.WishlistRequestDTO; // Додали новий імпорт
import com.dreamspace.api.dto.WishlistResponseDTO;
import com.dreamspace.api.entity.User;
import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.enums.PrivacyStatus; // Додали для роботи з енумом приватності
import com.dreamspace.api.exception.UserNotFoundException;
import com.dreamspace.api.repository.UserRepository;
import com.dreamspace.api.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Для безпечного запису в БД

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
        // Пошук користувача за поштою
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException());

        // Пошук вішлістів користувача
        List<Wishlist> wishlists = wishlistRepository.findAllByUser(user);

        // Формування DTO (оновили під новий конструктор, який ми створили раніше)
        return wishlists.stream()
                .map(wishlist -> new WishlistResponseDTO(
                        wishlist.getId(),
                        wishlist.getName(),
                        wishlist.getDescription(),
                        0, // itemCount тимчасово 0, поки немає бажань
                        null, // coverImageUrl тимчасово null
                        wishlist.getPrivacyStatus(),
                        wishlist.getShowBooked() != null ? wishlist.getShowBooked() : false,
                        wishlist.getCreatedAt()
                ))
                .toList();
    }

    @Override
    @Transactional // Гарантує, що транзакція в БД виконається коректно
    public WishlistResponseDTO createWishlist(String email, WishlistRequestDTO dto) {
        // 1. Автоматично шукаємо юзера за email з токена для прив'язки
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException());

        // 2. Створюємо нову сутність Wishlist для збереження в БД
        Wishlist wishlist = new Wishlist();
        wishlist.setName(dto.getName());
        wishlist.setDescription(dto.getDescription());
        wishlist.setUser(user); // Фізична прив'язка до поточного користувача!
        wishlist.setCreatedAt(LocalDateTime.now()); // Час створення вішліста

        // 3. Перевірка параметрів приватності (значення за замовчуванням — LINK)
        if (dto.getPrivacyStatus() == null || dto.getPrivacyStatus().isEmpty()) {
            wishlist.setPrivacyStatus(PrivacyStatus.LINK);
        } else {
            // Перетворюємо String від фронтенду у ваш Enum безпечно
            wishlist.setPrivacyStatus(PrivacyStatus.valueOf(dto.getPrivacyStatus().toUpperCase()));
        }

        // 4. Перевірка бронювання (значення за замовчуванням — false)
        if (dto.getShowBooked() == null) {
            wishlist.setShowBooked(false);
        } else {
            wishlist.setShowBooked(dto.getShowBooked());
        }

        // 5. Фізично записуємо дані у базу даних
        Wishlist savedWishlist = wishlistRepository.save(wishlist);

        // 6. Формуємо успішну відповідь (WishlistResponseDTO) для фронтенду
        WishlistResponseDTO responseDTO = new WishlistResponseDTO();
        responseDTO.setId(savedWishlist.getId());
        responseDTO.setName(savedWishlist.getName());
        responseDTO.setDescription(savedWishlist.getDescription());
        responseDTO.setPrivacyStatus(savedWishlist.getPrivacyStatus());
        responseDTO.setShowBooked(savedWishlist.getShowBooked());
        responseDTO.setCreatedAt(savedWishlist.getCreatedAt());
        responseDTO.setItemCount(0); // Новий вішліст завжди порожній
        responseDTO.setCoverImageUrl(null);

        return responseDTO;
    }
}