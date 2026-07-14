package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.auth.*;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.auth.*;
import com.t7.seal.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/auth")
@Tag(
        name = "Authentication",
        description = "Registration, verification, login, token, logout, and password recovery."
)
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "Register",
            description = "Register through POST /api/v1/auth/register. Successful execution returns HTTP 201 with RegisterResponse. Access: Public via SecurityConfig matcher /api/v1/auth/register. Requires a RegisterRequest request body validated with Jakarta Bean Validation.",
            operationId = "authRegister"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Register completed and the resource was created.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @Operation(
            summary = "Verify Email",
            description = "Verify Email through POST /api/v1/auth/verify-email. Successful execution returns HTTP 200 with VerifyEmailResponse. Access: Public via SecurityConfig matcher /api/v1/auth/verify-email. Requires a VerifyEmailRequest request body validated with Jakarta Bean Validation.",
            operationId = "authVerifyEmail"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Verify email completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/verify-email")
    public ResponseEntity<VerifyEmailResponse> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request
    ) {
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    @Operation(
            summary = "Resend Verification",
            description = "Resend Verification through POST /api/v1/auth/resend-verification. Successful execution returns HTTP 200 with AuthMessageResponse. Access: Authenticated via SecurityConfig matcher anyRequest(). Requires an EmailRequest request body validated with Jakarta Bean Validation.",
            operationId = "authResendVerification",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Resend verification completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/resend-verification")
    public ResponseEntity<AuthMessageResponse> resendVerification(
            @Valid @RequestBody EmailRequest request
    ) {
        return ResponseEntity.ok(authService.resendVerification(request));
    }

    @Operation(
            summary = "Login",
            description = "Login through POST /api/v1/auth/login. Successful execution returns HTTP 200 with LoginResponse. Access: Public via SecurityConfig matcher /api/v1/auth/login. Requires a LoginRequest request body validated with Jakarta Bean Validation.",
            operationId = "authLogin"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Login completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(
            summary = "Refresh Token",
            description = "Refresh Token through POST /api/v1/auth/refresh-token. Successful execution returns HTTP 200 with RefreshTokenResponse. Access: Public via SecurityConfig matcher /api/v1/auth/refresh-token. Requires a TokenRequest request body validated with Jakarta Bean Validation.",
            operationId = "authRefreshToken"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Refresh token completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponse> refreshToken(
            @Valid @RequestBody TokenRequest request
    ) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @Operation(
            summary = "Logout",
            description = "Logout through POST /api/v1/auth/logout. Successful execution returns HTTP 204 without a response body. Access: Authenticated via SecurityConfig matcher anyRequest().",
            operationId = "authLogout",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Logout completed successfully with no response body."),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @Parameter(description = "Authorization value.", required = true)
            @RequestHeader("Authorization") String authorizationHeader
    ) {
        authService.logout(authorizationHeader);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<AuthMessageResponse> forgotPassword(@Valid @RequestBody EmailRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthMessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
}