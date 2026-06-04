package com.dreamspace.api.repository;

import com.dreamspace.api.entity.User;
import com.dreamspace.api.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Page<Wishlist> findAllByUser(User user, Pageable pageable);
    Optional<Wishlist> findById(Long id);
    // пошуку за частковим збігом назви без урахування регістру
    Page<Wishlist> findAllByUserAndNameContainingIgnoreCase(User user, String name, Pageable pageable);
    Optional<Wishlist> findByShareToken(String shareToken);
    List<Wishlist> findAllByUserOrderByCreatedAtDesc(User user);
}
