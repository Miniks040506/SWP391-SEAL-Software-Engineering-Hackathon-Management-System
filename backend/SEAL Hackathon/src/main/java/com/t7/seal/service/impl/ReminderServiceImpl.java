package com.t7.seal.service.impl;

import com.t7.seal.domain.NotificationChannel;
import com.t7.seal.domain.NotificationTargetScope;
import com.t7.seal.domain.NotificationType;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.Notification;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.NotificationRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.request.reminder.CreateReminderRequest;
import com.t7.seal.request.reminder.GenerateEventRemindersRequest;
import com.t7.seal.response.reminder.ReminderResponse;
import com.t7.seal.response.system.NotificationResponse;
import com.t7.seal.security.guard.CurrentUser;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.NotificationService;
import com.t7.seal.service.ReminderService;
import com.t7.seal.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReminderServiceImpl implements ReminderService {

    private static final List<NotificationType> REMINDER_TYPES = List.of(
            NotificationType.DEADLINE_REMINDER,
            NotificationType.SUBMISSION_REMINDER,
            NotificationType.JUDGING_REMINDER,
            NotificationType.CALIBRATION_REMINDER
    );

    private final SystemConfigService systemConfigService;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    private final HackathonEventRepository hackathonEventRepository;
    private final NotificationRepository notificationRepository;
    private final RoundRepository roundRepository;

    @Transactional(readOnly = true)
    @Override
    public List<ReminderResponse> listEventReminders(
            UUID eventId,
            Authentication authentication
    ) {
        ensureCanManage(authentication);
        ensureRemindersEnabled();
        ensureEventExists(eventId);

        return notificationRepository.findEventReminders(
                        eventId,
                        REMINDER_TYPES
                ).stream()
                .map(this::toReminderResponse)
                .toList();
    }

    @Transactional
    @Override
    public ReminderResponse createReminder(
            UUID eventId,
            CreateReminderRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanManage(authentication);
        ensureRemindersEnabled();

        HackathonEvent event = ensureEventExists(eventId);
        NotificationType type = parseReminderType(request.type());
        NotificationTargetScope scope = parseEnum(NotificationTargetScope.class,
                request.targetScope(), "target scope");
        NotificationChannel channel = request.channel() == null || request.channel().isBlank()
                ? NotificationChannel.BOTH
                : parseEnum(NotificationChannel.class, request.channel(), "channel");
        if (request.scheduledAt().isBefore(LocalDateTime.now().minusMinutes(1))) {
            throw new BadRequestException("Reminder schedule at must be in the future.");
        }
        NotificationResponse created = notificationService.createSystemNotification(
                actor,
                event,
                type,
                request.title(),
                request.body(),
                scope,
                request.targetId(),
                request.role(),
                channel,
                request.scheduledAt()
        );

        Notification entity = notificationRepository.findById(created.id())
                .orElseThrow(() -> new NotFoundException("Reminder not found after creation"));

        return toReminderResponse(entity);
    }

    @Transactional
    @Override
    public List<ReminderResponse> generateEventDeadlineReminders(
            UUID eventId,
            GenerateEventRemindersRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanManage(authentication);
        ensureRemindersEnabled();

        HackathonEvent event = ensureEventExists(eventId);
        int submissionDays = request != null && request.submissionDaysBefore() != null
                ? Math.max(request.submissionDaysBefore(), 0)
                : parsePositiveInteger(systemConfigService
                .getStringValue("reminder.default_submission_days_before", "1"));
        int judgingDays = request != null && request.judgingDaysBefore() != null
                ? Math.max(request.judgingDaysBefore(), 0)
                : parsePositiveInteger(systemConfigService
                .getStringValue("reminder.default_judging_days_before", "1"));

        boolean includeSubmission = request == null
                || request.includeSubmissionReminders() == null
                || request.includeSubmissionReminders();
        boolean includeJudging = request == null
                || request.includeJudgingReminders() == null
                || request.includeJudgingReminders();
        NotificationChannel channel = request != null && Boolean.FALSE.equals(request.emailEnabled())
                ? NotificationChannel.IN_APP
                : NotificationChannel.BOTH;

        LocalDateTime now = LocalDateTime.now();
        List<ReminderResponse> created = new ArrayList<>();

        for (Round round : roundRepository.findByEventIdOrderByOrderIndexAsc(eventId)) {
            if (includeSubmission && round.getSubmissionDeadline() != null) {
                LocalDateTime scheduelAt = round.getSubmissionDeadline().minusDays(submissionDays);
                if (scheduelAt.isAfter(now)) {
                    created.add(createFromParts(
                            actor,
                            event,
                            NotificationType.SUBMISSION_REMINDER,
                            "Submission deadline reminder: " + round.getName(),
                            "Round " + round.getName()
                                    + " submission deadline is: "
                                    + round.getSubmissionDeadline()
                                    + ". Please submit required deliverable links before the round is locked",
                            NotificationTargetScope.EVENT_PARTICIPANTS,
                            null,
                            null,
                            channel,
                            scheduelAt
                    ));
                }
            }

            if (includeJudging && round.getJudgingDeadline() != null) {
                LocalDateTime scheduelAt = round.getJudgingDeadline().minusDays(judgingDays);
                if (scheduelAt.isAfter(now)) {
                    created.add(createFromParts(
                            actor,
                            event,
                            NotificationType.JUDGING_REMINDER,
                            "Judging deadline reminder: " + round.getName(),
                            "Round " + round.getName()
                                    + " judging deadline is: "
                                    + round.getJudgingDeadline()
                                    + ". Please finalize assigned scores before grading is locked",
                            NotificationTargetScope.ROUND_JUDGES,
                            round.getId(),
                            null,
                            channel,
                            scheduelAt
                    ));
                }
            }
        }

        return created;
    }

    @Transactional
    @Override
    public ReminderResponse sendReminderNow(
            UUID reminderId,
            Authentication authentication
    ) {
        ensureCanManage(authentication);
        ensureRemindersEnabled();

        Notification reminder = notificationRepository.findReminderById(reminderId, REMINDER_TYPES)
                .orElseThrow(() -> new NotFoundException("Reminder not found"));

        notificationService.sendNotificationNow(reminderId, authentication);

        return toReminderResponse(reminder);
    }

    //HELPERS

    private ReminderResponse createFromParts(
            User actor,
            HackathonEvent event,
            NotificationType type,
            String title,
            String body,
            NotificationTargetScope scope,
            UUID targetId,
            String role,
            NotificationChannel channel,
            LocalDateTime scheduledAt
    ) {
        NotificationResponse response = notificationService.createSystemNotification(
                actor,
                event,
                type,
                title,
                body,
                scope,
                targetId,
                role,
                channel,
                scheduledAt
        );

        Notification entity = notificationRepository.findById(response.id())
                .orElseThrow(() -> new NotFoundException("Reminder not found after creation"));

        return toReminderResponse(entity);
    }

    private ReminderResponse toReminderResponse(Notification noti) {
        HackathonEvent event = noti.getEvent();

        return new ReminderResponse(
                noti.getId(),
                event == null ? null : event.getId(),
                event == null ? null : event.getName(),
                noti.getType() == null ? null : noti.getType().name(),
                noti.getTitle(),
                noti.getBody(),
                noti.getTargetScope() == null ? null : noti.getTargetScope().name(),
                noti.getTargetId(),
                noti.getChannel() == null ? null : noti.getChannel().name(),
                noti.getStatus() == null ? null : noti.getStatus().name(),
                noti.getScheduledAt(),
                noti.getSentAt(),
                noti.getRecipientCount()
        );
    }

    private HackathonEvent ensureEventExists(UUID eventId) {
        if (eventId == null) {
            throw new BadRequestException("Event id is required");
        }
        return hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found"));
    }

    private void ensureRemindersEnabled() {
        if (!systemConfigService.getBooleanValue("feature.advanced_reminders.enabled", true)) {
            throw new ForbiddenException("Advance reminders are currently disabled by system config.");
        }
    }

    private void ensureCanManage(Authentication authentication) {
        if (!CurrentUser.isAdminOrCoordinator(authentication)) {
            throw new ForbiddenException("Only admin or coordinator can manage reminders.");
        }
    }

    private NotificationType parseReminderType(String type) {
        NotificationType notificationType = parseEnum(NotificationType.class, type, "reminder type");
        if (!REMINDER_TYPES.contains(notificationType)) {
            throw new BadRequestException("Unsupported reminder type: " + type + ".");
        }
        return notificationType;
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumType, String value, String lable) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(lable + " is required.");
        }

        try {
            return Enum.valueOf(enumType, value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unsupported " + lable + ": " + value + ".");
        }
    }

    private int parsePositiveInteger(String value) {
        try {
            return Math.max(0, Integer.parseInt(value));
        } catch (NumberFormatException ex) {
            return 1;
        }
    }
}
