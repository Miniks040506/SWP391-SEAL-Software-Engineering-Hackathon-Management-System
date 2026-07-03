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
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_IP_ADDRESS_LENGTH = 50;
    private static final int MAX_USER_AGENT_LENGTH = 500;
    private static final List<String> CLIENT_IP_HEADERS = List.of(
            "X-Forwarded-For",
            "X-Real-IP",
            "CF-Connecting-IP",
            "Forwarded"
    );

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
                .ipAddress(resolveClientIpAddress())
                .userAgent(resolveUserAgent())
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
            UUID eventId,
            UUID teamId,
            UUID submissionId,
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
                predicates.add(cb.equal(cb.lower(root.get("targetTable")),
                        normalizedTargetTable.toLowerCase()));
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

        List<AuditLog> filtered = auditLogRepository.findAll(
                        spec,
                        Sort.by(Sort.Direction.DESC, "createdAt")
                ).stream()
                .filter(log -> matchesEntityFilters(log, eventId, teamId, submissionId))
                .toList();

        int total = filtered.size();
        int fromIndex = Math.min(safePage * safeSize, total);
        int toIndex = Math.min(fromIndex + safeSize, total);

        List<AuditLogResponse> content = filtered.subList(fromIndex, toIndex)
                .stream()
                .map(this::toResponse)
                .toList();

        int totalPages = (total == 0) ? 0 : (int) Math.ceil((double) total / safeSize);

        return new PageResponse<>(
                content,
                safePage,
                safeSize,
                total,
                totalPages,
                safePage >= Math.max(totalPages - 1, 0)
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

    //HELPERS
    private boolean matchesEntityFilters(
            AuditLog log,
            UUID eventId,
            UUID teamId,
            UUID submissionId
    ) {
        if (eventId != null && !matchesEvent(log, eventId)) {
            return false;
        }
        if (teamId != null && !matchesTeam(log, teamId)) {
            return false;
        }
        if (submissionId != null && !matchesSubmission(log, submissionId)) {
            return false;
        }
        return true;
    }

    private boolean matchesEvent(AuditLog log, UUID eventId) {
        return matchesTarget(log, eventId, "hackathon_events", "events")
                || containsId(log, "eventId", eventId);
    }

    private boolean matchesTeam(AuditLog log, UUID teamId) {
        return matchesTarget(log, teamId, "teams", "team")
                || containsId(log, "teamId", teamId);
    }

    private boolean matchesSubmission(AuditLog log, UUID submissionId) {
        return matchesTarget(log, submissionId, "submissions", "submission")
                || containsId(log, "submissionId", submissionId);
    }

    private boolean containsId(AuditLog log, String key, UUID id) {
        return containsId(log.getBeforeState(), key, id)
                || containsId(log.getAfterState(), key, id)
                || containsId(log.getContext(), key, id);
    }

    private boolean containsId(Map<String, Object> state, String key, UUID id) {
        if (state == null || state.isEmpty()) {
            return false;
        }
        Object direct = state.get(key);
        if (matchesValue(direct, id)) {
            return true;
        }

        for (Object value : state.values()) {
            if (value instanceof Map<?, ?> nested) {
                Object nestedValue = nested.get(key);
                if (matchesValue(nestedValue, id)) {
                    return true;
                }
            }
            if (value instanceof Iterable<?> values) {
                for (Object objItem : values) {
                    if (matchesValue(objItem, id)) {
                        return true;
                    }
                    if (objItem instanceof Map<?, ?> nestedItem
                            && matchesValue(nestedItem.get(key), id)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private boolean matchesValue(Object raw, UUID id) {
        return raw != null && id != null && id.toString().equals(raw.toString());
    }

    private boolean matchesTarget(AuditLog log, UUID id, String... targetTables) {
        if (log == null || id == null || log.getTargetTable() == null || log.getTargetId() == null) {
            return false;
        }

        for (String targetTable : targetTables) {
            if (log.getTargetTable().equalsIgnoreCase(targetTable)
                    && log.getTargetId().equals(id)) {
                return true;
            }
        }
        return false;
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
                log.getIpAddress(),
                log.getUserAgent(),
                log.getCreatedAt()
        );
    }

    private String resolveClientIpAddress() {
        HttpServletRequest request = currentRequest();
        if (request == null) {
            return null;
        }

        for (String header : CLIENT_IP_HEADERS) {
            String candidate = "Forwarded".equalsIgnoreCase(header)
                    ? firstIpFromForwardedHeader(request.getHeader(header))
                    : firstIpFromCommaSeparatedHeader(request.getHeader(header));
            if (candidate != null) {
                return candidate;
            }
        }

        return normalizeNetworkValue(request.getRemoteAddr(), MAX_IP_ADDRESS_LENGTH);
    }

    private String resolveUserAgent() {
        HttpServletRequest request = currentRequest();
        if (request == null) {
            return null;
        }
        return normalizeNetworkValue(request.getHeader("User-Agent"), MAX_USER_AGENT_LENGTH);
    }

    private HttpServletRequest currentRequest() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes instanceof ServletRequestAttributes servletRequestAttributes) {
            return servletRequestAttributes.getRequest();
        }
        return null;
    }

    private String firstIpFromCommaSeparatedHeader(String rawHeader) {
        if (!StringUtils.hasText(rawHeader)) {
            return null;
        }

        for (String part : rawHeader.split(",")) {
            String candidate = normalizeNetworkValue(part, MAX_IP_ADDRESS_LENGTH);
            if (candidate != null) {
                return candidate;
            }
        }
        return null;
    }

    private String firstIpFromForwardedHeader(String rawHeader) {
        if (!StringUtils.hasText(rawHeader)) {
            return null;
        }

        for (String forwardedEntry : rawHeader.split(",")) {
            for (String token : forwardedEntry.split(";")) {
                String trimmed = token.trim();
                if (!trimmed.regionMatches(true, 0, "for=", 0, 4)) {
                    continue;
                }
                String candidate = normalizeNetworkValue(trimmed.substring(4), MAX_IP_ADDRESS_LENGTH);
                if (candidate != null) {
                    return candidate;
                }
            }
        }
        return null;
    }

    private String normalizeNetworkValue(String rawValue, int maxLength) {
        if (!StringUtils.hasText(rawValue)) {
            return null;
        }

        String value = rawValue.trim();
        if ("unknown".equalsIgnoreCase(value)) {
            return null;
        }

        if (value.length() >= 2 && value.startsWith("\"") && value.endsWith("\"")) {
            value = value.substring(1, value.length() - 1).trim();
        }

        if (value.startsWith("[") && value.contains("]")) {
            value = value.substring(1, value.indexOf(']'));
        }

        if (!StringUtils.hasText(value) || "unknown".equalsIgnoreCase(value)) {
            return null;
        }

        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
