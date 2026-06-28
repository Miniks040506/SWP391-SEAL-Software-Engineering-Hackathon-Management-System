package com.t7.seal.service.impl;

import com.t7.seal.exception.ExternalServiceException;
import com.t7.seal.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.application.name:SEAL Hackathon}")
    private String appName;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void sendVerificationCode(
            String to,
            String fullName,
            String code,
            int expiresInMinutes
    ) {
        String safeName = escapeHtml(displayName(fullName));

        String html = buildBaseTemplate(
                "Email Verification",
                "Complete your SEAL registration",
                """
                        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                            Hello <strong>%s</strong>,
                        </p>
                        
                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            Welcome to <strong>SEAL Hackathon System</strong>. Use the verification code below to confirm your email address.
                        </p>
                        
                        <div style="margin:26px 0;text-align:center;">
                            <div style="display:inline-block;background:#eff6ff;border:1px solid #bfdbfe;border-radius:18px;padding:18px 30px;">
                                <div style="font-size:12px;font-weight:800;letter-spacing:0.18em;color:#2563eb;text-transform:uppercase;margin-bottom:8px;">
                                    Verification Code
                                </div>
                                <div style="font-size:34px;font-weight:900;letter-spacing:0.28em;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
                                    %s
                                </div>
                            </div>
                        </div>
                        
                        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                            This code expires in <strong>%d minutes</strong>. If you did not create a SEAL account, you can safely ignore this email.
                        </p>
                        """.formatted(safeName, escapeHtml(code), expiresInMinutes)
        );

        sendHtml(to, appName + " - Email Verification Code", html);
    }

    @Override
    public void sendPasswordResetCode(
            String to,
            String fullName,
            String code,
            int expiresInMinutes
    ) {
        String safeName = escapeHtml(displayName(fullName));

        String html = buildBaseTemplate(
                "Password Reset",
                "Secure your SEAL account",
                """
                        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                            Hello <strong>%s</strong>,
                        </p>
                        
                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            We received a request to reset your SEAL account password. Use the code below to continue.
                        </p>
                        
                        <div style="margin:26px 0;text-align:center;">
                            <div style="display:inline-block;background:#fff7ed;border:1px solid #fed7aa;border-radius:18px;padding:18px 30px;">
                                <div style="font-size:12px;font-weight:800;letter-spacing:0.18em;color:#ea580c;text-transform:uppercase;margin-bottom:8px;">
                                    Reset Code
                                </div>
                                <div style="font-size:34px;font-weight:900;letter-spacing:0.28em;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
                                    %s
                                </div>
                            </div>
                        </div>
                        
                        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                            This reset code expires in <strong>%d minutes</strong>. If you did not request this reset, please ignore this email.
                        </p>
                        """.formatted(safeName, escapeHtml(code), expiresInMinutes)
        );

        sendHtml(to, appName + " - Password Reset Code", html);
    }

    @Override
    public void sendGuestJudgeSetupEmail(
            String to,
            String fullName,
            String code,
            LocalDateTime expiresAt,
            String setupPath
    ) {
        String safeName = escapeHtml(displayName(fullName));
        String safeExpiresAt = expiresAt == null
                ? "the account setup deadline"
                : escapeHtml(expiresAt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        String setupUrl = setupPath != null && setupPath.startsWith("http")
                ? setupPath
                : frontendUrl + (setupPath == null ? "/reset-password" : setupPath);

        String html = buildBaseTemplate(
                "Guest Judge Account",
                "Set your SEAL judge account password",
                """
                        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                            Hello <strong>%s</strong>,
                        </p>

                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            A coordinator created a guest judge account for you in <strong>SEAL Hackathon System</strong>.
                        </p>

                        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                            Use this setup code to set your password before <strong>%s</strong>.
                        </p>

                        <div style="margin:26px 0;text-align:center;">
                            <div style="display:inline-block;background:#eff6ff;border:1px solid #bfdbfe;border-radius:18px;padding:18px 30px;">
                                <div style="font-size:12px;font-weight:800;letter-spacing:0.18em;color:#2563eb;text-transform:uppercase;margin-bottom:8px;">
                                    Setup Code
                                </div>
                                <div style="font-size:34px;font-weight:900;letter-spacing:0.28em;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
                                    %s
                                </div>
                            </div>
                        </div>

                        <div style="text-align:center;margin-top:28px;">
                            <a href="%s"
                               style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;">
                                Set Password
                            </a>
                        </div>
                        """.formatted(
                        safeName,
                        safeExpiresAt,
                        escapeHtml(code),
                        escapeHtml(setupUrl)
                )
        );

        sendHtml(to, appName + " - Guest Judge Account Setup", html);
    }

    @Override
    public void sendOAuthLoginSuccessEmail(
            String to,
            String fullName,
            String providerName
    ) {
        String safeName = escapeHtml(displayName(fullName));
        String safeProvider = escapeHtml(providerName);
        String loginTime = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        String html = buildBaseTemplate(
                "Welcome to SEAL",
                "Your SEAL account was accessed securely",
                """
                        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                            Hello <strong>%s</strong>,
                        </p>
                        
                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            Your SEAL account has just been signed in successfully using <strong>%s</strong>.
                        </p>
                        
                        <div style="margin:24px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:18px;">
                            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:700;">Provider</td>
                                    <td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:800;text-align:right;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:700;">Email</td>
                                    <td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:800;text-align:right;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:700;">Time</td>
                                    <td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:800;text-align:right;">%s</td>
                                </tr>
                            </table>
                        </div>
                        
                        <p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.7;">
                            If this was you, no further action is needed. If you did not perform this login, please change your password or contact the SEAL support team immediately.
                        </p>
                        
                        <div style="text-align:center;margin-top:28px;">
                            <a href="%s"
                               style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;">
                                Open SEAL Portal
                            </a>
                        </div>
                        """.formatted(
                        safeName,
                        safeProvider,
                        safeProvider,
                        escapeHtml(to),
                        escapeHtml(loginTime),
                        escapeHtml(frontendUrl)
                )
        );

        sendHtml(to, appName + " - Login Successful via " + providerName, html);
    }

    @Override
    public void sendTeamInvitationSent(
            String to,
            String inviteeName,
            String teamName,
            String invitedByName,
            String acceptUrl,
            String rejectUrl,
            LocalDateTime expiresAt
    ) {
        String safeInviteeName = escapeHtml(displayName(inviteeName));
        String safeTeamName = escapeHtml(teamName);
        String safeInvitedByName = escapeHtml(displayName(invitedByName));
        String safeExpiresAt = expiresAt == null
                ? "the invitation deadline"
                : escapeHtml(expiresAt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        String html = buildBaseTemplate(
                "Team Invitation",
                "You have been invited to join a SEAL team",
                """
                        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                            Hello <strong>%s</strong>,
                        </p>
                        
                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            <strong>%s</strong> invited you to join team <strong>%s</strong>.
                        </p>

                        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:18px 20px;margin:24px 0;">
                            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:800;text-transform:uppercase;">Team</td>
                                    <td align="right" style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:900;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:800;text-transform:uppercase;">Invited by</td>
                                    <td align="right" style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:900;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:800;text-transform:uppercase;">Expires</td>
                                    <td align="right" style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:900;">%s</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="text-align:center;margin:28px 0;">
                            <a href="%s"
                               style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;margin:0 6px 10px;">
                                Accept Invitation
                            </a>
                            <a href="%s"
                               style="display:inline-block;background:#ef4444;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;margin:0 6px 10px;">
                                Reject Invitation
                            </a>
                        </div>
                        """.formatted(
                        safeInviteeName,
                        safeInvitedByName,
                        safeTeamName,
                        safeTeamName,
                        safeInvitedByName,
                        safeExpiresAt,
                        escapeHtml(acceptUrl),
                        escapeHtml(rejectUrl)
                )
        );

        sendHtml(to, appName + " - Invitation to join " + teamName, html);
    }

    @Override
    public void sendTeamInvitationAccepted(
            String to,
            List<String> cc,
            String teamName,
            String acceptedMemberName,
            String teamUrl
    ) {
        String safeTeamName = escapeHtml(teamName);
        String safeAcceptedMemberName = escapeHtml(displayName(acceptedMemberName));

        String html = buildBaseTemplate(
                "New Team Member",
                "A team invitation was accepted",
                """
                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            A new member has joined your SEAL team.
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

                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            The team roster has been updated. Active team members are copied when available.
                        </p>

                        <div style="text-align:center;margin-top:28px;">
                            <a href="%s"
                               style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;">
                                Open Team
                            </a>
                        </div>
                        """.formatted(
                        safeAcceptedMemberName,
                        safeTeamName,
                        escapeHtml(teamUrl)
                )
        );

        sendHtml(to, cc, appName + " - " + acceptedMemberName + " joined " + teamName, html);
    }

    @Override
    public void sendTeamInvitationRejected(
            String to,
            String teamName,
            String inviteeEmail,
            String manageInvitationsUrl
    ) {
        String safeTeamName = escapeHtml(teamName);
        String safeInviteeEmail = escapeHtml(inviteeEmail);

        String html = buildBaseTemplate(
                "Invitation Declined",
                "A team invitation was declined",
                """
                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            <strong>%s</strong> declined the invitation to join team <strong>%s</strong>.
                        </p>
                        
                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            You can invite another member or review pending invitations from the team management page.
                        </p>
                        
                        <div style="text-align:center;margin-top:28px;">
                            <a href="%s"
                               style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;">
                                Open Team
                            </a>
                        </div>
                        """.formatted(
                        safeInviteeEmail,
                        safeTeamName,
                        escapeHtml(manageInvitationsUrl)
                )
        );

        sendHtml(to, appName + " - " + inviteeEmail + " declined invitation to " + teamName, html);
    }

    @Override
    public void sendTeamRegisterEmail(
            String leaderEmail,
            List<String> cc,
            String leaderName,
            String teamName,
            String eventName,
            String trackName
    ) {
        String safeLeaderName = escapeHtml(displayName(leaderName));
        String safeTeamName = escapeHtml(teamName);
        String safeEventName = escapeHtml(eventName);
        String safeTrackName = escapeHtml(trackName);
        String teamUrl = frontendUrl + "/participant/teams";

        String html = buildBaseTemplate(
                "Team Registered",
                "Your team registration is confirmed",
                """
                        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                            Hello <strong>%s</strong>,
                        </p>

                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            Team <strong>%s</strong> has been registered successfully for track <strong>%s</strong> in <strong>%s</strong>.
                        </p>

                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            All active team members are copied on this email according to the SEAL team communication rule.
                        </p>

                        <div style="text-align:center;margin-top:28px;">
                            <a href="%s"
                               style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;">
                                Open My Teams
                            </a>
                        </div>
                        """.formatted(
                        safeLeaderName,
                        safeTeamName,
                        safeTrackName,
                        safeEventName,
                        escapeHtml(teamUrl)
                )
        );

        sendHtml(leaderEmail, cc, appName + " - Team registered: " + teamName, html);
    }

    @Override
    public void sendTeamJoinRequestReceived(
            String leaderEmail,
            String leaderName,
            String requesterName,
            String requesterEmail,
            String teamName,
            String message,
            String acceptUrl,
            String rejectUrl,
            LocalDateTime expiresAt
    ) {
        String safeLeaderName = escapeHtml(displayName(leaderName));
        String safeRequesterName = escapeHtml(displayName(requesterName));
        String safeRequesterEmail = escapeHtml(requesterEmail == null ? "" : requesterEmail);
        String safeTeamName = escapeHtml(teamName);
        String safeMessage = message == null || message.isBlank()
                ? "No additional message was provided."
                : escapeHtml(message).replace("\n", "<br/>");
        String safeExpiresAt = expiresAt == null
                ? "the request deadline"
                : escapeHtml(expiresAt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        String html = buildBaseTemplate(
                "Join Request",
                "A student wants to join your team",
                """
                        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                            Hello <strong>%s</strong>,
                        </p>

                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            <strong>%s</strong> sent a request to join team <strong>%s</strong>.
                        </p>

                        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:18px 20px;margin:24px 0;">
                            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:800;text-transform:uppercase;">Requester</td>
                                    <td align="right" style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:900;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:800;text-transform:uppercase;">Email</td>
                                    <td align="right" style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:900;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:800;text-transform:uppercase;">Team</td>
                                    <td align="right" style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:900;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:800;text-transform:uppercase;">Expires</td>
                                    <td align="right" style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:900;">%s</td>
                                </tr>
                            </table>
                        </div>

                        <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:16px;padding:16px 18px;margin:24px 0;color:#334155;font-size:14px;line-height:1.7;">
                            <div style="font-size:12px;font-weight:900;color:#4f46e5;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">Message</div>
                            %s
                        </div>

                        <div style="text-align:center;margin:28px 0;">
                            <a href="%s"
                               style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;margin:0 6px 10px;">
                                Accept Request
                            </a>
                            <a href="%s"
                               style="display:inline-block;background:#ef4444;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;margin:0 6px 10px;">
                                Reject Request
                            </a>
                        </div>
                        """.formatted(
                        safeLeaderName,
                        safeRequesterName,
                        safeTeamName,
                        safeRequesterName,
                        safeRequesterEmail,
                        safeTeamName,
                        safeExpiresAt,
                        safeMessage,
                        escapeHtml(acceptUrl),
                        escapeHtml(rejectUrl)
                )
        );

        sendHtml(leaderEmail, appName + " - Join request for " + teamName, html);
    }

    @Override
    public void sendTeamJoinRequestAccepted(
            String requesterEmail,
            String requesterName,
            String teamName,
            String teamUrl
    ) {
        String safeRequesterName = escapeHtml(displayName(requesterName));
        String safeTeamName = escapeHtml(teamName);

        String html = buildBaseTemplate(
                "Join Request Accepted",
                "You are now a member of the team",
                """
                        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                            Hello <strong>%s</strong>,
                        </p>

                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            Your request to join team <strong>%s</strong> has been accepted. You can now view the team workspace and participate as a member.
                        </p>

                        <div style="text-align:center;margin-top:28px;">
                            <a href="%s"
                               style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;">
                                Open Team
                            </a>
                        </div>
                        """.formatted(
                        safeRequesterName,
                        safeTeamName,
                        escapeHtml(teamUrl)
                )
        );

        sendHtml(requesterEmail, appName + " - Join request accepted: " + teamName, html);
    }

    @Override
    public void sendTeamJoinRequestRejected(
            String requesterEmail,
            String requesterName,
            String teamName,
            String reason,
            String teamsUrl
    ) {
        String safeRequesterName = escapeHtml(displayName(requesterName));
        String safeTeamName = escapeHtml(teamName);
        String reasonHtml = reason == null || reason.isBlank()
                ? "The team leader did not provide an additional reason."
                : escapeHtml(reason).replace("\n", "<br/>");

        String html = buildBaseTemplate(
                "Join Request Rejected",
                "Your request could not be approved",
                """
                        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                            Hello <strong>%s</strong>,
                        </p>

                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            Your request to join team <strong>%s</strong> was rejected.
                        </p>

                        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:16px 18px;margin:24px 0;color:#334155;font-size:14px;line-height:1.7;">
                            <div style="font-size:12px;font-weight:900;color:#ea580c;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">Leader response</div>
                            %s
                        </div>

                        <div style="text-align:center;margin-top:28px;">
                            <a href="%s"
                               style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;">
                                Browse Teams
                            </a>
                        </div>
                        """.formatted(
                        safeRequesterName,
                        safeTeamName,
                        reasonHtml,
                        escapeHtml(teamsUrl)
                )
        );

        sendHtml(requesterEmail, appName + " - Join request rejected: " + teamName, html);
    }

    @Override
    public void sendJudgeAssignedEmail(
            String to,
            String judgeName,
            String eventName,
            String roundName,
            String trackName
    ) {
        String safeJudgeName = escapeHtml(displayName(judgeName));
        String safeEventName = escapeHtml(eventName);
        String safeRoundName = escapeHtml(roundName);
        String safeTrackName = escapeHtml(trackName);
        String judgeUrl = frontendUrl + "/judge/submissions";

        String html = buildBaseTemplate(
                "Judge Assignment",
                "You have assigned submissions to review",
                """
                        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
                            Hello <strong>%s</strong>,
                        </p>

                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            You have been assigned as a judge for <strong>%s</strong>.
                        </p>

                        <div style="margin:24px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:18px;">
                            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:700;">Round</td>
                                    <td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:800;text-align:right;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:700;">Track</td>
                                    <td style="padding:8px 0;color:#0f172a;font-size:13px;font-weight:800;text-align:right;">%s</td>
                                </tr>
                            </table>
                        </div>

                        <div style="text-align:center;margin-top:28px;">
                            <a href="%s"
                               style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;">
                                Open Assigned Submissions
                            </a>
                        </div>
                        """.formatted(
                        safeJudgeName,
                        safeEventName,
                        safeRoundName,
                        safeTrackName,
                        escapeHtml(judgeUrl)
                )
        );

        sendHtml(to, appName + " - Judge assignment for " + eventName, html);
    }


    @Override
    public void sendNotificationEmail(
            String to,
            List<String> cc,
            String subject,
            String title,
            String body,
            String actionUrl
    ) {
        String safeTitle = escapeHtml(title == null || title.isBlank() ? "SEAL Notification" : title);
        String safeBody = escapeHtml(body == null ? "" : body).replace("\n", "<br/>");
        String actionHtml = actionUrl == null || actionUrl.isBlank()
                ? ""
                : """
                    <div style="text-align:center;margin-top:28px;">
                        <a href="%s"
                           style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:12px;">
                            Open in SEAL
                        </a>
                    </div>
                    """.formatted(escapeHtml(actionUrl));

        String html = buildBaseTemplate(
                safeTitle,
                "SEAL system notification",
                """
                        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
                            %s
                        </p>
                        %s
                        """.formatted(safeBody, actionHtml)
        );

        sendHtml(to, cc == null ? List.of() : cc, subject == null || subject.isBlank() ? appName + " - Notification" : subject, html);
    }

    @Override
    public void sendRawHtmlEmail(
            String to,
            List<String> cc,
            String subject,
            String html
    ) {
        sendHtml(to, cc == null ? List.of() : cc, subject, html);
    }

    private void sendHtml(String to, String subject, String html) {
        sendHtml(to, List.of(), subject, html);
    }

    private void sendHtml(String to, List<String> cc, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            helper.setTo(to);
            if (cc != null && !cc.isEmpty()) {
                helper.setCc(cc.toArray(String[]::new));
            }
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);
        } catch (MessagingException | MailException ex) {
            throw new ExternalServiceException("Email delivery service is unavailable.", ex);
        }
    }

    private String buildBaseTemplate(String title, String subtitle, String contentHtml) {
        return """
                <!doctype html>
                <html>
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
                    <div style="display:none;max-height:0;overflow:hidden;color:transparent;">
                        %s
                    </div>
                
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0"
                                       style="max-width:620px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 18px 45px rgba(15,23,42,0.08);">
                
                                    <tr>
                                        <td style="background:linear-gradient(135deg,#2563eb,#3b82f6,#60a5fa);padding:34px 34px 30px;">
                                            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td>
                                                        <div style="display:inline-block;background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.3);border-radius:16px;padding:10px 14px;color:#ffffff;font-weight:900;font-size:20px;letter-spacing:-0.04em;">
                                                            SEAL
                                                        </div>
                                                    </td>
                                                    <td align="right" style="color:#dbeafe;font-size:11px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">
                                                        Hackathon System
                                                    </td>
                                                </tr>
                                            </table>
                
                                            <h1 style="margin:28px 0 8px;color:#ffffff;font-size:28px;line-height:1.15;font-weight:900;letter-spacing:-0.04em;">
                                                %s
                                            </h1>
                
                                            <p style="margin:0;color:#dbeafe;font-size:15px;line-height:1.6;font-weight:600;">
                                                %s
                                            </p>
                                        </td>
                                    </tr>
                
                                    <tr>
                                        <td style="padding:34px;">
                                            %s
                                        </td>
                                    </tr>
                
                                    <tr>
                                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:26px 34px;">
                                            <p style="margin:0 0 8px;color:#0f172a;font-size:14px;font-weight:900;">
                                                Best regards,
                                            </p>
                                            <p style="margin:0;color:#334155;font-size:14px;font-weight:800;">
                                                SEAL Hackathon Team
                                            </p>
                                            <p style="margin:8px 0 0;color:#64748b;font-size:12px;line-height:1.6;">
                                                FPT University HCM - Software Engineering Agile League
                                            </p>
                                            <p style="margin:16px 0 0;color:#94a3b8;font-size:11px;line-height:1.6;">
                                                This is an automated email. Please do not reply directly to this message.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(
                escapeHtml(title),
                escapeHtml(subtitle),
                escapeHtml(title),
                escapeHtml(subtitle),
                contentHtml
        );
    }

    private String displayName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "there";
        }

        return fullName.trim();
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
