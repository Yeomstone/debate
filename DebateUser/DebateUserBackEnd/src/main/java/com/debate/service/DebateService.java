package com.debate.service;

import com.debate.dto.request.CreateDebateRequest;
import com.debate.dto.request.UpdateDebateRequest;
import com.debate.dto.response.DebateResponse;
import com.debate.entity.Debate;
import com.debate.entity.Category;
import com.debate.entity.User;
import com.debate.exception.BadRequestException;
import com.debate.exception.ResourceNotFoundException;
import com.debate.exception.UnauthorizedException;
import com.debate.repository.DebateRepository;
import com.debate.repository.CategoryRepository;
import com.debate.repository.CommentRepository;
import com.debate.repository.LikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 토론(Debate) 관련 비즈니스 로직을 처리하는 서비스 클래스
 */
@Service
@RequiredArgsConstructor
public class DebateService {
    private final DebateRepository debateRepository;           // 토론 데이터 접근 리포지토리
    private final CategoryRepository categoryRepository;   // 카테고리 데이터 접근 리포지토리
    private final LikeRepository likeRepository;           // 좋아요 데이터 접근 리포지토리
    private final CommentRepository commentRepository;     // 댓글 데이터 접근 리포지토리

    /**
     * 새로운 토론 생성
     * 
     * @param request 토론 생성 요청 데이터
     * @param userId 작성자 사용자 ID
     * @return 생성된 토론 응답 DTO
     * @throws ResourceNotFoundException 카테고리를 찾을 수 없는 경우
     * @throws BadRequestException 날짜 검증 실패 시
     */
    @Transactional
    public DebateResponse createDebate(CreateDebateRequest request, Long userId) {
        // 작성자 사용자 엔티티 생성
        User user = new User();
        user.setId(userId);

        // 카테고리 조회 및 검증
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("카테고리를 찾을 수 없습니다"));

