package com.debate.repository;

import com.debate.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 회원(User) 리포지토리.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /** 이메일로 회원 조회 */
    Optional<User> findByEmail(String email);

    /** 이메일 중복 여부 검사 */
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "u.email LIKE %:keyword% OR u.nickname LIKE %:keyword%) " +
           "AND (:status IS NULL OR u.status = :status)")
    /** 키워드와 상태 조건을 포함한 회원 검색 */
    Page<User> searchUsers(@Param("keyword") String keyword, 
                          @Param("status") User.UserStatus status, 
                          Pageable pageable);
}

