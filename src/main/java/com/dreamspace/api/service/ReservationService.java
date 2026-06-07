package com.dreamspace.api.service;

import com.dreamspace.api.dto.ReservationResponseDTO;
import com.dreamspace.api.dto.WishResponseDTO;
import com.dreamspace.api.entity.*;
import com.dreamspace.api.enums.PrivacyStatus;
import com.dreamspace.api.enums.ReservationType;
import com.dreamspace.api.exception.*;
import com.dreamspace.api.repository.ReservationRepository;
import com.dreamspace.api.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.dreamspace.api.mapper.WishResponseMapper;

@Service
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final WishResponseMapper wishResponseMapper;

    public ReservationService(ReservationRepository reservationRepository, UserRepository userRepository, WishResponseMapper wishResponseMapper) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.wishResponseMapper = wishResponseMapper;
    }

    @Transactional
    public ReservationResponseDTO leaveReservation(Long reservationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
            throw new AccessDeniedException("Увійдіть в обліковий запис");
        }

        String currentEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new UserNotFoundException());

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ReservationNotFoundException("Бронювання не знайдено"));

        if (reservation.getReservationType() != ReservationType.GROUP) {
            throw new BadRequestException("Ця дія доступна лише для спільних бронювань");
        }

        // Пошук поточного користувача серед учасників
        ReservationParticipant participantToRemove = null;
        for (ReservationParticipant participant : reservation.getParticipants()) {
            if (participant.getUser().getId().equals(currentUser.getId())) {
                participantToRemove = participant;
                break;
            }
        }

        if (participantToRemove == null) {
            throw new AccessDeniedException("Доступ заборонено");
        }

        Long wishId = reservation.getWish().getId();

        reservation.getParticipants().remove(participantToRemove);
        int remainingParticipants = reservation.getParticipants().size();

        if (remainingParticipants == 0) {
            reservationRepository.delete(reservation);

            return new ReservationResponseDTO(null, wishId, null, null, null);
        } else {
            reservationRepository.save(reservation);

            return new ReservationResponseDTO(
                    reservation.getId(),
                    wishId,
                    reservation.getReservationType(),
                    reservation.getMaxParticipants(),
                    remainingParticipants
            );
        }
    }
    @Transactional
    public void cancelReservation(Long reservationId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
            throw new AccessDeniedException("Увійдіть в обліковий запис"); // Поверне 401/403 (залежно від налаштувань)
        }


        String currentEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new UserNotFoundException());


        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ReservationNotFoundException("Бронювання не знайдено"));


        if (!reservation.getInitiator().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Доступ заборонено"); // Поверне 403 Forbidden
        }

        reservationRepository.delete(reservation);
    }
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ReservationResponseDTO> getMyReservations(int page, int size) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
            throw new AccessDeniedException("Увійдіть в обліковий запис");
        }

        String currentEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new UserNotFoundException());

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        org.springframework.data.domain.Page<Reservation> reservationPage =
                reservationRepository.findAllByUserId(currentUser.getId(), pageable);

        return reservationPage.map(reservation -> {

            int currentParticipantsCount = reservation.getParticipants().size();

            var wish = reservation.getWish();

            var wishlist = wish.getWishlist();

            return new ReservationResponseDTO(
                    reservation.getId(),
                    wish.getId(),
                    wish.getName(),       // назва бажання
                    wish.getImageUrl(),   // картинка бажання
                    wishlist.getName(),   // назва списку бажань (вішліста)
                    reservation.getReservationType(),
                    reservation.getMaxParticipants(),
                    currentParticipantsCount
            );
        });
    }
    public WishResponseDTO getReservedWishDetails(Long wishId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new UserNotFoundException());

        Reservation reservation = reservationRepository.findByWish_Id(wishId)
                .orElseThrow(() -> new ReservationNotFoundException("Бронювання не знайдено"));
        boolean isParticipant = reservation.getParticipants().stream()
                .anyMatch(p -> p.getUser() != null && p.getUser().getId().equals(currentUser.getId()));
        if (!isParticipant) {
            throw new AccessDeniedException("Доступ заборонено");
        }

        Wish wish = reservation.getWish();
        Wishlist wishlist = wish.getWishlist();
        boolean isOwner = wishlist.getUser().getEmail().equals(currentEmail);
        return wishResponseMapper.toDTO(wish, currentUser.getId(), isOwner, true);
    }
}
