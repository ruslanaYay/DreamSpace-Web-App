package com.dreamspace.api.repository;

import com.dreamspace.api.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {


    Optional<Reservation> findByWish_Id(Long wishId);

    @Query("SELECT r FROM Reservation r JOIN r.participants p WHERE p.user.id = :userId")
    Page<Reservation> findAllByUserId(@Param("userId") Long userId, Pageable pageable);
}