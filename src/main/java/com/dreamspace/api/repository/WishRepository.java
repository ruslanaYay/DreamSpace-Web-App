package com.dreamspace.api.repository;

import com.dreamspace.api.entity.User;
import com.dreamspace.api.entity.Wish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WishRepository extends JpaRepository<Wish, Long> {
}
