package com.dreamspace.api.dto;

import com.dreamspace.api.enums.PrivacyStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class WishlistResponseDTO {
    private Long id;
    private String name;
    private String description; // Додано
    private int itemCount;
    private String coverImageUrl;
    private PrivacyStatus privacyStatus;
    private boolean showBooked;
    private LocalDateTime createdAt;

    public WishlistResponseDTO() {
    }

    public WishlistResponseDTO(Long id, String name, String description, int itemCount,
                               String coverImageUrl, PrivacyStatus privacyStatus,
                               boolean showBooked, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.itemCount = itemCount;
        this.coverImageUrl = coverImageUrl;
        this.privacyStatus = privacyStatus;
        this.showBooked = showBooked;
        this.createdAt = createdAt;
    }

    //Гетери
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getItemCount() { return itemCount; }
    public String getCoverImageUrl() { return coverImageUrl; }
    public PrivacyStatus getPrivacyStatus() { return privacyStatus; }
    public boolean isShowBooked() { return showBooked; }
    public LocalDateTime getCreatedAt() { return createdAt; }


    // Сетери
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setItemCount(int itemCount) { this.itemCount = itemCount; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    public void setPrivacyStatus(PrivacyStatus privacyStatus) { this.privacyStatus = privacyStatus; }
    public void setShowBooked(boolean showBooked) { this.showBooked = showBooked; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

}