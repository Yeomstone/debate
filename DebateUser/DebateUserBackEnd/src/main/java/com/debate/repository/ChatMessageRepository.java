package com.debate.repository;

import com.debate.entity.Debate;
import com.debate.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findByDebateOrderByCreatedAtDesc(Debate debate, Pageable pageable);
    List<ChatMessage> findByDebateAndCreatedAtAfter(Debate debate, LocalDateTime after);
}

