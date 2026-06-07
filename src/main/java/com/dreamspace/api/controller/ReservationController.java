package com.dreamspace.api.controller;

import com.dreamspace.api.dto.ReservationResponseDTO;
import com.dreamspace.api.service.ReservationService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long reservationId) {
        reservationService.cancelReservation(reservationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    public ResponseEntity<Page<ReservationResponseDTO>> getMyReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size) {

        Page<ReservationResponseDTO> response = reservationService.getMyReservations(page, size);

        return ResponseEntity.ok(response);
    }
}