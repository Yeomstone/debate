package com.debate.scheduler;

import com.debate.service.DebateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DebateScheduler {

    private final DebateService debateService;

    /**
     * 1분마다 토론 상태 업데이트 (SCHEDULED -> ACTIVE, ACTIVE -> ENDED)
     * cron = "초 분 시 일 월 요일"
     */
    @Scheduled(cron = "0 * * * * *")
    public void scheduleDebateStatusUpdate() {
        log.info("Executing debate status update task");
        debateService.updateDebateStatus();
    }
}