package com.dreamspace.api.entity;

import jakarta.persistence.*;
import com.dreamspace.api.enums.PrivacyStatus;
import java.time.LocalDateTime;

@Entity
@Table(name = "wishlist")
public class Wishlist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_wishlist")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "privacy_status", nullable = false)
    private PrivacyStatus privacyStatus = PrivacyStatus.LINK;

    @Column(name = "show_booked", nullable = false)
    private boolean showBooked = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Wishlist(User user, String name, String description, PrivacyStatus privacyStatus, Boolean showBooked) {
        this.user = user;
        this.name = name;
        this.description = description;
        this.privacyStatus = privacyStatus != null ? privacyStatus : PrivacyStatus.LINK;
        this.showBooked = showBooked != null ? showBooked : false;
    }

    public Wishlist() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public Boolean getShowBooked() {
        return showBooked;
    }

    public void setShowBooked(Boolean showBooked) {
        this.showBooked = showBooked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    @Override
    public String toString() {
        return "Wishlist{" +
                "id=" + id +
                ", userId=" + (user != null ? user.getId() : "null") +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", privacyStatus=" + privacyStatus +
                ", showBooked=" + showBooked +
                ", createdAt=" + createdAt +
                '}';
    }

}
