package com.dreamspace.api.repository;

import com.dreamspace.api.entity.User;
import com.dreamspace.api.entity.Wish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WishRepository extends JpaRepository<Wish, Long> {
    // рахує кількість бажань у конкретному вішлісті
    long countByWishlistId(Long wishlistId);

    // знаходить найперше бажання з картинкою у конкретному вішлісті
    Optional<Wish> findFirstByWishlistIdAndImageUrlIsNotNullOrderByCreatedAtAsc(Long wishlistId);
}