        // 날짜 검증: 시작일시는 종료일시보다 이전이어야 함
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("시작일시는 종료일시보다 이전이어야 합니다");
        }

        // 날짜 검증: 시작일시는 현재 시간보다 이후여야 함
        if (request.getStartDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("시작일시는 현재 시간보다 이후여야 합니다");
        }

        // 토론 엔티티 생성
        Debate debate = Debate.builder()
                .user(user)                                    // 작성자
                .category(category)                            // 카테고리
                .title(request.getTitle())                     // 제목
                .content(request.getContent())                 // 내용
                .startDate(request.getStartDate())            // 시작일시
                .endDate(request.getEndDate())                // 종료일시
                .status(Debate.DebateStatus.SCHEDULED)            // 상태: 예정
                .isHidden(false)                               // 숨김 처리: false
                .viewCount(0)                                   // 조회수: 0
                .build();

        // 토론 저장
        debate = debateRepository.save(debate);
        
        // 응답 DTO 생성 (좋아요 수, 댓글 수는 0으로 초기화)
        return DebateResponse.from(debate, 0L, 0L);
    }

    /**
     * 토론 ID로 토론 상세 정보 조회
     * 조회 시 조회수가 자동으로 증가합니다.
     * 
     * @param id 토론 ID
     * @return 토론 상세 정보 (좋아요 수, 댓글 수 포함)
     * @throws ResourceNotFoundException 토론을 찾을 수 없거나 숨김 처리된 경우
     */
    public DebateResponse getDebateById(Long id) {
        // 토론 조회
        Debate debate = debateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("토론을 찾을 수 없습니다"));

        // 숨김 처리된 토론인지 확인
        if (debate.getIsHidden()) {
            throw new ResourceNotFoundException("토론을 찾을 수 없습니다");
        }

        // 조회수 증가
        debate.setViewCount(debate.getViewCount() + 1);
        debateRepository.save(debate);

        // 좋아요 수 조회
        Long likeCount = likeRepository.countByDebate(debate);
        
        // 댓글 수 조회 (숨김 처리되지 않은 댓글만)
        Long commentCount = commentRepository.countByDebateAndIsHiddenFalse(debate);

        // 응답 DTO 생성
        return DebateResponse.from(debate, likeCount, commentCount);
    }

    /**
     * 전체 토론 목록 조회 (페이징)
     * 숨김 처리되지 않은 토론만 조회합니다.
     * 
     * @param pageable 페이징 정보
     * @param sort 정렬 기준 (latest, popular, comments, views)
     * @param status 토론 상태 (선택적: SCHEDULED, ACTIVE, ENDED)
     * @return 토론 목록 (좋아요 수, 댓글 수 포함)
     */
    public Page<DebateResponse> getAllDebates(Pageable pageable, String sort, Debate.DebateStatus status) {
        // 정렬 기준에 따라 Pageable 수정
        Pageable sortedPageable = getSortedPageable(pageable, sort);
        
        // 정렬 기준이 popular 또는 comments인 경우, 모든 데이터를 가져와서 정렬 후 페이징
        if ("popular".equals(sort) || "comments".equals(sort)) {
            // 모든 데이터 가져오기 (페이징 없이)
            List<Debate> allDebates;
            if (status != null) {
                allDebates = debateRepository.findByIsHiddenFalseAndStatus(status, Sort.by(Sort.Direction.DESC, "createdAt"));
            } else {
                allDebates = debateRepository.findByIsHiddenFalse(Sort.by(Sort.Direction.DESC, "createdAt"));
            }
            
            List<DebateResponse> allDebateResponses = allDebates.stream()
                    .map(debate -> {
                        Long likeCount = likeRepository.countByDebate(debate);
                        Long commentCount = commentRepository.countByDebateAndIsHiddenFalse(debate);
                        return DebateResponse.from(debate, likeCount, commentCount);
                    })
                    .collect(Collectors.toList());
            
            // 정렬 기준에 따라 정렬
            if ("popular".equals(sort)) {
                allDebateResponses.sort(Comparator
                        .comparing((DebateResponse d) -> d.getLikeCount() != null ? d.getLikeCount() : 0L, Comparator.reverseOrder())
                        .thenComparing((DebateResponse d) -> d.getCreatedAt() != null ? d.getCreatedAt() : LocalDateTime.MIN, Comparator.reverseOrder()));
            } else if ("comments".equals(sort)) {
                allDebateResponses.sort(Comparator
                        .comparing((DebateResponse d) -> d.getCommentCount() != null ? d.getCommentCount() : 0L, Comparator.reverseOrder())
                        .thenComparing((DebateResponse d) -> d.getCreatedAt() != null ? d.getCreatedAt() : LocalDateTime.MIN, Comparator.reverseOrder()));
            }
            
            // 페이징 적용
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), allDebateResponses.size());
            List<DebateResponse> pagedDebates = allDebateResponses.subList(start, end);
            
            return new PageImpl<>(pagedDebates, pageable, allDebateResponses.size());
        } else {
            // latest, views는 DB에서 정렬 가능
            Page<Debate> debatePage;
            if (status != null) {
                debatePage = debateRepository.findByIsHiddenFalseAndStatus(status, sortedPageable);
            } else {
                debatePage = debateRepository.findByIsHiddenFalse(sortedPageable);
            }
            
            return debatePage.map(debate -> {
                Long likeCount = likeRepository.countByDebate(debate);
                Long commentCount = commentRepository.countByDebateAndIsHiddenFalse(debate);
                return DebateResponse.from(debate, likeCount, commentCount);
            });
        }
    }
    
    /**
     * 정렬 기준에 따라 Pageable 생성
     * 
     * @param pageable 원본 Pageable
     * @param sort 정렬 기준
     * @return 정렬된 Pageable
     */
    private Pageable getSortedPageable(Pageable pageable, String sort) {
        Sort.Direction direction = Sort.Direction.DESC;
        String property;
        
        switch (sort) {
            case "latest":
                property = "createdAt";
                break;
            case "views":
                property = "viewCount";
                break;
            default:
                property = "createdAt";
        }
        
        return org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(direction, property)
        );
    }

    /**
     * 카테고리별 토론 목록 조회 (페이징)
     * 
     * @param categoryId 카테고리 ID
     * @param pageable 페이징 정보
     * @param sort 정렬 기준 (latest, popular, comments, views)
     * @param status 토론 상태 (선택적: SCHEDULED, ACTIVE, ENDED)
     * @return 해당 카테고리의 토론 목록 (좋아요 수, 댓글 수 포함)
     * @throws ResourceNotFoundException 카테고리를 찾을 수 없는 경우
     */
    public Page<DebateResponse> getDebatesByCategory(Long categoryId, Pageable pageable, String sort, Debate.DebateStatus status) {
        // 카테고리 조회 및 검증
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("카테고리를 찾을 수 없습니다"));

        // 정렬 기준에 따라 Pageable 수정
        Pageable sortedPageable = getSortedPageable(pageable, sort);
        
        // 정렬 기준이 popular 또는 comments인 경우, 모든 데이터를 가져와서 정렬 후 페이징
        if ("popular".equals(sort) || "comments".equals(sort)) {
            // 모든 데이터 가져오기 (페이징 없이)
            List<Debate> allDebates;
            if (status != null) {
                allDebates = debateRepository.findByCategoryAndIsHiddenFalseAndStatus(category, status, Sort.by(Sort.Direction.DESC, "createdAt"));
            } else {
                allDebates = debateRepository.findByCategoryAndIsHiddenFalse(category, Sort.by(Sort.Direction.DESC, "createdAt"));
            }
            
            List<DebateResponse> allDebateResponses = allDebates.stream()
                    .map(debate -> {
                        Long likeCount = likeRepository.countByDebate(debate);
                        Long commentCount = commentRepository.countByDebateAndIsHiddenFalse(debate);
                        return DebateResponse.from(debate, likeCount, commentCount);
                    })
                    .collect(Collectors.toList());
            
            // 정렬 기준에 따라 정렬
            if ("popular".equals(sort)) {
                allDebateResponses.sort(Comparator
                        .comparing((DebateResponse d) -> d.getLikeCount() != null ? d.getLikeCount() : 0L, Comparator.reverseOrder())
                        .thenComparing((DebateResponse d) -> d.getCreatedAt() != null ? d.getCreatedAt() : LocalDateTime.MIN, Comparator.reverseOrder()));
            } else if ("comments".equals(sort)) {
                allDebateResponses.sort(Comparator
                        .comparing((DebateResponse d) -> d.getCommentCount() != null ? d.getCommentCount() : 0L, Comparator.reverseOrder())
                        .thenComparing((DebateResponse d) -> d.getCreatedAt() != null ? d.getCreatedAt() : LocalDateTime.MIN, Comparator.reverseOrder()));
            }
            
            // 페이징 적용
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), allDebateResponses.size());
            List<DebateResponse> pagedDebates = allDebateResponses.subList(start, end);
            
            return new PageImpl<>(pagedDebates, pageable, allDebateResponses.size());
        } else {
            // latest, views는 DB에서 정렬 가능
            Page<Debate> debatePage;
            if (status != null) {
                debatePage = debateRepository.findByCategoryAndIsHiddenFalseAndStatus(category, status, sortedPageable);
            } else {
                debatePage = debateRepository.findByCategoryAndIsHiddenFalse(category, sortedPageable);
            }
            
            return debatePage.map(debate -> {
                Long likeCount = likeRepository.countByDebate(debate);
                Long commentCount = commentRepository.countByDebateAndIsHiddenFalse(debate);
                return DebateResponse.from(debate, likeCount, commentCount);
            });
        }
    }

    /**
     * 키워드로 토론 검색 (페이징)
     * 제목과 내용에서 키워드를 검색합니다.
     * 카테고리, 상태 필터를 지원합니다.
     * 
     * @param keyword 검색 키워드
     * @param categoryId 카테고리 ID (선택적)
     * @param status 토론 상태 (선택적)
     * @param pageable 페이징 정보
     * @param sort 정렬 기준 (latest, popular, comments, views)
     * @return 검색된 토론 목록 (좋아요 수, 댓글 수 포함)
     */
    public Page<DebateResponse> searchDebates(String keyword, Long categoryId, Debate.DebateStatus status, Pageable pageable, String sort) {
        // 카테고리 조회 (categoryId가 있는 경우)
        Category category = null;
        if (categoryId != null) {
            category = categoryRepository.findById(categoryId)
                    .orElse(null); // 카테고리를 찾을 수 없으면 null
        }
        
        // 정렬 기준이 popular 또는 comments인 경우, 모든 데이터를 가져와서 정렬 후 페이징
        if ("popular".equals(sort) || "comments".equals(sort)) {
            // 모든 데이터 가져오기 (페이징 없이)
            List<Debate> allDebates = debateRepository.searchByKeywordWithoutPaging(
                    keyword != null && !keyword.trim().isEmpty() ? keyword : null,
                    category,
                    status,
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );
            
            List<DebateResponse> allDebateResponses = allDebates.stream()
                    .map(debate -> {
                        Long likeCount = likeRepository.countByDebate(debate);
                        Long commentCount = commentRepository.countByDebateAndIsHiddenFalse(debate);
                        return DebateResponse.from(debate, likeCount, commentCount);
                    })
                    .collect(Collectors.toList());
            
            // 정렬 기준에 따라 정렬
            if ("popular".equals(sort)) {
                allDebateResponses.sort(Comparator
                        .comparing((DebateResponse d) -> d.getLikeCount() != null ? d.getLikeCount() : 0L, Comparator.reverseOrder())
                        .thenComparing((DebateResponse d) -> d.getCreatedAt() != null ? d.getCreatedAt() : LocalDateTime.MIN, Comparator.reverseOrder()));
            } else if ("comments".equals(sort)) {
                allDebateResponses.sort(Comparator
                        .comparing((DebateResponse d) -> d.getCommentCount() != null ? d.getCommentCount() : 0L, Comparator.reverseOrder())
                        .thenComparing((DebateResponse d) -> d.getCreatedAt() != null ? d.getCreatedAt() : LocalDateTime.MIN, Comparator.reverseOrder()));
            }
            
            // 페이징 적용
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), allDebateResponses.size());
            List<DebateResponse> pagedDebates = allDebateResponses.subList(start, end);
            
            return new PageImpl<>(pagedDebates, pageable, allDebateResponses.size());
        } else {
            // latest, views는 DB에서 정렬 가능
            // 정렬 기준에 따라 Pageable 수정
            Pageable sortedPageable = getSortedPageable(pageable, sort);
            
            // 검색 실행
            Page<Debate> searchResults = debateRepository.searchByKeyword(
                    keyword != null && !keyword.trim().isEmpty() ? keyword : null,
                    category,
                    status,
                    sortedPageable
            );
            
            return searchResults.map(debate -> {
                Long likeCount = likeRepository.countByDebate(debate);
                Long commentCount = commentRepository.countByDebateAndIsHiddenFalse(debate);
                return DebateResponse.from(debate, likeCount, commentCount);
            });
        }
    }

    /**
     * 토론 상태 자동 업데이트
     * 스케줄러에서 주기적으로 호출하여 토론 상태를 자동으로 변경합니다.
     * - SCHEDULED → ACTIVE: 시작일시가 지난 토론
     * - ACTIVE → ENDED: 종료일시가 지난 토론
     */
    @Transactional
    public void updateDebateStatus() {
        LocalDateTime now = LocalDateTime.now();

        // 예정(SCHEDULED) 상태인 토론 중 시작일시가 지난 토론을 진행중(ACTIVE)으로 변경
        List<Debate> scheduledDebates = debateRepository.findByStatusAndStartDateLessThanEqual(
                Debate.DebateStatus.SCHEDULED, now);
        scheduledDebates.forEach(debate -> debate.setStatus(Debate.DebateStatus.ACTIVE));
        debateRepository.saveAll(scheduledDebates);

        // 진행중(ACTIVE) 상태인 토론 중 종료일시가 지난 토론을 종료(ENDED)로 변경
        List<Debate> activeDebates = debateRepository.findByStatusAndEndDateLessThanEqual(
                Debate.DebateStatus.ACTIVE, now);
        activeDebates.forEach(debate -> debate.setStatus(Debate.DebateStatus.ENDED));
        debateRepository.saveAll(activeDebates);
    }

    /**
     * 토론 수정
     * 작성자만 수정 가능하며, 토론이 시작되기 전(SCHEDULED 상태)에만 수정 가능합니다.
     * 
     * @param id 토론 ID
     * @param request 수정 요청 데이터
     * @param userId 현재 사용자 ID
     * @return 수정된 토론 응답 DTO
     * @throws ResourceNotFoundException 토론을 찾을 수 없는 경우
     * @throws UnauthorizedException 작성자가 아닌 경우
     * @throws BadRequestException 토론이 이미 시작되었거나 날짜 검증 실패 시
     */
    @Transactional
    public DebateResponse updateDebate(Long id, UpdateDebateRequest request, Long userId) {
        // 토론 조회
        Debate debate = debateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("토론을 찾을 수 없습니다"));

        // 숨김 처리된 토론인지 확인
        if (debate.getIsHidden()) {
            throw new ResourceNotFoundException("토론을 찾을 수 없습니다");
        }

        // 작성자 권한 확인
        if (!debate.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("토론을 수정할 권한이 없습니다");
        }

        // 토론 상태 확인 (시작 전에만 수정 가능)
        if (debate.getStatus() != Debate.DebateStatus.SCHEDULED) {
            throw new BadRequestException("토론이 시작된 후에는 수정할 수 없습니다");
        }

        // 제목 수정
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            debate.setTitle(request.getTitle().trim());
        }

        // 내용 수정
        if (request.getContent() != null) {
            debate.setContent(request.getContent());
        }

        // 카테고리 수정
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("카테고리를 찾을 수 없습니다"));
            debate.setCategory(category);
        }

        // 날짜 수정 및 검증
        LocalDateTime newStartDate = request.getStartDate() != null ? request.getStartDate() : debate.getStartDate();
        LocalDateTime newEndDate = request.getEndDate() != null ? request.getEndDate() : debate.getEndDate();

        // 날짜 검증: 시작일시는 종료일시보다 이전이어야 함
        if (newStartDate.isAfter(newEndDate)) {
            throw new BadRequestException("시작일시는 종료일시보다 이전이어야 합니다");
        }

        // 날짜 검증: 시작일시는 현재 시간보다 이후여야 함
        if (newStartDate.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("시작일시는 현재 시간보다 이후여야 합니다");
        }

        if (request.getStartDate() != null) {
            debate.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            debate.setEndDate(request.getEndDate());
        }

        // 토론 저장
        debate = debateRepository.save(debate);

        // 좋아요 수 조회
        Long likeCount = likeRepository.countByDebate(debate);
        
        // 댓글 수 조회 (숨김 처리되지 않은 댓글만)
        Long commentCount = commentRepository.countByDebateAndIsHiddenFalse(debate);

        // 응답 DTO 생성
        return DebateResponse.from(debate, likeCount, commentCount);
    }

    /**
     * 토론 삭제
     * 작성자만 삭제 가능하며, 토론이 시작되기 전(SCHEDULED 상태)에만 삭제 가능합니다.
     * 
     * @param id 삭제할 토론 ID
     * @param userId 현재 사용자 ID
     * @throws ResourceNotFoundException 토론을 찾을 수 없는 경우
     * @throws UnauthorizedException 작성자가 아닌 경우
     * @throws BadRequestException 토론이 이미 시작된 경우
     */
    @Transactional
    public void deleteDebate(Long id, Long userId) {
        // 토론 조회
        Debate debate = debateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("토론을 찾을 수 없습니다"));

        // 작성자 권한 확인
        if (!debate.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("토론을 삭제할 권한이 없습니다");
        }

        // 토론 상태 확인 (시작 전에만 삭제 가능)
        if (debate.getStatus() != Debate.DebateStatus.SCHEDULED) {
            throw new BadRequestException("토론이 시작된 후에는 삭제할 수 없습니다");
        }

        // 토론 삭제
        debateRepository.delete(debate);
    }
}

