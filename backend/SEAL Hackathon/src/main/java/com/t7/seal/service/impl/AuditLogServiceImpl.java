package com.t7.seal.service.impl;

import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.UserRole;
import com.t7.seal.entities.AuditLog;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.repository.AuditLogRepository;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.AuditLogResponse;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.CurrentUserService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private static final int MAX_PAGE_SIZE = 100;

    private final AuditLogRepository auditLogRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(
            User actor,
            AuditActionType actionType,
            String targetTable,
            UUID targetId,
            Map<String, Object> beforeState,
            Map<String, Object> afterState,
            Map<String, Object> context
    ) {
        if (actor == null || actionType == null || targetTable == null
                || targetTable.isBlank() || targetId == null) {
            return;
        }

        AuditLog log = AuditLog.builder()
                .actor(actor)
                .actionType(actionType)
                .targetTable(targetTable)
                .targetId(targetId)
                .beforeState(beforeState)
                .afterState(afterState)
                .context(context)
                .build();

        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogs(
            UUID actorId,
            String actionType,
            String targetTable,
            UUID targetId,
            LocalDateTime from,
            LocalDateTime to,
            int page,
            int size,
            Authentication authentication
    ) {
        ensureCanViewAudit(authentication);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        AuditActionType action = parseActionType(actionType);
        String normalizedTargetTable = normalize(targetTable);

        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (actorId != null) {
                predicates.add(cb.equal(root.get("actor").get("id"), actorId));
            }
            if (action != null) {
                predicates.add(cb.equal(root.get("actionType"), action));
            }
            if (normalizedTargetTable != null) {
                predicates.add(cb.equal(cb.lower(root.get("targetTable")), normalizedTargetTable.toLowerCase()));
            }
            if (targetId != null) {
                predicates.add(cb.equal(root.get("targetId"), targetId));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AuditLog> result = auditLogRepository.findAll(
                spec,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return new PageResponse<>(
                result.getContent().stream().map(this::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getActionTypes(Authentication authentication) {
        ensureCanViewAudit(authentication);
        return Arrays.stream(AuditActionType.values())
                .map(Enum::name)
                .sorted()
                .toList();
    }

    private void ensureCanViewAudit(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.COORDINATOR) {
            throw new ForbiddenException("Only admin or coordinator can view audit logs.");
        }
    }

    private AuditActionType parseActionType(String actionType) {
        if (actionType == null || actionType.isBlank()) {
            return null;
        }
        try {
            return AuditActionType.valueOf(actionType.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid audit action type: " + actionType);
        }
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private AuditLogResponse toResponse(AuditLog log) {
        User actor = log.getActor();
        return new AuditLogResponse(
                log.getId(),
                actor == null ? null : actor.getId(),
                actor == null ? null : actor.getFullName(),
                log.getActionType() == null ? null : log.getActionType().name(),
                log.getTargetTable(),
                log.getTargetId(),
                log.getBeforeState(),
                log.getAfterState(),
                log.getContext(),
                log.getCreatedAt()
        );
    }
}
