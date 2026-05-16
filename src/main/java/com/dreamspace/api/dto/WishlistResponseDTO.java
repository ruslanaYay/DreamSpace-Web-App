package com.dreamspace.api.dto;

import com.dreamspace.api.enums.PrivacyStatus;

public class WishlistResponseDTO {
    private Long id;
    private String name;
    private int itemCount;
    private String coverImageUrl;
    private PrivacyStatus privacyStatus;
//конструктор
    public WishlistResponseDTO(Long id, String name, int itemCount, String coverImageUrl, PrivacyStatus privacyStatus) {
        this.id = id;
        this.name = name;
        this.itemCount = itemCount;
        this.coverImageUrl = coverImageUrl;
        this.privacyStatus = privacyStatus;
    }
//гетери
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getItemCount() {
        return itemCount;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public PrivacyStatus getPrivacyStatus() {
        return privacyStatus;
    }
}
