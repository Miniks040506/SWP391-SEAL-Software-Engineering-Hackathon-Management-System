package com.t7.seal.service.impl;

import com.t7.seal.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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
                "Login Successful",
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

    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);
        } catch (MessagingException ex) {
            throw new IllegalStateException("Cannot build email message.", ex);
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
                                                FPT University HCM · Software Engineering Agile League
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