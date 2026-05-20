package com.dreamspace.api.dto;

import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.enums.Priority;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class WishRequestDTO {
    private Long wishlistId;
    @NotBlank(message = "Це поле обов'язкове")
    private String name;
    private String storeLink;
    @DecimalMin(value = "0.0", message = "Значення повинне бути більше або рівне 0")
    private BigDecimal price;
    private String description;
    private String imageUrl;
    private String priority;

    public WishRequestDTO() {
    }

    public WishRequestDTO(Long wishlistId, String name, String storeLink,
                          BigDecimal price, String description, String imageUrl, String priority) {
        this.wishlistId = wishlistId;
        this.name = name;
        this.storeLink = storeLink;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.priority = priority;
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

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }
}
