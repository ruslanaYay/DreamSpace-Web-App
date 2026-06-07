package com.dreamspace.api.dto;

import com.dreamspace.api.enums.ReservationType;

public class ReservationResponseDTO {
    private Long reservationId;
    private Long wishId;
    private String wishName;
    private String imageUrl;
    private String wishlistName;

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

    public ReservationResponseDTO(Long reservationId, Long wishId, String wishName, String imageUrl,
                                  String wishlistName, ReservationType reservationType,
                                  Integer maxParticipants, Integer currentParticipants) {
        this.reservationId = reservationId;
        this.wishId = wishId;
        this.wishName = wishName;
        this.imageUrl = imageUrl;
        this.wishlistName = wishlistName;
        this.reservationType = reservationType;
        this.maxParticipants = maxParticipants;
        this.currentParticipants = currentParticipants;
    }

    public ReservationResponseDTO() {}

    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long reservationId) { this.reservationId = reservationId; }

    public Long getWishId() { return wishId; }
    public void setWishId(Long wishId) { this.wishId = wishId; }

    public String getWishName() { return wishName; }
    public void setWishName(String wishName) { this.wishName = wishName; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getWishlistName() { return wishlistName; }
    public void setWishlistName(String wishlistName) { this.wishlistName = wishlistName; }

    public ReservationType getReservationType() { return reservationType; }
    public void setReservationType(ReservationType reservationType) { this.reservationType = reservationType; }

    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public Integer getCurrentParticipants() { return currentParticipants; }
    public void setCurrentParticipants(Integer currentParticipants) { this.currentParticipants = currentParticipants; }
}