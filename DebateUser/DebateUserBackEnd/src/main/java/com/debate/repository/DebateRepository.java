package com.debate.repository;

import com.debate.entity.Debate;
import com.debate.entity.Debate.DebateStatus;
import com.debate.entity.Category;
import com.debate.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DebateRepository extends JpaRepository<Debate, Long> {
    Page<Debate> findByIsHiddenFalse(Pageable pageable);
    List<Debate> findByIsHiddenFalse(Sort sort);
    Page<Debate> findByIsHiddenFalseAndStatus(DebateStatus status, Pageable pageable);
    List<Debate> findByIsHiddenFalseAndStatus(DebateStatus status, Sort sort);
    Page<Debate> findByCategoryAndIsHiddenFalse(Category category, Pageable pageable);
    List<Debate> findByCategoryAndIsHiddenFalse(Category category, Sort sort);
    Page<Debate> findByCategoryAndIsHiddenFalseAndStatus(Category category, DebateStatus status, Pageable pageable);
    List<Debate> findByCategoryAndIsHiddenFalseAndStatus(Category category, DebateStatus status, Sort sort);
    Page<Debate> findByUserAndIsHiddenFalse(User user, Pageable pageable);
    List<Debate> findByUserAndIsHiddenFalse(User user, Sort sort);
    Page<Debate> findByStatusAndIsHiddenFalse(DebateStatus status, Pageable pageable);
    
    @Query("SELECT d FROM Debate d WHERE d.isHidden = false AND " +
           "(:keyword IS NULL OR :keyword = '' OR d.title LIKE %:keyword% OR d.content LIKE %:keyword%) AND " +
           "(:category IS NULL OR d.category = :category) AND " +
           "(:status IS NULL OR d.status = :status)")
    Page<Debate> searchByKeyword(@Param("keyword") String keyword,
                                @Param("category") Category category,
                                @Param("status") DebateStatus status,
                                Pageable pageable);
    
    @Query("SELECT d FROM Debate d WHERE d.isHidden = false AND " +
           "(:keyword IS NULL OR :keyword = '' OR d.title LIKE %:keyword% OR d.content LIKE %:keyword%) AND " +
           "(:category IS NULL OR d.category = :category) AND " +
           "(:status IS NULL OR d.status = :status)")
    List<Debate> searchByKeywordWithoutPaging(@Param("keyword") String keyword,
                                             @Param("category") Category category,
                                             @Param("status") DebateStatus status,
                                             Sort sort);
    
    List<Debate> findByStatusAndStartDateLessThanEqual(DebateStatus status, LocalDateTime now);
    List<Debate> findByStatusAndEndDateLessThanEqual(DebateStatus status, LocalDateTime now);
    
    @Query("SELECT d FROM Debate d WHERE d.isHidden = false ORDER BY d.viewCount DESC")
    List<Debate> findTopByOrderByViewCountDesc(Pageable pageable);
}

