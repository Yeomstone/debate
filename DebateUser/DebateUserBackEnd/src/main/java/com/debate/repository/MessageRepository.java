package com.debate.repository;

import com.debate.entity.Message;
import com.debate.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // 받은 쪽지 목록 조회
    Page<Message> findByReceiverOrderByCreatedAtDesc(User receiver, Pageable pageable);
    
    // 보낸 쪽지 목록 조회
    Page<Message> findBySenderOrderByCreatedAtDesc(User sender, Pageable pageable);
    
    // 안 읽은 쪽지 개수
    long countByReceiverAndIsReadFalse(User receiver);
}
