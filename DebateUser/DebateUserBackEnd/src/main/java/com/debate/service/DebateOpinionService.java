package com.debate.service;

import com.debate.dto.request.CreateOpinionRequest;
import com.debate.entity.Debate;
import com.debate.entity.DebateOpinion;
import com.debate.entity.User;
import com.debate.exception.BadRequestException;
import com.debate.exception.ResourceNotFoundException;
import com.debate.repository.DebateOpinionRepository;
import com.debate.repository.DebateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DebateOpinionService {
    private final DebateOpinionRepository debateOpinionRepository;
    private final DebateRepository debateRepository;

    @Transactional
    public DebateOpinion createOpinion(CreateOpinionRequest request, Long userId) {
        Debate debate = debateRepository.findById(request.getDebateId())
                .orElseThrow(() -> new ResourceNotFoundException("토론을 찾을 수 없습니다"));

        if (debate.getStatus() != Debate.DebateStatus.ACTIVE) {
            throw new BadRequestException("진행 중인 토론에만 입장을 선택할 수 있습니다");
        }

        if (LocalDateTime.now().isBefore(debate.getStartDate()) || LocalDateTime.now().isAfter(debate.getEndDate())) {
            throw new BadRequestException("토론 기간이 아닙니다");
        }

        User user = new User();
        user.setId(userId);

        if (debateOpinionRepository.existsByDebateAndUser(debate, user)) {
            throw new BadRequestException("이미 입장을 선택했습니다");
        }

        DebateOpinion opinion = DebateOpinion.builder()
                .debate(debate)
                .user(user)
                .side(request.getSide())
                .content(request.getContent())
                .build();

        return debateOpinionRepository.save(opinion);
    }

    public List<DebateOpinion> getOpinionsByDebate(Long debateId) {
        Debate debate = debateRepository.findById(debateId)
                .orElseThrow(() -> new ResourceNotFoundException("토론을 찾을 수 없습니다"));

        return debateOpinionRepository.findByDebate(debate);
    }
}

