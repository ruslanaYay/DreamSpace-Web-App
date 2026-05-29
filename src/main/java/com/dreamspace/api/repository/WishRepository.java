package com.dreamspace.api.repository;

import com.dreamspace.api.entity.User;
import com.dreamspace.api.entity.Wish;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishRepository extends JpaRepository<Wish, Long> {
    // рахує кількість бажань у конкретному вішлісті
    long countByWishlistId(Long wishlistId);

    // знаходить найперше бажання з картинкою у конкретному вішлісті
    Optional<Wish> findFirstByWishlistIdAndImageUrlIsNotNullOrderByCreatedAtAsc(Long wishlistId);
    //отримує бажання, пов'язані з вішлістом, і сортує їх
    Page<Wish> findAllByWishlist_Id(Long wishlistId, Pageable pageable);
}
