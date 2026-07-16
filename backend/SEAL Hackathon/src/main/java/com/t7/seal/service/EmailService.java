package com.t7.seal.service;

import java.time.LocalDateTime;
import java.util.List;

public interface EmailService {

    void sendVerificationCode(String to, String fullName, String code, int expiresInMinutes);

    void sendPasswordResetCode(String to, String fullName, String code, int expiresInMinutes);

    void sendGuestJudgeSetupEmail(
            String to,
            String fullName,
            String code,
            LocalDateTime expiresAt,
            String setupPath
    );

    void sendUserAccountSetupEmail(
            String to,
            String fullName,
            String code,
            LocalDateTime expiresAt,
            String setupPath
    );

    void sendOAuthLoginSuccessEmail(String to, String fullName, String providerName);

    void sendTeamInvitationSent(
            String to,
            String inviteeName,
            String teamName,
            String invitedByName,
            String acceptUrl,
            String rejectUrl,
            LocalDateTime expiresAt
    );

    void sendTeamInvitationAccepted(
            String to,
            List<String> cc,
            String teamName,
            String acceptedMemberName,
            String teamUrl
    );

    void sendTeamInvitationRejected(
            String to,
            String teamName,
            String inviteeEmail,
            String manageInvitationsUrl
    );

    void sendTeamRegisterEmail(
            String leaderEmail,
            List<String> cc,
            String leaderName,
            String teamName,
            String eventName,
            String trackName
    );

    void sendTeamJoinRequestReceived(
            String leaderEmail,
            String leaderName,
            String requesterName,
            String requesterEmail,
            String teamName,
            String message,
            String acceptUrl,
            String rejectUrl,
            LocalDateTime expiresAt
    );

    void sendTeamJoinRequestAccepted(
            String requesterEmail,
            String requesterName,
            String teamName,
            String teamUrl
    );

    void sendTeamJoinRequestRejected(
            String requesterEmail,
            String requesterName,
            String teamName,
            String reason,
            String teamsUrl
    );

    void sendJudgeAssignedEmail(
            String to,
            String judgeName,
            String eventName,
            String roundName,
            String trackName
    );

    void sendNotificationEmail(
            String to,
            List<String> cc,
            String subject,
            String title,
            String body,
            String actionUrl
    );

    void sendRawHtmlEmail(
            String to,
            List<String> cc,
            String subject,
            String html
    );
}
