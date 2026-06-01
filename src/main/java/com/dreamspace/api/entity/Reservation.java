package com.dreamspace.api.entity;

import jakarta.persistence.*;
import com.dreamspace.api.enums.ReservationType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "reservation")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reservation")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wish_id", nullable = false, unique = true)
    private Wish wish;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiator_user_id", nullable = false)
    private User initiator;

    @Enumerated(EnumType.STRING)
    @Column(name = "reservation_type", nullable = false)
    private ReservationType reservationType;

    @Column(name = "max_participants",nullable = false)
    private Integer maxParticipants;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReservationParticipant> participants = new ArrayList<>();

    public Reservation(Wish wish, User initiator, ReservationType reservationType, Integer maxParticipants) {
        this.wish = wish;
        this.initiator = initiator;
        this.reservationType = reservationType;
        if (reservationType == ReservationType.INDIVIDUAL) {
            this.maxParticipants = 1;
        } else {
            this.maxParticipants = maxParticipants;
        }
    }

    public Reservation() {}

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public Wish getWish() { return wish; }

    public void setWish(Wish wish) { this.wish = wish; }

    public User getInitiator() { return initiator; }

    public void setInitiator(User initiator) { this.initiator = initiator; }

    public ReservationType getReservationType() { return reservationType; }

    public void setReservationType(ReservationType reservationType) { this.reservationType = reservationType; }

    public Integer getMaxParticipants() { return maxParticipants; }

    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<ReservationParticipant> getParticipants() { return participants; }

    public void setParticipants(List<ReservationParticipant> participants) { this.participants = participants; }

    @Override
    public String toString() {
        return "Reservation{" +
                "id=" + id +
                ", wishId=" + (wish != null ? wish.getId() : "null") +
                ", initiatorUserId=" + (initiator != null ? initiator.getId() : "null") +
                ", reservationType=" + reservationType +
                ", maxParticipants=" + maxParticipants +
                ", createdAt=" + createdAt +
                '}';
    }
}