package com.dreamspace.api.entity;

import jakarta.persistence.*;
import com.dreamspace.api.enums.ReservationType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "reservation_participant",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_reservation_user",
                        columnNames = {"reservation_id", "user_id"}
                )
        }
)

public class ReservationParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_participant")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "email", length = 255, nullable = false)
    private String email;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    public ReservationParticipant(Reservation reservation, User user, String email) {
        this.reservation = reservation;
        this.user = user;
        this.email = email;
    }

    public ReservationParticipant() {}

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public Reservation getReservation() { return reservation; }

    public void setReservation(Reservation reservation) { this.reservation = reservation; }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public LocalDateTime getJoinedAt() { return joinedAt; }

    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    @Override
    public String toString() {
        return "ReservationParticipant{" +
                "id=" + id +
                ", reservationId=" + (reservation != null ? reservation.getId() : "null") +
                ", userId=" + (user != null ? user.getId() : "null") +
                ", email='" + email + '\'' +
                ", joinedAt=" + joinedAt +
                '}';
    }
}
