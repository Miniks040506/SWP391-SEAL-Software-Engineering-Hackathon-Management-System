package com.t7.seal.service.impl;

import com.t7.seal.domain.NotificationChannel;
import com.t7.seal.domain.NotificationStatus;
import com.t7.seal.domain.NotificationTargetScope;
import com.t7.seal.domain.NotificationType;
import com.t7.seal.domain.RegistrationStatus;
import com.t7.seal.domain.RoundStatus;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.Notification;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.User;
import com.t7.seal.repository.NotificationRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.service.NotificationService;
import com.t7.seal.service.RoundDeadlineReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoundDeadlineReminderServiceImpl implements RoundDeadlineReminderService {

    private static final List<Integer> REMINDER_OFFSETS_HOURS = List.of(24, 1);
    private static final DateTimeFormatter DEADLINE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final NotificationRepository notificationRepository;
    private final RoundRepository roundRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public int synchronizeSubmissionDeadlineReminders(Round round, User actor) {
        if (round == null || round.getId() == null || round.getSubmissionDeadline() == null) {
            return 0;
        }
        if (!isReminderEligible(round)) {
            return cancelSubmissionDeadlineReminders(round);
        }

        LocalDateTime now = LocalDateTime.now();
        Map<LocalDateTime, Integer> expectedSchedules = buildExpectedSchedules(round.getSubmissionDeadline());
        List<Notification> existing = findScheduledReminders(round);
        List<Notification> stale = existing.stream()
                .filter(notification -> !expectedSchedules.containsKey(notification.getScheduledAt()))
                .toList();

        if (!stale.isEmpty()) {
            notificationRepository.deleteAll(stale);
            notificationRepository.flush();
        }

        Set<LocalDateTime> existingSchedules = existing.stream()
                .filter(notification -> !stale.contains(notification))
                .map(Notification::getScheduledAt)
                .collect(Collectors.toSet());

        int scheduledCount = 0;
        for (Map.Entry<LocalDateTime, Integer> expected : expectedSchedules.entrySet()) {
            if (!expected.getKey().isAfter(now) || existingSchedules.contains(expected.getKey())) {
                continue;
            }

            scheduleReminder(round, actor, expected.getValue(), expected.getKey());
            scheduledCount++;
        }

        return scheduledCount;
    }

    @Override
    @Transactional
    public int cancelSubmissionDeadlineReminders(Round round) {
        if (round == null || round.getId() == null) {
            return 0;
        }

        List<Notification> scheduled = findScheduledReminders(round);
        if (!scheduled.isEmpty()) {
            notificationRepository.deleteAll(scheduled);
            notificationRepository.flush();
        }
        return scheduled.size();
    }

    @Override
    @Transactional
    public int synchronizeEventSubmissionDeadlineReminders(HackathonEvent event, User actor) {
        if (event == null || event.getId() == null) {
            return 0;
        }

        return roundRepository.findByEventIdOrderByOrderIndexAsc(event.getId()).stream()
                .mapToInt(round -> synchronizeSubmissionDeadlineReminders(round, actor))
                .sum();
    }

    @Override
    @Transactional
    public int cancelEventSubmissionDeadlineReminders(UUID eventId) {
        if (eventId == null) {
            return 0;
        }

        return roundRepository.findByEventIdOrderByOrderIndexAsc(eventId).stream()
                .mapToInt(this::cancelSubmissionDeadlineReminders)
                .sum();
    }

    @Override
    @Transactional
    public int reconcileSubmissionDeadlineReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<Round> candidates = roundRepository
                .findByStatusInAndSubmissionLockedAtIsNullAndSubmissionDeadlineAfterOrderBySubmissionDeadlineAsc(
                        List.of(RoundStatus.UPCOMING, RoundStatus.OPEN),
                        now
                );

        int affectedCount = candidates.stream()
                .mapToInt(round -> synchronizeSubmissionDeadlineReminders(
                        round,
                        round.getEvent().getCreatedBy()
                ))
                .sum();

        Set<UUID> candidateIds = candidates.stream()
                .map(Round::getId)
                .collect(Collectors.toSet());
        List<Notification> orphanedOrExpired = notificationRepository
                .findByTypeAndTargetScopeAndStatusOrderByScheduledAtAsc(
                        NotificationType.DEADLINE_REMINDER,
                        NotificationTargetScope.EVENT_PARTICIPANTS,
                        NotificationStatus.SCHEDULED
                )
                .stream()
                .filter(notification -> notification.getTargetId() == null
                        || !candidateIds.contains(notification.getTargetId()))
                .toList();

        if (!orphanedOrExpired.isEmpty()) {
            notificationRepository.deleteAll(orphanedOrExpired);
            notificationRepository.flush();
            affectedCount += orphanedOrExpired.size();
        }

        return affectedCount;
    }

    private Map<LocalDateTime, Integer> buildExpectedSchedules(LocalDateTime deadline) {
        Map<LocalDateTime, Integer> expected = new LinkedHashMap<>();
        for (Integer offsetHours : REMINDER_OFFSETS_HOURS) {
            expected.put(deadline.minusHours(offsetHours), offsetHours);
        }
        return expected;
    }

    private boolean isReminderEligible(Round round) {
        if (round.getSubmissionLockedAt() != null
                || (round.getStatus() != RoundStatus.UPCOMING && round.getStatus() != RoundStatus.OPEN)
                || round.getEvent() == null
                || round.getEvent().getStatus() == null) {
            return false;
        }

        RegistrationStatus eventStatus = round.getEvent().getStatus();
        return eventStatus == RegistrationStatus.DRAFT
                || eventStatus == RegistrationStatus.REGISTRATION
                || eventStatus == RegistrationStatus.ONGOING;
    }

    private List<Notification> findScheduledReminders(Round round) {
        return notificationRepository.findByTypeAndTargetScopeAndTargetIdAndStatusOrderByScheduledAtAsc(
                NotificationType.DEADLINE_REMINDER,
                NotificationTargetScope.EVENT_PARTICIPANTS,
                round.getId(),
                NotificationStatus.SCHEDULED
        );
    }

    private void scheduleReminder(Round round, User actor, int offsetHours, LocalDateTime scheduledAt) {
        String hourLabel = offsetHours == 1 ? "1 hour" : offsetHours + " hours";
        notificationService.createSystemNotification(
                actor,
                round.getEvent(),
                NotificationType.DEADLINE_REMINDER,
                "Submission deadline in " + hourLabel,
                "Round " + round.getName() + " closes for submissions at "
                        + round.getSubmissionDeadline().format(DEADLINE_FORMAT)
                        + ". Submit or update your deliverables before the deadline.",
                NotificationTargetScope.EVENT_PARTICIPANTS,
                round.getId(),
                null,
                NotificationChannel.BOTH,
                scheduledAt
        );
    }
}
