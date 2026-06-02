package com.dreamspace.api.mapper;

import com.dreamspace.api.dto.WishResponseDTO;
import com.dreamspace.api.entity.Reservation;
import com.dreamspace.api.entity.Wish;
import com.dreamspace.api.enums.ReservationType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class WishResponseMapper {
    public WishResponseDTO toDTO(Wish wish, Long currentUserId, boolean isOwner) {
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

        Reservation reservation = wish.getReservation();
        if (reservation != null) {
            if (isOwner) {
                if (wish.getWishlist().getShowBooked()) {
                    isReserved = true;
                    reservationType = reservation.getReservationType();
                }
            } else {
                isReserved = true;
                reservationType = reservation.getReservationType();

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
                isCurrentUserParticipant
        );
    }
}
