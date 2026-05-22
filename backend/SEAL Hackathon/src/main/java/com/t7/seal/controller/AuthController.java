package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.auth.*;
import com.t7.seal.response.auth.LoginResponse;
import com.t7.seal.response.auth.RefreshTokenResponse;
import com.t7.seal.response.auth.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/auth")
public class AuthController {

//    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
//        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
        return null;
    }

    @PostMapping("/verify-email")
    public ResponseEntity<UserResponse> verifyEmail(@Valid @RequestBody TokenRequest request) {
//        return ResponseEntity.ok(authService.verifyEmail(request));
        return null;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
//        return ResponseEntity.ok(authService.login(request));
        return null;
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponse> refreshToken(@Valid @RequestBody TokenRequest request) {
//        return ResponseEntity.ok(authService.refreshToken(request));
        return null;
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authorizationHeader) {
//        authService.logout(authorizationHeader);
//        return ResponseEntity.noContent().build();
        return null;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
//        authService.forgotPassword(request);
//        return ResponseEntity.noContent().build();
        return null;
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
//        authService.resetPassword(request);
//        return ResponseEntity.noContent().build();
        return null;
    }
}
