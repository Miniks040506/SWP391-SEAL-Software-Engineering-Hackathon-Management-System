package com.t7.seal.service.impl;

import com.t7.seal.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.application.name:SEAL Hackathon}")
    private String appName;

    @Override
    public void sendVerificationCode(String to, String fullName, String code, int expiresInMinutes) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(appName + " - Email Verification Code");
        message.setText("""
                Hello %s,
                
                Your SEAL verification code is: %s
                
                This code expires in %d minutes.
                """.formatted(fullName, code, expiresInMinutes));
        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetCode(String to, String fullName, String code, int expiresInMinutes) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(appName + " - Password Reset Code");
        message.setText("""
                Hello %s,
                
                Your SEAL password reset code is: %s
                
                This code expires in %d minutes.
                """.formatted(fullName, code, expiresInMinutes));
        mailSender.send(message);
    }
}
