package com.dreamspace.api.dto;

import com.dreamspace.api.enums.ReservationType;

public class ReservationRequestDTO {
    private ReservationType reservationType;
    private Integer maxParticipants;
    private String email;

    public ReservationRequestDTO() {}

    public ReservationType getReservationType() { return reservationType; }
    public void setReservationType(ReservationType reservationType) { this.reservationType = reservationType; }

    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
