package com.dreamspace.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import com.dreamspace.api.enums.Priority;

@Entity
@Table(name = "wish")
public class Wish {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_wish")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wishlist_id", nullable = false)
    private Wishlist wishlist;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "store_link", length = 2048)
    private String storeLink;

    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 2048)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority = Priority.HIGH;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_completed", nullable = false)
    private boolean isCompleted = false;

    @OneToOne(mappedBy = "wish", cascade = CascadeType.REMOVE, fetch = FetchType.LAZY)
    private Reservation reservation;

    public Wish() {}

    public Wish(Wishlist wishlist, String name, String storeLink, BigDecimal price,
                String description, String imageUrl, Priority priority) {
        this.wishlist = wishlist;
        this.name = name;
        this.storeLink = storeLink;
        this.price = price != null ? price : BigDecimal.ZERO;
        this.description = description;
        this.imageUrl = imageUrl;
        this.priority = priority != null ? priority : Priority.HIGH;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Wishlist getWishlist() {
        return wishlist;
    }

    public void setWishlist(Wishlist wishlist) {
        this.wishlist = wishlist;
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

    public boolean getIsCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        this.isCompleted = completed;
    }

    public Reservation getReservation() { return reservation; }
    public void setReservation(Reservation reservation) { this.reservation = reservation; }

    @Override
    public String toString() {
        return "Wish{" +
                "id=" + id +
                ", wishlistId=" + (wishlist != null ? wishlist.getId() : "null") +
                ", name='" + name + '\'' +
                ", storeLink='" + storeLink + '\'' +
                ", price=" + price +
                ", description='" + description + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", priority=" + priority +
                ", createdAt=" + createdAt +
                ", isCompleted=" + isCompleted +
                '}';
    }
}
