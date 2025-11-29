package com.debate.repository;

import com.debate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {//debate 테이블 담당 레파짓토리
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    // [추가] 닉네임 중복 확인용 메서드
    boolean existsByNickname(String nickname);
}

