package com.dreamspace.api.service;

import com.dreamspace.api.dto.ReservationResponseDTO;
import com.dreamspace.api.entity.Reservation;
import com.dreamspace.api.entity.ReservationParticipant;
import com.dreamspace.api.entity.User;
import com.dreamspace.api.enums.ReservationType;
import com.dreamspace.api.exception.AccessDeniedException;
import com.dreamspace.api.exception.BadRequestException;
import com.dreamspace.api.exception.ReservationNotFoundException;
import com.dreamspace.api.exception.UserNotFoundException;
import com.dreamspace.api.repository.ReservationRepository;
import com.dreamspace.api.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public ReservationService(ReservationRepository reservationRepository, UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
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
}
