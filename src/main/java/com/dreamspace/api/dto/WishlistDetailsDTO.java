package com.dreamspace.api.dto;

import com.dreamspace.api.enums.PrivacyStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class WishlistDetailsDTO {
    private Long id;
    private String name;
    private String description; // Додано
    private PrivacyStatus privacyStatus;
    private boolean showBooked;
    //бажання
    private List<Object> wishes = new ArrayList<>();

    public WishlistDetailsDTO() {
    }

    public WishlistDetailsDTO(Long id, String name, String description, PrivacyStatus privacyStatus,
                              boolean showBooked) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.privacyStatus = privacyStatus;
        this.showBooked = showBooked;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public PrivacyStatus getPrivacyStatus() {
        return privacyStatus;
    }

    public void setPrivacyStatus(PrivacyStatus privacyStatus) {
        this.privacyStatus = privacyStatus;
    }

    public boolean isShowBooked() {
        return showBooked;
    }

    public void setShowBooked(boolean showBooked) {
        this.showBooked = showBooked;
    }

    public List<Object> getWishes() {
        return wishes;
    }

    public void setWishes(List<Object> wishes) {
        this.wishes = wishes;
    }
}
