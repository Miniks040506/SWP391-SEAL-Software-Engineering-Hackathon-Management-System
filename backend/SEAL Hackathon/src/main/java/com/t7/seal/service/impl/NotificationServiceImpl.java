package com.t7.seal.service.impl;

import com.t7.seal.domain.*;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.*;
import com.t7.seal.request.system.CreateNotificationRequest;
import com.t7.seal.request.system.TestEmailRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.*;
import com.t7.seal.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_EMAIL_ATTEMPTS = 3;

    private final NotificationRepository notificationRepository;
    private final NotificationRecipientRepository notificationRecipientRepository;
    private final EmailOutboxRepository emailOutboxRepository;
    private final EmailDeliveryLogRepository emailDeliveryLogRepository;
    private final NotificationTemplateRepository notificationTemplateRepository;
    private final HackathonEventRepository eventRepository;
    private final UserRepository userRepository;
    private final NotificationRecipientResolver recipientResolver;
    private final CurrentUserService currentUserService;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    @Transactional
    public NotificationResponse createNotification(CreateNotificationRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanManage(actor);

        NotificationType type = parseEnum(NotificationType.class, request.type(), "notification type");
        NotificationTargetScope scope = parseEnum(NotificationTargetScope.class, request.targetScope(), "notification target scope");
        NotificationChannel channel = request.channel() == null || request.channel().isBlank()
                ? NotificationChannel.BOTH
                : parseEnum(NotificationChannel.class, request.channel(), "notification channel");

        HackathonEvent event = null;
        if (request.eventId() != null) {
            event = eventRepository.findById(request.eventId())
                    .orElseThrow(() -> new NotFoundException("Event not found " + request.eventId()));
        }

        Notification notification = Notification.builder()
                .event(event)
                .createdBy(actor)
                .type(type)
                .title(trimRequired(request.title(), "title"))
                .body(trimRequired(request.body(), "body"))
                .targetScope(scope)
                .targetId(request.targetId())
                .targetRole(request.role())
                .channel(channel)
                .scheduledAt(request.scheduledAt())
                .status(request.scheduledAt() == null ? NotificationStatus.DRAFT : NotificationStatus.SCHEDULED)
                .build();

        Notification saved = notificationRepository.save(notification);
        auditLogService.record(actor, AuditActionType.NOTIFICATION_CREATED, "notifications", saved.getId(), null, auditState(saved), null);

        if (request.scheduledAt() == null) {
            fanout(saved, actor);
        }

        return toResponse(saved, null);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotifications(Boolean read, int page, int size, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Page<NotificationRecipient> result = notificationRecipientRepository.findInbox(
                user.getId(),
                read,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return new PageResponse<>(
                result.getContent().stream().map(this::toInboxResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(UUID notificationId, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        NotificationRecipient recipient = notificationRecipientRepository.findByNotificationIdAndUserId(notificationId, user.getId())
                .orElseThrow(() -> new NotFoundException("Notification not found " + notificationId));
        return toInboxResponse(recipient);
    }

    @Override
    @Transactional
    public NotificationResponse sendNotificationNow(UUID notificationId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanManage(actor);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found " + notificationId));
        fanout(notification, actor);
        return toResponse(notification, null);
    }

    @Override
    @Transactional
    public void markAsRead(UUID notificationId, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        NotificationRecipient recipient = notificationRecipientRepository.findByNotificationIdAndUserId(notificationId, user.getId())
                .orElseThrow(() -> new NotFoundException("Notification not found " + notificationId));
        recipient.markRead();
        notificationRecipientRepository.save(recipient);
    }

    @Override
    @Transactional
    public void markAllAsRead(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        notificationRecipientRepository.markAllAsRead(user.getId(), LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        return new UnreadCountResponse(notificationRecipientRepository.countByUserIdAndReadAtIsNull(user.getId()));
    }

    @Override
    @Transactional
    public void sendTestEmail(TestEmailRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanManage(actor);
        String subject = request.subject() == null || request.subject().isBlank()
                ? "SEAL test email"
                : request.subject().trim();
        String body = request.body() == null || request.body().isBlank()
                ? "This is a test email from SEAL notification infrastructure."
                : request.body().trim();
        try {
            emailService.sendNotificationEmail(request.to(), List.of(), subject, "SEAL Test Email", body, null);
            auditLogService.record(actor, AuditActionType.EMAIL_SENT, "email_outbox", actor.getId(), null, Map.of("to", request.to(), "subject", subject), null);
        } catch (RuntimeException ex) {
            auditLogService.record(actor, AuditActionType.EMAIL_FAILED, "email_outbox", actor.getId(), null, Map.of("to", request.to(), "error", ex.getMessage()), null);
            throw ex;
        }
    }

    @Override
    @Transactional
    public void dispatchDueNotifications() {
        List<Notification> due = notificationRepository.findTop50ByStatusAndScheduledAtLessThanEqualOrderByScheduledAtAsc(
                NotificationStatus.SCHEDULED,
                LocalDateTime.now()
        );
        for (Notification notification : due) {
            User actor = notification.getCreatedBy();
            fanout(notification, actor);
        }
    }

    private void fanout(Notification notification, User actor) {
        notification.markProcessing();
        Notification saved = notificationRepository.save(notification);

        NotificationRecipientResolutionResponse resolved = recipientResolver.resolve(
                saved.getTargetScope().name(),
                saved.getTargetId(),
                saved.getEvent() == null ? null : saved.getEvent().getId(),
                saved.getTargetRole()
        );

        int inAppCount = 0;
        if (saved.usesInAppChannel()) {
            inAppCount = createInAppRecipients(saved, resolved.inAppRecipients());
        }

        String emailFailure = null;
        int emailSuccess = 0;
        if (saved.usesEmailChannel()) {
            try {
                emailSuccess = createAndSendEmail(saved, resolved);
            } catch (RuntimeException ex) {
                emailFailure = ex.getMessage();
            }
        }

        int recipientCount = Math.max(inAppCount, resolved.totalRecipients());
        if (emailFailure != null && emailSuccess == 0 && saved.usesEmailChannel()) {
            saved.markFailed(emailFailure);
            auditLogService.record(actor, AuditActionType.NOTIFICATION_FAILED, "notifications", saved.getId(), null, auditState(saved), Map.of("error", emailFailure));
        } else if (emailFailure != null) {
            saved.markPartiallyFailed(recipientCount, emailFailure);
        } else {
            saved.markSent(recipientCount);
        }
        notificationRepository.save(saved);
        auditLogService.record(actor, AuditActionType.NOTIFICATION_SENT, "notifications", saved.getId(), null, auditState(saved), null);
    }

    private int createInAppRecipients(Notification notification, List<NotificationRecipientResponse> recipients) {
        int count = 0;
        for (UUID userId : dedupeUserIds(recipients)) {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || !user.isActive()) continue;
            if (notificationRecipientRepository.findByNotificationIdAndUserId(notification.getId(), user.getId()).isPresent()) {
                continue;
            }
            NotificationRecipient recipient = NotificationRecipient.builder()
                    .notification(notification)
                    .user(user)
                    .deliveredAt(LocalDateTime.now())
                    .build();
            notificationRecipientRepository.save(recipient);
            count++;
        }
        return count;
    }

    private int createAndSendEmail(Notification notification, NotificationRecipientResolutionResponse resolved) {
        if (resolved.to() == null || resolved.to().isEmpty()) {
            return 0;
        }

        NotificationRecipientResponse primary = resolved.primaryRecipient() != null ? resolved.primaryRecipient() : resolved.to().get(0);
        List<String> cc = resolved.cc() == null
                ? List.of()
                : resolved.cc().stream().map(NotificationRecipientResponse::email).filter(Objects::nonNull).distinct().toList();

        String subject = renderSubject(notification);
        String actionUrl = renderActionUrl(notification);
        String html = renderEmailHtml(notification, actionUrl);
        String idempotencyKey = notification.getId() + ":" + primary.email() + ":" + String.join(",", cc);

        EmailOutbox outbox = emailOutboxRepository.findByIdempotencyKey(idempotencyKey)
                .orElseGet(() -> emailOutboxRepository.save(EmailOutbox.builder()
                        .notification(notification)
                        .toEmail(primary.email())
                        .ccEmails(String.join(",", cc))
                        .subject(subject)
                        .htmlBody(html)
                        .scheduledAt(notification.getScheduledAt() == null ? LocalDateTime.now() : notification.getScheduledAt())
                        .idempotencyKey(idempotencyKey)
                        .status(EmailDeliveryStatus.PENDING)
                        .build()));

        try {
            emailService.sendRawHtmlEmail(outbox.getToEmail(), cc, outbox.getSubject(), outbox.getHtmlBody());
            outbox.markSent();
            emailOutboxRepository.save(outbox);
            emailDeliveryLogRepository.save(EmailDeliveryLog.builder()
                    .emailOutbox(outbox)
                    .recipientEmail(outbox.getToEmail())
                    .status(EmailDeliveryStatus.SENT)
                    .message("Email sent")
                    .build());
            auditLogService.record(notification.getCreatedBy(), AuditActionType.EMAIL_SENT, "email_outbox", outbox.getId(), null, Map.of("to", outbox.getToEmail(), "cc", outbox.getCcEmails()), null);
            return 1;
        } catch (RuntimeException ex) {
            outbox.markFailed(ex.getMessage());
            emailOutboxRepository.save(outbox);
            emailDeliveryLogRepository.save(EmailDeliveryLog.builder()
                    .emailOutbox(outbox)
                    .recipientEmail(outbox.getToEmail())
                    .status(EmailDeliveryStatus.FAILED)
                    .message(ex.getMessage())
                    .build());
            auditLogService.record(notification.getCreatedBy(), AuditActionType.EMAIL_FAILED, "email_outbox", outbox.getId(), null, Map.of("to", outbox.getToEmail(), "error", ex.getMessage()), null);
            throw ex;
        }
    }

    private Set<UUID> dedupeUserIds(List<NotificationRecipientResponse> recipients) {
        if (recipients == null) return Set.of();
        return recipients.stream()
                .map(NotificationRecipientResponse::userId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String renderSubject(Notification notification) {
        return notificationTemplateRepository.findByTypeAndActiveTrue(notification.getType())
                .map(NotificationTemplate::getSubjectTemplate)
                .orElse(defaultSubject(notification.getType()))
                .replace("{title}", notification.getTitle());
    }

    private String renderEmailHtml(Notification notification, String actionUrl) {
        String body = notification.getBody() == null ? "" : notification.getBody().replace("\n", "<br/>");
        String cta = actionUrl == null ? "" : """
                <div style="text-align:center;margin-top:28px;">
                  <a href="%s" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;font-weight:900;padding:13px 24px;border-radius:12px;">Open in SEAL</a>
                </div>
                """.formatted(escape(actionUrl));
        return """
                <!doctype html>
                <html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;"><tr><td align="center">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 18px 45px rgba(15,23,42,.08);">
                <tr><td style="background:linear-gradient(135deg,#2563eb,#3b82f6,#60a5fa);padding:34px;color:#fff;">
                  <div style="font-size:20px;font-weight:900;">SEAL</div>
                  <h1 style="margin:28px 0 8px;font-size:28px;line-height:1.15;font-weight:900;">%s</h1>
                  <p style="margin:0;color:#dbeafe;font-size:15px;font-weight:700;">Hackathon System Notification</p>
                </td></tr>
                <tr><td style="padding:34px;color:#475569;font-size:15px;line-height:1.7;">%s%s</td></tr>
                <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:26px 34px;color:#64748b;font-size:12px;line-height:1.6;">
                  <strong style="display:block;color:#0f172a;font-size:14px;margin-bottom:8px;">SEAL Hackathon Team</strong>
                  This is an automated email. Please do not reply directly to this message.
                </td></tr></table></td></tr></table></body></html>
                """.formatted(escape(notification.getTitle()), body, cta);
    }

    private String renderActionUrl(Notification notification) {
        if (notification.getTargetScope() == NotificationTargetScope.TEAM && notification.getTargetId() != null) {
            return "/participant/teams/" + notification.getTargetId();
        }
        if (notification.getType() == NotificationType.JUDGE_ASSIGNED) {
            return "/judge/submissions";
        }
        if (notification.getType() == NotificationType.MENTOR_FEEDBACK || notification.getType() == NotificationType.MENTOR_FEEDBACK_PUBLISHED) {
            return notification.getTargetId() == null ? "/participant/teams" : "/participant/teams/" + notification.getTargetId() + "/feedback";
        }
        return "/notifications";
    }

    private String defaultSubject(NotificationType type) {
        return switch (type) {
            case TEAM_INVITATION_SENT -> "You are invited to join a SEAL team";
            case TEAM_INVITATION_ACCEPTED -> "A member accepted the team invitation";
            case TEAM_INVITATION_REJECTED -> "A team invitation was declined";
            case TEAM_REGISTERED -> "Your team registration is confirmed";
            case SUBMISSION_SUBMITTED -> "Submission received";
            case SUBMISSION_UPDATED -> "Submission updated";
            case ROUND_OPENED -> "A SEAL round is now open";
            case ROUND_CLOSED -> "A SEAL round has closed";
            case SUBMISSION_LOCKED -> "Submission window locked";
            case MENTOR_FEEDBACK_PUBLISHED, MENTOR_FEEDBACK -> "Mentor feedback is available";
            case JUDGE_ASSIGNED -> "You have assigned submissions to review";
            case ANNOUNCEMENT_PUBLISHED -> "New SEAL announcement";
            case DEADLINE_REMINDER, SUBMISSION_REMINDER, JUDGING_REMINDER -> "SEAL deadline reminder";
            default -> "SEAL notification";
        };
    }

    private NotificationResponse toInboxResponse(NotificationRecipient recipient) {
        return toResponse(recipient.getNotification(), recipient.isRead());
    }

    private NotificationResponse toResponse(Notification notification, Boolean read) {
        return new NotificationResponse(
                notification.getId(),
                notification.getEvent() == null ? null : notification.getEvent().getId(),
                notification.getType() == null ? null : notification.getType().name(),
                notification.getTitle(),
                notification.getBody(),
                notification.getTargetScope() == null ? null : notification.getTargetScope().name(),
                notification.getTargetId(),
                notification.getChannel() == null ? null : notification.getChannel().name(),
                notification.getStatus() == null ? null : notification.getStatus().name(),
                notification.getScheduledAt(),
                notification.getSentAt(),
                Boolean.TRUE.equals(read)
        );
    }

    private Map<String, Object> auditState(Notification notification) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("type", notification.getType() == null ? null : notification.getType().name());
        map.put("title", notification.getTitle());
        map.put("targetScope", notification.getTargetScope() == null ? null : notification.getTargetScope().name());
        map.put("targetId", notification.getTargetId() == null ? null : notification.getTargetId().toString());
        map.put("channel", notification.getChannel() == null ? null : notification.getChannel().name());
        map.put("status", notification.getStatus() == null ? null : notification.getStatus().name());
        map.put("recipientCount", notification.getRecipientCount());
        return map;
    }

    private void ensureCanManage(User user) {
        if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.COORDINATOR) {
            throw new UnauthorizedException("Only admin or coordinator can manage notifications.");
        }
    }

    private String trimRequired(String value, String field) {
        if (value == null || value.isBlank()) throw new BadRequestException(field + " is required.");
        return value.trim();
    }

    private <T extends Enum<T>> T parseEnum(Class<T> type, String value, String label) {
        if (value == null || value.isBlank()) throw new BadRequestException(label + " is required.");
        try {
            return Enum.valueOf(type, value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid " + label + ": " + value);
        }
    }

    private String escape(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }
}
