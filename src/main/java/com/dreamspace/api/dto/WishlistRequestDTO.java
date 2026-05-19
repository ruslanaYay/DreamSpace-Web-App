package com.dreamspace.api.dto;

import jakarta.validation.constraints.NotBlank;

public class WishlistRequestDTO {

    @NotBlank(message = "Це поле обов’язкове")
    private String name;

    private String description;

    private String privacyStatus;

    private Boolean showBooked;


    public WishlistRequestDTO() {
    }


    public WishlistRequestDTO(String name, String description, String privacyStatus, Boolean showBooked) {
        this.name = name;
        this.description = description;
        this.privacyStatus = privacyStatus;
        this.showBooked = showBooked;
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

    public String getPrivacyStatus() {
        return privacyStatus;
    }

    public void setPrivacyStatus(String privacyStatus) {
        this.privacyStatus = privacyStatus;
    }

    public Boolean getShowBooked() {
        return showBooked;
    }

    public void setShowBooked(Boolean showBooked) {
        this.showBooked = showBooked;
    }
}