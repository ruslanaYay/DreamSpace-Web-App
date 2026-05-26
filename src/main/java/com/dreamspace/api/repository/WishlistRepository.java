package com.dreamspace.api.repository;

import com.dreamspace.api.entity.User;
import com.dreamspace.api.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findAllByUser(User user);
    Optional<Wishlist> findById(Long id);
    // пошуку за частковим збігом назви без урахування регістру
    List<Wishlist> findAllByUserAndNameContainingIgnoreCase(User user, String name);
}
