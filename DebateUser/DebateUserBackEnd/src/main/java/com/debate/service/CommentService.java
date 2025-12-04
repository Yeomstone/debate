package com.debate.service;

import com.debate.dto.request.CreateCommentRequest;
import com.debate.dto.response.CommentResponse;
import com.debate.entity.Debate;
import com.debate.entity.Comment;
import com.debate.entity.User;
import com.debate.exception.BadRequestException;
import com.debate.exception.ResourceNotFoundException;
import com.debate.repository.DebateRepository;
import com.debate.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final DebateRepository debateRepository;
    private final com.debate.repository.CommentLikeRepository commentLikeRepository;
    private final com.debate.repository.UserRepository userRepository;

    private final NotificationService notificationService;

    @Transactional
    public CommentResponse createComment(CreateCommentRequest request, Long userId) {
        Debate debate = debateRepository.findById(request.getDebateId())
                .orElseThrow(() -> new ResourceNotFoundException("토론을 찾을 수 없습니다"));

        User user = userRepository.getReferenceById(userId);

        Comment parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("기존 댓글을 찾을 수 없습니다"));

            if (!parent.getDebate().getId().equals(debate.getId())) {
                throw new BadRequestException("기존 댓글이 해당 토론에 속하지 않습니다");
            }
        }

        Comment comment = Comment.builder()
                .user(user)
                .debate(debate)
                .parent(parent)
                .content(request.getContent())
                .isHidden(false)
                .build();

        comment = commentRepository.save(comment);

        // 알림 생성 로직
        try {
            // 1. 대댓글인 경우 부모 댓글 작성자에게 알림
            if (parent != null && !parent.getUser().getId().equals(userId)) {
                notificationService.createNotification(
                        parent.getUser(),
                        user.getNickname() + "님이 대댓글을 남겼습니다: " + truncateContent(comment.getContent()),
                        "COMMENT",
                        "/debate/" + debate.getId()
                );
            }
            // 2. 일반 댓글인 경우 토론 작성자에게 알림 (대댓글이 아닐 때만, 그리고 본인이 아닐 때)
            else if (parent == null && !debate.getUser().getId().equals(userId)) {
                notificationService.createNotification(
                        debate.getUser(),
                        user.getNickname() + "님이 토론에 댓글을 남겼습니다: " + truncateContent(comment.getContent()),
                        "COMMENT",
                        "/debate/" + debate.getId()
                );
            }
        } catch (Exception e) {
            // 알림 생성 실패가 핵심 로직에 영향을 주지 않도록 예외 처리
            System.err.println("알림 생성 실패: " + e.getMessage());
        }

        return CommentResponse.from(comment);
    }

    private String truncateContent(String content) {
        if (content == null) return "";
        return content.length() > 15 ? content.substring(0, 20) + "..." : content;
    }

    public Page<CommentResponse> getCommentsByDebate(Long debateId, Pageable pageable, Long userId) {
        Debate debate = debateRepository.findById(debateId)
                .orElseThrow(() -> new ResourceNotFoundException("토론을 찾을 수 없습니다"));

        Page<Comment> comments = commentRepository.findByDebateAndIsHiddenFalseAndParentIsNull(debate, pageable);

        return comments.map(comment -> {
            CommentResponse response = CommentResponse.from(comment);
            
            // 현재 사용자가 좋아요를 눌렀는지 확인
            if (userId != null) {
                response.setLiked(commentLikeRepository.existsByCommentIdAndUserId(comment.getId(), userId));
            }

            List<Comment> replies = commentRepository.findByParent(comment);
            response.setReplies(replies.stream()
                    .map(reply -> {
                        CommentResponse replyResponse = CommentResponse.from(reply);
                        if (userId != null) {
                            replyResponse.setLiked(commentLikeRepository.existsByCommentIdAndUserId(reply.getId(), userId));
                        }
                        return replyResponse;
                    })
                    .collect(Collectors.toList()));
            return response;
        });
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("댓글을 찾을 수 없습니다"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new BadRequestException("댓글을 삭제할 권한이 없습니다");
        }

        // 1. 대댓글 존재 여부 확인
        List<Comment> replies = commentRepository.findByParent(comment);
        
        if (!replies.isEmpty()) {
            // 대댓글이 있으면 Soft Delete (삭제 상태로 변경)
            comment.setIsDeleted(true);
            commentRepository.save(comment);
            
            // 좋아요는 삭제 (선택 사항이나 깔끔하게 제거)
            commentLikeRepository.deleteByCommentId(commentId);
        } else {
            // 대댓글이 없으면 Hard Delete (완전 삭제)
            // 1. 댓글의 좋아요 삭제
            commentLikeRepository.deleteByCommentId(commentId);
            // 2. 댓글 삭제
            commentRepository.delete(comment);
        }
    }

    @Transactional
    public void toggleLike(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("댓글을 찾을 수 없습니다"));

        if (commentLikeRepository.existsByCommentIdAndUserId(commentId, userId)) {
            commentLikeRepository.deleteByCommentIdAndUserId(commentId, userId);
        } else {
            User user = userRepository.getReferenceById(userId);
            
            com.debate.entity.CommentLike like = com.debate.entity.CommentLike.builder()
                    .comment(comment)
                    .user(user)
                    .build();
            
            commentLikeRepository.save(like);

            // 좋아요 알림 생성 (본인이 아닐 경우)
            if (!comment.getUser().getId().equals(userId)) {
                try {
                    notificationService.createNotification(
                            comment.getUser(),
                            user.getNickname() + "님이 댓글을 좋아합니다.",
                            "LIKE",
                            "/debate/" + comment.getDebate().getId()
                    );
                } catch (Exception e) {
                    System.err.println("알림 생성 실패: " + e.getMessage());
                }
            }
        }
    }
    @Transactional
    public CommentResponse updateComment(Long commentId, Long userId, String content) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("댓글을 찾을 수 없습니다"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new BadRequestException("댓글을 수정할 권한이 없습니다");
        }

        comment.setContent(content);
        return CommentResponse.from(comment);
    }
}

