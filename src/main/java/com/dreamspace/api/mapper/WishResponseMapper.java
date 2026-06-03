package com.dreamspace.api.mapper;

import com.dreamspace.api.dto.WishResponseDTO;
import com.dreamspace.api.entity.Reservation;
import com.dreamspace.api.entity.Wish;
import com.dreamspace.api.enums.ReservationType;
import com.dreamspace.api.repository.ReservationParticipantRepository;
import org.springframework.stereotype.Component;
import com.dreamspace.api.entity.ReservationParticipant;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class WishResponseMapper {
    private final ReservationParticipantRepository reservationParticipantRepository;

    public WishResponseMapper(ReservationParticipantRepository reservationParticipantRepository) {
        this.reservationParticipantRepository = reservationParticipantRepository;
    }
    public WishResponseDTO toDTO(Wish wish, Long currentUserId, boolean isOwner, boolean includeParticipants) {
        BigDecimal finalPrice = (wish.getPrice() == null || wish.getPrice().compareTo(BigDecimal.ZERO) == 0)
                ? new BigDecimal("0.00")
                : wish.getPrice();
        String finalStoreLink = (wish.getStoreLink() == null || wish.getStoreLink().trim().isEmpty())
                ? null
                : wish.getStoreLink();
        String finalDescription = (wish.getDescription() == null || wish.getDescription().trim().isEmpty())
                ? null
                : wish.getDescription();

        boolean isReserved = false;
        Long reservationId = null;
        ReservationType reservationType = null;
        boolean isCurrentUserParticipant = false;
        Integer maxParticipants = null;
        Integer currentParticipants = null;
        String initiatorEmail = null;
        List<String> participantEmails = null;

        Reservation reservation = wish.getReservation();
        if (reservation != null) {
            int actualCount = reservationParticipantRepository.countByReservationId(reservation.getId());
            if (isOwner) {
                if (wish.getWishlist().getShowBooked()) {
                    isReserved = true;
                    reservationType = reservation.getReservationType();
                    maxParticipants = reservation.getMaxParticipants();
                    currentParticipants = actualCount;
                }
            } else {
                isReserved = true;
                reservationType = reservation.getReservationType();
                maxParticipants = reservation.getMaxParticipants();
                currentParticipants = actualCount;

                if (!reservation.getParticipants().isEmpty()) {
                    final Long initiatorId = reservation.getInitiator() != null ? reservation.getInitiator().getId() : null;
                    initiatorEmail = reservation.getParticipants().stream()
                            .filter(p -> p.getUser() != null && p.getUser().getId().equals(initiatorId))
                            .map(ReservationParticipant::getEmail)
                            .findFirst()
                            .orElse(reservation.getParticipants().get(0).getEmail());
                    //якщо ініціатор вийде з бронювання, то ініціатором вважатиметься перший користувач в списку
                }
                //пошти учасників заповнюються лише на сторінці деталей для меншого навантаження
                if (includeParticipants) {
                    participantEmails = reservation.getParticipants().stream()
                            .map(ReservationParticipant::getEmail)
                            .collect(Collectors.toList());
                }
                if (currentUserId != null) {
                    boolean isParticipant = reservation.getParticipants().stream()
                            .anyMatch(p -> p.getUser() != null && p.getUser().getId().equals(currentUserId));
                    if (isParticipant) {
                        isCurrentUserParticipant = true;
                        reservationId = reservation.getId();
                    }
                }
            }
        }

        return new WishResponseDTO(
                wish.getId(),
                wish.getWishlist().getId(),
                wish.getName(),
                finalStoreLink,
                finalPrice,
                finalDescription,
                wish.getImageUrl(),
                wish.getPriority(),
                wish.getCreatedAt(),
                wish.getIsCompleted(),
                isReserved,
                reservationId,
                reservationType,
                isCurrentUserParticipant,
                maxParticipants,
                currentParticipants,
                initiatorEmail,
                participantEmails
        );
    }
}
