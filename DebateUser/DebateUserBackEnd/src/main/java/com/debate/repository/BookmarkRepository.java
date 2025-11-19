package com.debate.repository;

import com.debate.entity.Debate;
import com.debate.entity.Bookmark;
import com.debate.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Optional<Bookmark> findByDebateAndUser(Debate debate, User user);
    boolean existsByDebateAndUser(Debate debate, User user);
    Page<Bookmark> findByUser(User user, Pageable pageable);
}

