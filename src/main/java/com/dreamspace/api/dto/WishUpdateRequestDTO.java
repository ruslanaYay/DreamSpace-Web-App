package com.dreamspace.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class WishUpdateRequestDTO {
    @NotBlank(message = "Це поле обов'язкове")
    private String name;
    private String storeLink;
    @DecimalMin(value = "0.0", message = "Значення повинне бути більше або рівне 0")
    private BigDecimal price;
    private String description;
    private String imageUrl;
    private String priority;

    public WishUpdateRequestDTO() {
    }

    public WishUpdateRequestDTO(String name, String storeLink,
                          BigDecimal price, String description, String imageUrl, String priority) {
        this.name = name;
        this.storeLink = storeLink;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.priority = priority;
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
