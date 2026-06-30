package com.t7.seal.service.impl;

import com.t7.seal.domain.*;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.repository.*;
import com.t7.seal.request.system.CreateNotificationRequest;
import com.t7.seal.request.system.TestEmailRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.*;
import com.t7.seal.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
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
    private final TeamRepository teamRepository;
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

        return createSystemNotification(
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
    }

    @Override
    @Transactional
    public NotificationResponse createSystemNotification(
            User actor,
            HackathonEvent event,
            NotificationType type,
            String title,
            String body,
            NotificationTargetScope targetScope,
            UUID targetId,
            String role,
            NotificationChannel channel,
            LocalDateTime scheduledAt
    ) {
        if (actor == null) {
            throw new BadRequestException("Notification actor is required.");
        }
        Notification notification = Notification.builder()
                .event(event)
                .createdBy(actor)
                .type(type)
                .title(trimRequired(title, "title"))
                .body(trimRequired(body, "body"))
                .targetScope(targetScope)
                .targetId(targetId)
                .targetRole(role)
                .channel(channel == null ? NotificationChannel.BOTH : channel)
                .scheduledAt(scheduledAt)
                .status(scheduledAt == null ? NotificationStatus.DRAFT : NotificationStatus.SCHEDULED)
                .build();

        Notification saved = notificationRepository.save(notification);
        auditLogService.record(actor, AuditActionType.NOTIFICATION_CREATED, "notifications", saved.getId(), null, auditState(saved), null);

        if (scheduledAt == null) {
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
        NotificationRecipient recipient = notificationRecipientRepository.findActiveByNotificationIdAndUserId(notificationId, user.getId())
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
        NotificationRecipient recipient = notificationRecipientRepository.findActiveByNotificationIdAndUserId(notificationId, user.getId())
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
    @Transactional
    public void deleteNotification(UUID notificationId, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        int affected = notificationRecipientRepository.softDeleteOne(user.getId(), notificationId, LocalDateTime.now());
        if (affected == 0) {
            throw new NotFoundException("Notification not found " + notificationId);
        }
        auditLogService.record(user, AuditActionType.NOTIFICATION_DELETED, "notifications", notificationId, null,
                Map.of("deletedForUserId", user.getId().toString()), null);
    }

    @Override
    @Transactional
    public int clearMyNotifications(Boolean read, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        int affected = notificationRecipientRepository.softDeleteInbox(user.getId(), read, LocalDateTime.now());
        auditLogService.record(user, AuditActionType.NOTIFICATION_CLEARED, "notification_recipients", user.getId(), null,
                Map.of("deletedCount", affected, "read", read == null ? "ALL" : read.toString()), null);
        return affected;
    }

    @Override
    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        return new UnreadCountResponse(notificationRecipientRepository.countByUserIdAndReadAtIsNullAndDeletedAtIsNull(user.getId()));
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
        dispatchQueuedEmails();
    }

    @Override
    @Transactional
    public void dispatchQueuedEmails() {
        List<EmailOutbox> queued = emailOutboxRepository.findTop50ByStatusInAndScheduledAtLessThanEqualOrderByCreatedAtAsc(
                List.of(EmailDeliveryStatus.PENDING, EmailDeliveryStatus.FAILED, EmailDeliveryStatus.RETRYING),
                LocalDateTime.now()
        );
        for (EmailOutbox outbox : queued) {
            if (outbox.getStatus() == EmailDeliveryStatus.SENT) {
                continue;
            }
            if (outbox.getAttemptCount() != null && outbox.getAttemptCount() >= MAX_EMAIL_ATTEMPTS) {
                continue;
            }
            try {
                outbox.setStatus(EmailDeliveryStatus.RETRYING);
                emailOutboxRepository.save(outbox);
                sendOutbox(outbox);
            } catch (RuntimeException ex) {
                log.warn(
                        "Queued email dispatch failed. outboxId={}",
                        outbox.getId(),
                        ex
                );
            }
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
            inAppCount = createInAppRecipients(saved, resolveInAppRecipients(saved, resolved));
        }

        String emailFailure = null;
        int emailSuccess = 0;
        if (saved.usesEmailChannel()) {
            EmailDispatchResult dispatchResult = createAndSendEmails(saved, resolved);
            emailSuccess = dispatchResult.successCount();
            if (!dispatchResult.failures().isEmpty()) {
                emailFailure = String.join("; ", dispatchResult.failures());
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

    private List<NotificationRecipientResponse> resolveInAppRecipients(
            Notification notification,
            NotificationRecipientResolutionResponse resolved
    ) {
        if (notification.getType() == NotificationType.TEAM_INVITATION_SENT
                && notification.getTargetScope() == NotificationTargetScope.SINGLE_USER
                && notification.getTargetId() != null) {
            return userRepository.findById(notification.getTargetId())
                    .filter(this::canReceiveInvitationNotification)
                    .map(user -> List.of(toRecipientResponse(user, "IN_APP")))
                    .orElseGet(List::of);
        }
        return resolved.inAppRecipients();
    }

    private int createInAppRecipients(Notification notification, List<NotificationRecipientResponse> recipients) {
        int count = 0;
        for (UUID userId : dedupeUserIds(recipients)) {
            User user = userRepository.findById(userId).orElse(null);
            if (!canCreateInAppRecipient(notification, user)) continue;
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

    private boolean canCreateInAppRecipient(Notification notification, User user) {
        if (user == null) {
            return false;
        }
        if (notification.getType() == NotificationType.TEAM_INVITATION_SENT) {
            return canReceiveInvitationNotification(user);
        }
        return user.isActive();
    }

    private boolean canReceiveInvitationNotification(User user) {
        return user != null
                && user.getEmail() != null
                && !user.getEmail().isBlank()
                && user.getStatus() != UserStatus.SUSPENDED
                && user.getStatus() != UserStatus.DEACTIVATED;
    }

    private NotificationRecipientResponse toRecipientResponse(User user, String deliveryRole) {
        return new NotificationRecipientResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole() == null ? null : user.getRole().name(),
                user.getStatus() == null ? null : user.getStatus().name(),
                deliveryRole
        );
    }

    private EmailDispatchResult createAndSendEmails(Notification notification, NotificationRecipientResolutionResponse resolved) {
        List<EmailEnvelope> envelopes = buildEmailEnvelopes(notification, resolved);
        int success = 0;
        List<String> failures = new ArrayList<>();

        for (EmailEnvelope envelope : envelopes) {
            String subject = renderSubject(notification);
            String actionUrl = renderActionUrl(notification);
            String html = renderEmailHtml(notification, actionUrl);
            String idempotencyKey = notification.getId() + ":" + envelope.to() + ":" + String.join(",", envelope.cc());

            EmailOutbox outbox = emailOutboxRepository.findByIdempotencyKey(idempotencyKey)
                    .orElseGet(() -> emailOutboxRepository.save(EmailOutbox.builder()
                            .notification(notification)
                            .toEmail(envelope.to())
                            .ccEmails(String.join(",", envelope.cc()))
                            .subject(subject)
                            .htmlBody(html)
                            .scheduledAt(notification.getScheduledAt() == null ? LocalDateTime.now() : notification.getScheduledAt())
                            .idempotencyKey(idempotencyKey)
                            .status(EmailDeliveryStatus.PENDING)
                            .build()));

            if (outbox.getStatus() == EmailDeliveryStatus.SENT) {
                success++;
                continue;
            }

            try {
                sendOutbox(outbox);
                success++;
            } catch (RuntimeException ex) {
                failures.add(envelope.to() + ": " + ex.getMessage());
            }
        }

        return new EmailDispatchResult(success, failures);
    }

    private List<EmailEnvelope> buildEmailEnvelopes(Notification notification, NotificationRecipientResolutionResponse resolved) {
        if (resolved.to() == null || resolved.to().isEmpty()) {
            return List.of();
        }

        if (notification.getTargetScope() == NotificationTargetScope.TEAM) {
            NotificationRecipientResponse primary = resolved.primaryRecipient() != null
                    ? resolved.primaryRecipient()
                    : resolved.to().get(0);
            if (isBlank(primary.email())) {
                return List.of();
            }

            List<String> cc = requiresTeamCc(notification.getType())
                    ? emailList(resolved.cc())
                    : List.of();
            return List.of(new EmailEnvelope(primary.email(), cc));
        }

        return emailList(resolved.to()).stream()
                .map(to -> new EmailEnvelope(to, List.of()))
                .toList();
    }

    private boolean requiresTeamCc(NotificationType type) {
        return type != NotificationType.TEAM_INVITATION_SENT
                && type != NotificationType.TEAM_INVITATION_REJECTED;
    }

    private List<String> emailList(List<NotificationRecipientResponse> recipients) {
        if (recipients == null) {
            return List.of();
        }
        return recipients.stream()
                .map(NotificationRecipientResponse::email)
                .filter(email -> !isBlank(email))
                .distinct()
                .toList();
    }

    private void sendOutbox(EmailOutbox outbox) {
        List<String> cc = parseCc(outbox.getCcEmails());
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
            auditLogService.record(outbox.getNotification().getCreatedBy(), AuditActionType.EMAIL_SENT, "email_outbox", outbox.getId(), null, Map.of("to", outbox.getToEmail(), "cc", outbox.getCcEmails() == null ? "" : outbox.getCcEmails()), null);
        } catch (RuntimeException ex) {
            outbox.markFailed(ex.getMessage());
            emailOutboxRepository.save(outbox);
            emailDeliveryLogRepository.save(EmailDeliveryLog.builder()
                    .emailOutbox(outbox)
                    .recipientEmail(outbox.getToEmail())
                    .status(EmailDeliveryStatus.FAILED)
                    .message(ex.getMessage())
                    .build());
            auditLogService.record(outbox.getNotification().getCreatedBy(), AuditActionType.EMAIL_FAILED, "email_outbox", outbox.getId(), null, Map.of("to", outbox.getToEmail(), "error", ex.getMessage()), null);
            throw ex;
        }
    }

    private List<String> parseCc(String ccEmails) {
        if (isBlank(ccEmails)) {
            return List.of();
        }
        return Arrays.stream(ccEmails.split(","))
                .map(String::trim)
                .filter(email -> !email.isBlank())
                .distinct()
                .toList();
    }

    private Set<UUID> dedupeUserIds(List<NotificationRecipientResponse> recipients) {
        if (recipients == null) return Set.of();
        return recipients.stream()
                .map(NotificationRecipientResponse::userId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String renderSubject(Notification notification) {
        if (notification.getType() == NotificationType.TEAM_INVITATION_ACCEPTED) {
            Map<String, String> values = templateValues(notification, renderTargetPath(notification));
            return valueOrDefault(values, "memberName", "A member")
                    + " joined "
                    + valueOrDefault(values, "teamName", "your team");
        }
        if (notification.getType() == NotificationType.TEAM_INVITATION_REJECTED) {
            Map<String, String> values = templateValues(notification, renderTargetPath(notification));
            String invitee = valueOrDefault(values, "inviteeEmail", valueOrDefault(values, "memberName", "A member"));
            return invitee + " declined invitation to " + valueOrDefault(values, "teamName", "your team");
        }

        String template = notificationTemplateRepository.findByTypeAndActiveTrue(notification.getType())
                .map(NotificationTemplate::getSubjectTemplate)
                .orElse(null);
        String rendered = renderTemplate(template, notification, renderTargetPath(notification));
        if (isBlank(rendered) || containsUnresolvedPlaceholder(rendered)) {
            rendered = notification.getTitle();
        }
        if (isBlank(rendered) || containsUnresolvedPlaceholder(rendered)) {
            rendered = defaultSubject(notification.getType());
        }
        return rendered;
    }

    private String renderEmailHtml(Notification notification, String actionUrl) {
        if (notification.getType() == NotificationType.TEAM_INVITATION_ACCEPTED) {
            return renderTeamInvitationAcceptedEmail(notification, actionUrl);
        }
        if (notification.getType() == NotificationType.TEAM_INVITATION_REJECTED) {
            return renderTeamInvitationRejectedEmail(notification, actionUrl);
        }

        Optional<NotificationTemplate> template = notificationTemplateRepository.findByTypeAndActiveTrue(notification.getType());
        if (template.isPresent() && !isBlank(template.get().getHtmlTemplate())) {
            String html = renderTemplate(template.get().getHtmlTemplate(), notification, actionUrl);
            if (!containsUnresolvedPlaceholder(html)) {
                return html;
            }
        }

        String bodyTemplate = template
                .map(NotificationTemplate::getBodyTemplate)
                .filter(value -> !isBlank(value))
                .orElse(notification.getBody());
        String renderedBody = renderTemplate(bodyTemplate, notification, actionUrl);
        if (isBlank(renderedBody) || containsUnresolvedPlaceholder(renderedBody)) {
            renderedBody = notification.getBody();
        }
        String body = nullToEmpty(renderedBody).replace("\n", "<br/>");
        return renderNotificationEmailShell(notification.getTitle(), "Hackathon System Notification", body, actionUrl, "Open in SEAL");
    }

    private String renderTeamInvitationAcceptedEmail(Notification notification, String actionUrl) {
        Map<String, String> values = templateValues(notification, actionUrl);
        String memberName = valueOrDefault(values, "memberName", "A member");
        String teamName = valueOrDefault(values, "teamName", "your team");
        String body = """
                <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                  Hello,
                </p>
                <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                  <strong>%s</strong> accepted the invitation to join team <strong>%s</strong>.
                </p>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:18px 20px;margin:24px 0;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:800;text-transform:uppercase;">New member</td>
                      <td align="right" style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:900;">%s</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:800;text-transform:uppercase;">Team</td>
                      <td align="right" style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:900;">%s</td>
                    </tr>
                  </table>
                </div>
                <p style="margin:0;color:#475569;font-size:15px;line-height:1.7;">
                  The team roster has been updated. Active team members are copied on this email when available.
                </p>
                """.formatted(escape(memberName), escape(teamName), escape(memberName), escape(teamName));

        return renderNotificationEmailShell("New Team Member", "A team invitation was accepted", body, actionUrl, "Open Team");
    }

    private String renderTeamInvitationRejectedEmail(Notification notification, String actionUrl) {
        Map<String, String> values = templateValues(notification, actionUrl);
        String teamName = valueOrDefault(values, "teamName", "your team");
        String invitee = valueOrDefault(values, "inviteeEmail", valueOrDefault(values, "memberName", "A member"));
        String body = """
                <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                  Hello,
                </p>
                <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                  <strong>%s</strong> declined the invitation to join team <strong>%s</strong>.
                </p>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:18px 20px;margin:24px 0;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:800;text-transform:uppercase;">Invitee</td>
                      <td align="right" style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:900;">%s</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:800;text-transform:uppercase;">Team</td>
                      <td align="right" style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:900;">%s</td>
                    </tr>
                  </table>
                </div>
                <p style="margin:0;color:#475569;font-size:15px;line-height:1.7;">
                  You can invite another member or review pending invitations from the team page.
                </p>
                """.formatted(escape(invitee), escape(teamName), escape(invitee), escape(teamName));

        return renderNotificationEmailShell("Invitation Declined", "A team invitation was declined", body, actionUrl, "Open Team");
    }

    private String renderNotificationEmailShell(String title, String subtitle, String body, String actionUrl, String actionLabel) {
        String cta = isBlank(actionUrl) ? "" : """
                <div style="text-align:center;margin-top:28px;">
                  <a href="%s" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;font-weight:900;padding:13px 24px;border-radius:12px;">%s</a>
                </div>
                """.formatted(escape(actionUrl), escape(actionLabel));
        return """
                <!doctype html>
                <html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;"><tr><td align="center">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 18px 45px rgba(15,23,42,.08);">
                <tr><td style="background:linear-gradient(135deg,#2563eb,#3b82f6,#60a5fa);padding:34px;color:#fff;">
                  <div style="font-size:20px;font-weight:900;">SEAL</div>
                  <h1 style="margin:28px 0 8px;font-size:28px;line-height:1.15;font-weight:900;">%s</h1>
                  <p style="margin:0;color:#dbeafe;font-size:15px;font-weight:700;">%s</p>
                </td></tr>
                <tr><td style="padding:34px;color:#475569;font-size:15px;line-height:1.7;">%s%s</td></tr>
                <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:26px 34px;color:#64748b;font-size:12px;line-height:1.6;">
                  <strong style="display:block;color:#0f172a;font-size:14px;margin-bottom:8px;">SEAL Hackathon Team</strong>
                  This is an automated email. Please do not reply directly to this message.
                </td></tr></table></td></tr></table></body></html>
                """.formatted(escape(title), escape(subtitle), body, cta);
    }

    private String renderActionUrl(Notification notification) {
        String targetPath = renderTargetPath(notification);
        if (targetPath.startsWith("http")) {
            return targetPath;
        }
        return stripTrailingSlash(frontendUrl) + targetPath;
    }

    private String renderTargetPath(Notification notification) {
        if (notification.getType() == NotificationType.TEAM_INVITATION_SENT) {
            return "/participant/invitations";
        }
        if (notification.getType() == NotificationType.TEAM_JOIN_REQUEST_SENT
                || notification.getType() == NotificationType.TEAM_JOIN_REQUEST_ACCEPTED
                || notification.getType() == NotificationType.TEAM_JOIN_REQUEST_REJECTED) {
            return "/participant/teams";
        }
        if (notification.getType() == NotificationType.RESULT_PUBLISHED) {
            if (notification.getTargetScope() == NotificationTargetScope.TEAM && notification.getTargetId() != null) {
                return "/participant/teams/" + notification.getTargetId() + "/scores";
            }
            if (notification.getEvent() != null) {
                return "/events/" + notification.getEvent().getId() + "/leaderboard";
            }
            return "/standings";
        }
        if (notification.getType() == NotificationType.PRIZE_AWARDED) {
            if (notification.getEvent() != null) {
                return "/events/" + notification.getEvent().getId() + "/awards";
            }
            return "/standings";
        }
        if (notification.getType() == NotificationType.TEAM_DISQUALIFIED
                || notification.getType() == NotificationType.DISQUALIFICATION_OVERTURNED) {
            if (notification.getTargetScope() == NotificationTargetScope.TEAM && notification.getTargetId() != null) {
                return "/participant/teams/" + notification.getTargetId() + "/disqualification";
            }
            return "/notifications";
        }
        if (notification.getType() == NotificationType.SUBMISSION_SUBMITTED
                || notification.getType() == NotificationType.SUBMISSION_UPDATED) {
            if ("MENTOR".equalsIgnoreCase(notification.getTargetRole())) {
                return "/mentor/submissions";
            }
            if (notification.getTargetScope() == NotificationTargetScope.EVENT_COORDINATORS
                    || notification.getTargetScope() == NotificationTargetScope.COORDINATOR
                    || notification.getTargetScope() == NotificationTargetScope.COORDINATION) {
                return "/coordinator/submissions";
            }
            if (notification.getTargetScope() == NotificationTargetScope.TEAM && notification.getTargetId() != null) {
                return "/participant/teams/" + notification.getTargetId() + "/submissions";
            }
            return "/participant/submissions";
        }
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

    private String renderTemplate(String template, Notification notification, String actionUrl) {
        if (template == null) {
            return "";
        }
        String rendered = template;
        for (Map.Entry<String, String> entry : templateValues(notification, actionUrl).entrySet()) {
            rendered = rendered.replace("{" + entry.getKey() + "}", nullToEmpty(entry.getValue()));
        }
        return rendered.trim();
    }

    private Map<String, String> templateValues(Notification notification, String actionUrl) {
        Map<String, String> values = new LinkedHashMap<>();
        String actorName = displayName(notification.getCreatedBy());
        String actorEmail = notification.getCreatedBy() == null ? "" : notification.getCreatedBy().getEmail();

        values.put("title", notification.getTitle());
        values.put("body", notification.getBody());
        values.put("type", notification.getType() == null ? "" : notification.getType().name());
        values.put("targetScope", notification.getTargetScope() == null ? "" : notification.getTargetScope().name());
        values.put("targetId", notification.getTargetId() == null ? "" : notification.getTargetId().toString());
        values.put("eventName", notification.getEvent() == null ? "" : notification.getEvent().getName());
        values.put("actionUrl", actionUrl == null ? "" : actionUrl);
        values.put("actorName", actorName);
        values.put("actorEmail", actorEmail);
        values.put("memberName", actorName);
        values.put("inviteeEmail", actorEmail);
        values.put("teamName", resolveTeamName(notification));
        values.put("trackName", extractTrackName(notification));
        values.put("roundName", extractRoundName(notification));
        return values;
    }

    private String resolveTeamName(Notification notification) {
        if (notification.getTargetScope() == NotificationTargetScope.TEAM && notification.getTargetId() != null) {
            return teamRepository.findById(notification.getTargetId())
                    .map(Team::getName)
                    .filter(value -> !isBlank(value))
                    .orElseGet(() -> extractTeamName(notification));
        }
        return extractTeamName(notification);
    }

    private String extractTeamName(Notification notification) {
        String source = notificationText(notification);
        String lower = source.toLowerCase(Locale.ROOT);
        for (String marker : List.of(" join team ", " joined team ", " for team ", "team ")) {
            int index = lower.indexOf(marker);
            if (index >= 0) {
                String tail = source.substring(index + marker.length()).trim();
                return cleanExtractedName(tail, List.of(" has ", " using ", " for ", "."), "your team");
            }
        }
        return "your team";
    }

    private String extractTrackName(Notification notification) {
        String source = notificationText(notification);
        String lower = source.toLowerCase(Locale.ROOT);
        int index = lower.indexOf(" track ");
        if (index < 0) {
            return "";
        }
        String tail = source.substring(index + " track ".length()).trim();
        return cleanExtractedName(tail, List.of(" in ", " for ", "."), "");
    }

    private String extractRoundName(Notification notification) {
        String source = notificationText(notification);
        String lower = source.toLowerCase(Locale.ROOT);
        int index = lower.indexOf(" round ");
        if (index < 0 && lower.startsWith("round ")) {
            index = 0;
        }
        if (index < 0) {
            return "";
        }
        String tail = source.substring(index + (index == 0 ? "round ".length() : " round ".length())).trim();
        return cleanExtractedName(tail, List.of(" is ", " has ", " for ", " of ", "."), "");
    }

    private String notificationText(Notification notification) {
        return (nullToEmpty(notification.getTitle()) + " " + nullToEmpty(notification.getBody())).trim();
    }

    private String cleanExtractedName(String value, List<String> endings, String fallback) {
        String result = value;
        String lower = result.toLowerCase(Locale.ROOT);
        for (String ending : endings) {
            int index = lower.indexOf(ending);
            if (index >= 0) {
                result = result.substring(0, index);
                break;
            }
        }
        result = result.trim();
        return result.isBlank() ? fallback : result;
    }

    private String displayName(User user) {
        if (user == null) {
            return "A member";
        }
        if (!isBlank(user.getFullName())) {
            return user.getFullName();
        }
        if (!isBlank(user.getEmail())) {
            return user.getEmail();
        }
        return "A member";
    }

    private boolean containsUnresolvedPlaceholder(String value) {
        return value != null && value.matches(".*\\{[A-Za-z0-9_]+}.*");
    }

    private String defaultSubject(NotificationType type) {
        return switch (type) {
            case TEAM_INVITATION_SENT -> "You are invited to join a SEAL team";
            case TEAM_INVITATION_ACCEPTED -> "A member accepted the team invitation";
            case TEAM_INVITATION_REJECTED -> "A team invitation was declined";
            case TEAM_REGISTERED -> "Your team registration is confirmed";
            case TEAM_JOIN_REQUEST_SENT -> "A student requested to join your team";
            case TEAM_JOIN_REQUEST_ACCEPTED -> "Your team join request was accepted";
            case TEAM_JOIN_REQUEST_REJECTED -> "Your team join request was rejected";
            case SUBMISSION_SUBMITTED -> "Submission received";
            case SUBMISSION_UPDATED -> "Submission updated";
            case ROUND_OPENED -> "A SEAL round is now open";
            case ROUND_CLOSED -> "A SEAL round has closed";
            case SUBMISSION_LOCKED -> "Submission window locked";
            case MENTOR_FEEDBACK_PUBLISHED, MENTOR_FEEDBACK -> "Mentor feedback is available";
            case JUDGE_ASSIGNED -> "You have assigned submissions to review";
            case ANNOUNCEMENT_PUBLISHED -> "New SEAL announcement";
            case RESULT_PUBLISHED -> "SEAL results are published";
            case PRIZE_AWARDED -> "SEAL prize awarded";
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
                renderTargetPath(notification),
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
            throw new ForbiddenException("Only admin or coordinator can manage notifications.");
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

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private String valueOrDefault(Map<String, String> values, String key, String fallback) {
        String value = values.get(key);
        return isBlank(value) ? fallback : value;
    }

    private String stripTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String result = value.trim();
        while (result.endsWith("/")) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }

    private String escape(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }

    private record EmailEnvelope(String to, List<String> cc) {
    }

    private record EmailDispatchResult(int successCount, List<String> failures) {
    }
}
