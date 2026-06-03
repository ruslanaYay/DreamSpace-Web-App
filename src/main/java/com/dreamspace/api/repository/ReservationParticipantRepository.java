package com.dreamspace.api.repository;

import com.dreamspace.api.entity.ReservationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationParticipantRepository extends JpaRepository<ReservationParticipant, Long> {
}
