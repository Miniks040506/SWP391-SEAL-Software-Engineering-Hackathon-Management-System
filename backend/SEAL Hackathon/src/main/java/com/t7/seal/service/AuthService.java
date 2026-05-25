package com.t7.seal.service;

import com.t7.seal.request.auth.*;
import com.t7.seal.response.auth.*;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);

    VerifyEmailResponse verifyEmail(VerifyEmailRequest request);

    AuthMessageResponse resendVerification(EmailRequest request);

    LoginResponse login(LoginRequest request);

    RefreshTokenResponse refreshToken(TokenRequest request);

    void logout(String authorizationHeader);

    AuthMessageResponse forgotPassword(EmailRequest request);

    AuthMessageResponse resetPassword(ResetPasswordRequest request);

}
