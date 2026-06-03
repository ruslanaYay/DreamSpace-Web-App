package com.dreamspace.api.dto;

import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.enums.Priority;
import com.dreamspace.api.enums.ReservationType;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class WishResponseDTO {
    private Long id;
    private Long wishlistId;
    private String name;
    private String storeLink;
    private BigDecimal price;
    private String description;
    private String imageUrl;
    private Priority priority;
    private LocalDateTime createdAt;
    private boolean isCompleted;
    private boolean isReserved;
    private Long reservationId;
    private ReservationType reservationType;
    private boolean isCurrentUserParticipant;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private String initiatorEmail;
    private List<String> participantEmails;

    public WishResponseDTO() {
    }

    public WishResponseDTO(Long id, Long wishlistId, String name, String storeLink, BigDecimal price,
                           String description, String imageUrl, Priority priority, LocalDateTime createdAt, boolean isCompleted,
                           boolean isReserved, Long reservationId, ReservationType reservationType, boolean isCurrentUserParticipant,
                           Integer maxParticipants, Integer currentParticipants, String initiatorEmail, List<String> participantEmails) {
        this.id = id;
        this.wishlistId = wishlistId;
        this.name = name;
        this.storeLink = storeLink;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.priority = priority;
        this.createdAt = createdAt;
        this.isCompleted = isCompleted;
        this.isReserved = isReserved;
        this.reservationId = reservationId;
        this.reservationType = reservationType;
        this.isCurrentUserParticipant = isCurrentUserParticipant;
        this.maxParticipants = maxParticipants;
        this.currentParticipants = currentParticipants;
        this.initiatorEmail = initiatorEmail;
        this.participantEmails = participantEmails;
    }
    public WishResponseDTO(Long id, Long wishlistId, String name, String storeLink, BigDecimal price,
                           String description, String imageUrl, Priority priority, LocalDateTime createdAt, boolean isCompleted) {
        this.id = id;
        this.wishlistId = wishlistId;
        this.name = name;
        this.storeLink = storeLink;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.priority = priority;
        this.createdAt = createdAt;
        this.isCompleted = isCompleted;
        this.isReserved = false;
        this.reservationId = null;
        this.reservationType = null;
        this.isCurrentUserParticipant = false;
        this.maxParticipants = null;
        this.currentParticipants = null;
        this.initiatorEmail = null;
        this.participantEmails = null;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWishlistId() {
        return wishlistId;
    }

    public void setWishlistId(Long wishlistId) {
        this.wishlistId = wishlistId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStoreLink() {
        return storeLink;
    }

    public void setStoreLink(String storeLink) {
        this.storeLink = storeLink;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean getIsCompleted() {return isCompleted;}

    public void setCompleted(boolean completed) {this.isCompleted = completed;}

    public boolean getIsReserved() {
        return isReserved;
    }

    public void setReserved(boolean reserved) {
        isReserved = reserved;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public ReservationType getReservationType() {
        return reservationType;
    }

    public void setReservationType(ReservationType reservationType) {
        this.reservationType = reservationType;
    }

    public boolean getIsCurrentUserParticipant() {
        return isCurrentUserParticipant;
    }

    public void setCurrentUserParticipant(boolean currentUserParticipant) {
        isCurrentUserParticipant = currentUserParticipant;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public Integer getCurrentParticipants() {
        return currentParticipants;
    }

    public void setCurrentParticipants(Integer currentParticipants) {
        this.currentParticipants = currentParticipants;
    }

    public String getInitiatorEmail() {
        return initiatorEmail;
    }

    public void setInitiatorEmail(String initiatorEmail) {
        this.initiatorEmail = initiatorEmail;
    }

    public List<String> getParticipantEmails() {
        return participantEmails;
    }

    public void setParticipantEmails(List<String> participantEmails) {
        this.participantEmails = participantEmails;
    }
}
