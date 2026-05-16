package com.dreamspace.api.repository;

import com.dreamspace.api.entity.User;
import com.dreamspace.api.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findAllByUser(User user);
}
