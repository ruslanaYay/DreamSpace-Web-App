package com.dreamspace.api.service;

import com.dreamspace.api.dto.*;
import com.dreamspace.api.entity.Wish;
import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.entity.Reservation;
import com.dreamspace.api.entity.ReservationParticipant;
import com.dreamspace.api.entity.User;
import com.dreamspace.api.enums.PrivacyStatus;
import com.dreamspace.api.exception.AccessDeniedException;
import com.dreamspace.api.exception.WishNotFoundException;
import com.dreamspace.api.exception.WishlistNotFoundException;
import com.dreamspace.api.exception.BadRequestException;
import com.dreamspace.api.exception.UserNotFoundException;
import com.dreamspace.api.repository.UserRepository;
import com.dreamspace.api.repository.WishRepository;
import com.dreamspace.api.repository.WishlistRepository;
import com.dreamspace.api.repository.ReservationParticipantRepository;
import com.dreamspace.api.repository.ReservationRepository;
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

    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationParticipantRepository reservationParticipantRepository;

    public WishlistShareService(WishlistRepository wishlistRepository,
                                WishlistService wishlistService,
                                WishRepository wishRepository,
                                UserRepository userRepository,
                                ReservationRepository reservationRepository,
                                ReservationParticipantRepository reservationParticipantRepository) {
        this.wishlistRepository = wishlistRepository;
        this.wishlistService = wishlistService;
        this.wishRepository = wishRepository;
        this.userRepository = userRepository;
        this.reservationRepository = reservationRepository;
        this.reservationParticipantRepository = reservationParticipantRepository;
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
        if (size <= 0) {size = 15;}
        if (size > 15) {size = 15;}

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
    public SharedWishResponseDTO getSharedWishDetails(String shareToken, Long id){
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
        WishResponseDTO dto=new WishResponseDTO(
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
        return new SharedWishResponseDTO(dto, isOwner);
    }

    @Transactional
    public ReservationResponseDTO reserveWish(String shareToken, Long wishId, ReservationRequestDTO requestDto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
            throw new AccessDeniedException("Увійдіть в обліковий запис");
        }

        String currentEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new UserNotFoundException());

        // Перевірка існування бажання та відповідності токену
        Wish wish = wishRepository.findById(wishId)
                .orElseThrow(() -> new WishNotFoundException());

        Wishlist wishlist = wish.getWishlist();

        if (!wishlist.getShareToken().equals(shareToken)) {
            throw new WishNotFoundException();
        }

        boolean isOwner = wishlist.getUser() != null && wishlist.getUser().getId().equals(currentUser.getId());

        // Перевірка приватності вішліста
        if (wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE && !isOwner) {
            throw new AccessDeniedException("Доступ заборонено");
        }

        // Перевірка чи поточний користувач не є власником
        if (isOwner) {
            throw new BadRequestException("Ви не можете забронювати це бажання");
        }

        // Перевірка статусу бажання
        if (wish.getIsCompleted() || wish.getReservation() != null) {
            throw new BadRequestException("Ви не можете забронювати це бажання");
        }

        // Створення запису в таблиці reservation
        Reservation reservation = new Reservation(
                wish,
                currentUser,
                requestDto.getReservationType(),
                requestDto.getMaxParticipants()
        );
        reservation = reservationRepository.save(reservation);

        // Створення запису в таблиці reservation_participant
        ReservationParticipant participant = new ReservationParticipant(
                reservation,
                currentUser,
                currentUser.getEmail()
        );
        reservationParticipantRepository.save(participant);

        return new ReservationResponseDTO(
                reservation.getId(),
                wish.getId(),
                reservation.getReservationType(),
                reservation.getMaxParticipants(),
                1
        );
    }

}