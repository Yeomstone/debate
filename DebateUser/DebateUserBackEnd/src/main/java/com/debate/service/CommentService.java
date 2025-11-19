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

    @Transactional
    public CommentResponse createComment(CreateCommentRequest request, Long userId) {
        Debate debate = debateRepository.findById(request.getDebateId())
                .orElseThrow(() -> new ResourceNotFoundException("토론을 찾을 수 없습니다"));

        User user = new User();
        user.setId(userId);

        Comment parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("부모 댓글을 찾을 수 없습니다"));

            if (!parent.getDebate().getId().equals(debate.getId())) {
                throw new BadRequestException("부모 댓글이 해당 토론에 속하지 않습니다");
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
        return CommentResponse.from(comment);
    }

    public Page<CommentResponse> getCommentsByDebate(Long debateId, Pageable pageable) {
        Debate debate = debateRepository.findById(debateId)
                .orElseThrow(() -> new ResourceNotFoundException("토론을 찾을 수 없습니다"));

        Page<Comment> comments = commentRepository.findByDebateAndIsHiddenFalseAndParentIsNull(debate, pageable);

        return comments.map(comment -> {
            CommentResponse response = CommentResponse.from(comment);
            List<Comment> replies = commentRepository.findByParent(comment);
            response.setReplies(replies.stream()
                    .map(CommentResponse::from)
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

        commentRepository.delete(comment);
    }
}

