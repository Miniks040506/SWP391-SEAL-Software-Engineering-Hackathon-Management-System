package com.t7.seal.service.impl;

import com.t7.seal.domain.JudgeType;
import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.UserRole;
import com.t7.seal.domain.UserStatus;
import com.t7.seal.entities.Judge;
import com.t7.seal.entities.StudentProfile;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.JudgeRepository;
import com.t7.seal.repository.StudentProfileRepository;
import com.t7.seal.repository.UserRepository;
import com.t7.seal.request.user.*;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.user.*;
import com.t7.seal.service.CloudinaryStorageService;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.EmailService;
import com.t7.seal.service.PasswordHistoryService;
import com.t7.seal.service.TokenGenerator;
import com.t7.seal.service.TokenBlacklistService;
import com.t7.seal.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private static final int RANDOM_TOKEN_BYTE_LENGTH = 32;
    private static final int MAX_PAGE_SIZE = 100;

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final JudgeRepository judgeRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenBlacklistService tokenBlacklistService;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final TokenGenerator tokenGenerator;
    private final EmailService emailService;
    private final PasswordHistoryService passwordHistoryService;
    private final AuditLogService auditLogService;

    @Value("${app.user-account.setup-expiration-hours:24}")
    private int userSetupExpirationHours;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional(readOnly = true)
    public List<AssignableUserResponse> getAssignableUsers(String role, String search) {
        if (role == null || role.isBlank()) {
            throw new BadRequestException("Invalid assignable role.");
        }

        UserRole parsedRole;

        try {
            parsedRole = UserRole.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid assignable role.");
        }

        if (parsedRole != UserRole.MENTOR && parsedRole != UserRole.JUDGE) {
            throw new BadRequestException("Assignable role must be MENTOR or JUDGE.");
        }

        String keyword = search == null ? "" : search.trim().toLowerCase();

        List<User> users;

        if (keyword.isBlank()) {
            users = userRepository.findByRoleAndStatusOrderByFullNameAsc(
                    parsedRole,
                    UserStatus.ACTIVE
            );
        } else {
            users = userRepository.searchAssignableUsers(
                    parsedRole,
                    UserStatus.ACTIVE,
                    keyword
            );
        }

        return users.stream()
                .map(this::toAssignableUserResponse)
                .toList();
    }

    private AssignableUserResponse toAssignableUserResponse(User user) {
        Judge judge = user.getRole() == UserRole.JUDGE ? user.getJudge() : null;

        return new AssignableUserResponse(
                user.getId(),
                judge == null ? null : judge.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStatus(),
                judge == null || judge.getJudgeType() == null ? null : judge.getJudgeType().name(),
                judge == null ? null : judge.isGuest(),
                judge == null ? null : judge.getIsTemporary(),
                judge == null ? null : judge.getExpiresAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        return toProfileResponse(user);
    }

    @Override
    @Transactional
    public ProfileResponse updateMyProfile(Authentication authentication, UpdateMyProfileRequest request) {
        User user = currentUserService.getCurrentUser(authentication);

        validateUpdateProfileRequest(request);

        user.setFullName(request.fullName().trim());
        user.setPhone(trimToNull(request.phone()));
        user.setAvatarUrl(trimToNull(request.avatarUrl()));

        userRepository.save(user);

        return toProfileResponse(user);
    }

    @Override
    @Transactional
    public void changeMyPassword(Authentication authentication, ChangePasswordRequest request, String authorizationHeader) {
        User user = currentUserService.getCurrentUser(authentication);

        validateChangePasswordRequest(request);

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Password confirmation does not match.");
        }

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect.");
        }

        passwordHistoryService.validateNotReused(user, request.newPassword());

        String previousPasswordHash = user.getPasswordHash();
        user.updatePasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        passwordHistoryService.recordPassword(user, previousPasswordHash);

        blacklistCurrentToken(authorizationHeader);
    }


    @Override
    @Transactional
    public ProfileResponse uploadFileAvatar(MultipartFile file, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        String avatarUrl = cloudinaryStorageService.uploadUserAvatar(user.getId(), file);

        user.setAvatarUrl(avatarUrl);

        return toProfileResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getUserById(UUID id, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found."));

        return toUserDetailResponse(user, resolveRoleProfile(user));
    }

    @Override
    @Transactional
    public UserDetailResponse createUser(CreateUserRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);

        validateCreateUserRequest(request);

        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email already exists.");
        }

        UserRole role = parseEnum(UserRole.class, request.role(), "role");
        UserStatus status = parseEnum(UserStatus.class, request.status(), "status");

        validateCreateRole(actor, role);

        String temporaryPassword = generateRandomToken();
        String setupCode = tokenGenerator.generateSixDigitCode();
        LocalDateTime setupExpiresAt = LocalDateTime.now()
                .plusHours(Math.max(userSetupExpirationHours, 1));

        User user = new User();
        user.setEmail(email);
        user.setFullName(request.fullName().trim());
        user.setPhone(trimToNull(request.phone()));
        user.setRole(role);
        user.setStatus(status);
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setPasswordResetToken(setupCode);
        user.setPasswordResetExpiresAt(setupExpiresAt);

        if (status == UserStatus.ACTIVE) {
            user.setEmailVerifiedAt(LocalDateTime.now());
        }

        User saved = userRepository.save(user);

        String setupPath = "/reset-password?email=" + encodeUrl(saved.getEmail())
                + "&code=" + encodeUrl(setupCode);

        emailService.sendUserAccountSetupEmail(
                saved.getEmail(),
                saved.getFullName(),
                setupCode,
                setupExpiresAt,
                setupPath
        );

        auditLogService.record(
                actor,
                AuditActionType.USER_CREATED,
                "users",
                saved.getId(),
                null,
                Map.of(
                        "email", saved.getEmail(),
                        "role", saved.getRole().name(),
                        "status", saved.getStatus().name()
                ),
                Map.of("setupExpiresAt", setupExpiresAt.toString())
        );

        return toUserDetailResponse(saved, resolveRoleProfile(saved));
    }

    @Override
    @Transactional
    public UserApprovalResultResponse approveUser(UUID id, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found."));

        if (user.getStatus() != UserStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Only PENDING_APPROVAL users can be approved.");
        }

        user.approve();

        StudentProfile profile = studentProfileRepository.findByUserId(id).orElse(null);

        if (profile != null && profile.getVerifiedAt() == null) {
            profile.markVerified(LocalDateTime.now());
            studentProfileRepository.save(profile);
        }

        User saved = userRepository.save(user);

        return new UserApprovalResultResponse(
                saved.getId(),
                saved.getStatus().name(),
                "User approved successfully."
        );
    }

    @Override
    @Transactional
    public UserApprovalResultResponse rejectUser(UUID id, RejectUserRequest request, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        if (request == null || request.reason() == null || request.reason().isBlank()) {
            throw new BadRequestException("Reject reason is required.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found."));

        if (user.getStatus() != UserStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Only PENDING_APPROVAL users can be rejected.");
        }

        user.deactivate();

        User saved = userRepository.save(user);

        return new UserApprovalResultResponse(
                saved.getId(),
                saved.getStatus().name(),
                "User rejected successfully."
        );
    }

    @Override
    @Transactional
    public GuestJudgeResponse createGuestJudge(CreateGuestJudgeRequest request, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        validateCreateGuestJudgeRequest(request);

        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email already exists.");
        }

        LocalDateTime expiresAt = request.temporaryAccountExpiresAt() == null
                ? LocalDateTime.now().plusDays(3)
                : request.temporaryAccountExpiresAt();

        if (!expiresAt.isAfter(LocalDateTime.now())) {
            throw new BadRequestException("temporaryAccountExpiresAt must be in the future.");
        }

        String temporaryPassword = generateRandomToken();
        String setupCode = tokenGenerator.generateSixDigitCode();

        User user = new User();
        user.setEmail(email);
        user.setFullName(request.fullName().trim());
        user.setRole(UserRole.JUDGE);
        
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setPasswordResetToken(setupCode);
        user.setPasswordResetExpiresAt(expiresAt);

        User savedUser = userRepository.save(user);

        Judge judge = new Judge();
        judge.setUser(savedUser);
        judge.setJudgeType(JudgeType.GUEST);
        judge.setAffiliation(trimToNull(request.affiliation()));
        judge.setExpertiseTags(trimToNull(request.expertise()));
        judge.setIsTemporary(true);
        judge.setExpiresAt(expiresAt);

        Judge savedJudge = judgeRepository.save(judge);

        String temporaryPasswordLink = "/reset-password?email=" + encodeUrl(savedUser.getEmail())
                + "&code=" + encodeUrl(setupCode);

        emailService.sendGuestJudgeSetupEmail(
                savedUser.getEmail(),
                savedUser.getFullName(),
                setupCode,
                expiresAt,
                temporaryPasswordLink
        );

        return new GuestJudgeResponse(
                savedUser.getId(),
                savedJudge.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedJudge.getJudgeType().name(),
                savedJudge.isGuest(),
                savedJudge.getIsTemporary(),
                savedJudge.getAffiliation(),
                savedJudge.getExpertiseTags(),
                temporaryPasswordLink,
                expiresAt
        );
    }

    @Override
    @Transactional
    public UserDetailResponse updateUser(UUID id, UpdateUserRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);

        validateUpdateUserRequest(request);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found."));

        boolean updatingSelf = actor.getId().equals(user.getId());

        if (request.fullName() != null) {
            if (request.fullName().isBlank()) {
                throw new BadRequestException("Full name must not be blank.");
            }
            user.setFullName(request.fullName().trim());
        }

        if (request.phone() != null) {
            user.setPhone(trimToNull(request.phone()));
        }

        if (request.avatarUrl() != null) {
            user.setAvatarUrl(trimToNull(request.avatarUrl()));
        }

        if (request.role() != null && !request.role().isBlank()) {
            UserRole newRole = parseEnum(UserRole.class, request.role(), "role");

            if (updatingSelf && newRole != user.getRole()) {
                throw new BadRequestException("Admin cannot change their own role.");
            }

            validateAdminUpdateRole(user.getRole(), newRole);
            user.setRole(newRole);
        }

        if (request.status() != null && !request.status().isBlank()) {
            UserStatus newStatus = parseEnum(UserStatus.class, request.status(), "status");

            if (updatingSelf && newStatus != user.getStatus()) {
                throw new BadRequestException("Admin cannot change their own status.");
            }

            user.setStatus(newStatus);

            if (newStatus == UserStatus.ACTIVE && user.getEmailVerifiedAt() == null) {
                user.setEmailVerifiedAt(LocalDateTime.now());
            }
        }

        User saved = userRepository.save(user);

        return toUserDetailResponse(saved, resolveRoleProfile(saved));
    }

    @Override
    @Transactional
    public UserDetailResponse deactivateUser(UUID id, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found."));

        if (actor.getId().equals(user.getId())) {
            throw new BadRequestException("Admin cannot deactivate their own account.");
        }

        user.deactivate();

        User saved = userRepository.save(user);

        return toUserDetailResponse(saved, resolveRoleProfile(saved));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserSummaryResponse> getUsers(
            String role,
            String status,
            String search,
            int page,
            int size,
            Authentication authentication
    ) {
        currentUserService.getCurrentUser(authentication);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        UserRole parsedRole = parseNullableEnum(UserRole.class, normalize(role), "role");
        UserStatus parsedStatus = parseNullableEnum(UserStatus.class, normalize(status), "status");
        String keyword = trimToNull(search);

        Specification<User> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (parsedRole != null) {
                predicates.add(cb.equal(root.get("role"), parsedRole));
            }

            if (parsedStatus != null) {
                predicates.add(cb.equal(root.get("status"), parsedStatus));
            }

            if (keyword != null) {
                String pattern = "%" + keyword.toLowerCase() + "%";

                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("fullName")), pattern)
                ));
            }

            return predicates.isEmpty()
                    ? cb.conjunction()
                    : cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<User> result = userRepository.findAll(
                spec,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return new PageResponse<>(
                result.getContent().stream()
                        .map(this::toUserSummaryResponse)
                        .toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserApprovalResponse> getPendingApprovalUsers(
            int page,
            int size,
            Authentication authentication
    ) {
        currentUserService.getCurrentUser(authentication);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        Page<User> result = userRepository.findByStatusOrderByEmailVerifiedAtAscCreatedAtAsc(
                UserStatus.PENDING_APPROVAL,
                PageRequest.of(safePage, safeSize)
        );

        return new PageResponse<>(
                result.getContent()
                        .stream()
                        .map(user -> {
                            StudentProfile profile = studentProfileRepository
                                    .findByUserId(user.getId())
                                    .orElse(null);
                            return toUserApprovalResponse(user, profile);
                        })
                        .toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    //HELPERS
    private ProfileResponse toProfileResponse(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getRole().name(),
                user.getStatus().name()
        );
    }

    private UserDetailResponse toUserDetailResponse(User user, Object roleProfile) {
        return new UserDetailResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getAvatarUrl(),
                user.getEmailVerifiedAt(),
                user.getLastLoginAt(),
                roleProfile
        );
    }

    private UserSummaryResponse toUserSummaryResponse(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getCreatedAt()
        );
    }

    private UserApprovalResponse toUserApprovalResponse(User user, StudentProfile profile) {
        return new UserApprovalResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                profile == null ? null : profile.getStudentType().name(),
                profile == null ? null : profile.getUniversityName(),
                user.getEmailVerifiedAt()
        );
    }

    private Object resolveRoleProfile(User user) {
        if (user.getRole() == UserRole.STUDENT) {
            return studentProfileRepository.findByUserId(user.getId()).orElse(null);
        }

        if (user.getRole() == UserRole.JUDGE || user.getRole() == UserRole.MENTOR) {
            return judgeRepository.findByUserId(user.getId()).orElse(null);
        }

        return null;
    }

    private void validateCreateUserRequest(CreateUserRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }

        if (request.email() == null || request.email().isBlank()) {
            throw new BadRequestException("Email is required.");
        }

        if (request.fullName() == null || request.fullName().isBlank()) {
            throw new BadRequestException("Full name is required.");
        }

        if (request.role() == null || request.role().isBlank()) {
            throw new BadRequestException("Role is required.");
        }

        if (request.status() == null || request.status().isBlank()) {
            throw new BadRequestException("Status is required.");
        }
    }

    private void validateCreateGuestJudgeRequest(CreateGuestJudgeRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }

        if (request.email() == null || request.email().isBlank()) {
            throw new BadRequestException("Email is required.");
        }

        if (request.fullName() == null || request.fullName().isBlank()) {
            throw new BadRequestException("Full name is required.");
        }
    }

    private void validateCreateRole(User actor, UserRole role) {
        if (role == UserRole.STUDENT) {
            throw new BadRequestException(
                    "Create student accounts through register flow to ensure StudentProfile is created.");
        }

        if (actor.getRole() == UserRole.COORDINATOR
                && role != UserRole.JUDGE
                && role != UserRole.MENTOR) {
            throw new BadRequestException("Coordinators can create only JUDGE or MENTOR accounts.");
        }
    }

    private void validateUpdateUserRequest(UpdateUserRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }

        if (request.fullName() != null && request.fullName().length() > 200) {
            throw new BadRequestException("Full name must not exceed 200 characters.");
        }

        if (request.phone() != null && request.phone().length() > 20) {
            throw new BadRequestException("Phone must not exceed 20 characters.");
        }

        if (request.avatarUrl() != null && request.avatarUrl().length() > 500) {
            throw new BadRequestException("Avatar URL must not exceed 500 characters.");
        }
    }

    private void validateAdminUpdateRole(UserRole oldRole, UserRole newRole) {
        if (oldRole != newRole && (oldRole == UserRole.STUDENT || newRole == UserRole.STUDENT)) {
            throw new BadRequestException("Changing to/from student role requires StudentProfile migration.");
        }
    }

    private String normalize(String value) {
        if (value == null || value.isBlank() || "ALL".equalsIgnoreCase(value)) {
            return null;
        }

        return value.trim().toUpperCase();
    }

    private String generateRandomToken() {
        byte[] bytes = new byte[RANDOM_TOKEN_BYTE_LENGTH];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String encodeUrl(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumType, String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required.");
        }

        try {
            return Enum.valueOf(enumType, value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid " + fieldName + ": " + value);
        }
    }

    private <E extends Enum<E>> E parseNullableEnum(Class<E> enumType, String value, String fieldName) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return parseEnum(enumType, value, fieldName);
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void validateUpdateProfileRequest(UpdateMyProfileRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }

        if (request.fullName() == null || request.fullName().isBlank()) {
            throw new BadRequestException("Full name is required.");
        }

        if (request.fullName().trim().length() > 200) {
            throw new BadRequestException("Full name must not exceed 200 characters.");
        }

        if (request.phone() != null && request.phone().length() > 20) {
            throw new BadRequestException("Phone must not exceed 20 characters.");
        }

        if (request.avatarUrl() != null && request.avatarUrl().length() > 500) {
            throw new BadRequestException("Avatar URL must not exceed 500 characters.");
        }
    }

    private void validateChangePasswordRequest(ChangePasswordRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }

        if (request.currentPassword() == null || request.currentPassword().isBlank()) {
            throw new BadRequestException("Current password is required.");
        }

        if (request.newPassword() == null || request.newPassword().isBlank()) {
            throw new BadRequestException("New password is required.");
        }

        if (request.confirmPassword() == null || request.confirmPassword().isBlank()) {
            throw new BadRequestException("Confirm password is required.");
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match.");
        }

        validatePasswordStrength(request.newPassword());
    }

    private void validatePasswordStrength(String password) {
        if (password.length() < 8 || password.length() > 100) {
            throw new BadRequestException("Password must be between 8 and 100 characters.");
        }

        boolean hasLetter = password.chars().anyMatch(Character::isLetter);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);

        if (!hasLetter || !hasDigit) {
            throw new BadRequestException("Password must contain at least one letter and one digit.");
        }
    }

    private void blacklistCurrentToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return;
        }

        String token = authorizationHeader.substring(7);

        if (!token.isBlank()) {
            tokenBlacklistService.blacklist(token);
        }
    }
}
