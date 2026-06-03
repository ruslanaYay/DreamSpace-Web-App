package com.dreamspace.api.dto;

import com.dreamspace.api.enums.ReservationType;

public class ReservationResponseDTO {
    private Long reservationId;
    private Long wishId;
    private ReservationType reservationType;
    private Integer maxParticipants;
    private Integer currentParticipants;

    public ReservationResponseDTO(Long reservationId, Long wishId, ReservationType reservationType, Integer maxParticipants, Integer currentParticipants) {
        this.reservationId = reservationId;
        this.wishId = wishId;
        this.reservationType = reservationType;
        this.maxParticipants = maxParticipants;
        this.currentParticipants = currentParticipants;
    }

    public ReservationResponseDTO() {}

    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long reservationId) { this.reservationId = reservationId; }

    public Long getWishId() { return wishId; }
    public void setWishId(Long wishId) { this.wishId = wishId; }

    public ReservationType getReservationType() { return reservationType; }
    public void setReservationType(ReservationType reservationType) { this.reservationType = reservationType; }

    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public Integer getCurrentParticipants() { return currentParticipants; }
    public void setCurrentParticipants(Integer currentParticipants) { this.currentParticipants = currentParticipants; }
}
