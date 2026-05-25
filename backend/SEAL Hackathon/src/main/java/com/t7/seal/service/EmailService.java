package com.t7.seal.service;

public interface EmailService {

    void sendVerificationCode(String to, String fullName, String code, int expiresInMinutes);

    void sendPasswordResetCode(String to, String fullName, String code, int expiresInMinutes);
}
