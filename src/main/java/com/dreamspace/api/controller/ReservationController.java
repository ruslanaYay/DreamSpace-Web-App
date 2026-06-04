package com.dreamspace.api.controller;

import com.dreamspace.api.dto.ReservationResponseDTO;
import com.dreamspace.api.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @DeleteMapping("/{reservationId}/leave")
    public ResponseEntity<ReservationResponseDTO> leaveReservation(@PathVariable Long reservationId) {
        ReservationResponseDTO response = reservationService.leaveReservation(reservationId);
        return ResponseEntity.ok(response);
    }
}
