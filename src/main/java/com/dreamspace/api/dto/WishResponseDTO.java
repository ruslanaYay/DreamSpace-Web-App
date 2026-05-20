package com.dreamspace.api.dto;

import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.enums.Priority;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WishResponseDTO {
    private Long id;
    private Wishlist wishlist;//треба тут це поле?
    private String name;
    private String storeLink;
    private BigDecimal price;
    private String description;
    private String imageUrl;
    private Priority priority;
    private LocalDateTime createdAt; //чому в геміні цього поля немає?

    public WishResponseDTO() {
    }

    public WishResponseDTO(Long id, Wishlist wishlist, String name, String storeLink,
                           BigDecimal price, String description, String imageUrl, Priority priority,
                           LocalDateTime createdAt) {
        this.id = id;
        this.wishlist = wishlist;
        this.name = name;
        this.storeLink = storeLink;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.priority = priority;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Wishlist getWishlist() {
        return wishlist;
    }

    public String getName() {
        return name;
    }

    public String getStoreLink() {
        return storeLink;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getDescription() {
        return description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Priority getPriority() {
        return priority;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

}
