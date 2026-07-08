package com.t7.seal.service.impl;

import com.t7.seal.domain.AiKnowledgeVisibility;
import com.t7.seal.domain.UserRole;
import com.t7.seal.dto.ai.ScoredChunk;
import com.t7.seal.entities.AiKnowledgeChunk;
import com.t7.seal.entities.AiKnowledgeDocument;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.repository.AiKnowledgeChunkRepository;
import com.t7.seal.repository.AiKnowledgeDocumentRepository;
import com.t7.seal.request.assistant.CreateKnowledgeDocumentRequest;
import com.t7.seal.response.assistant.AssistantSourceResponse;
import com.t7.seal.response.assistant.KnowledgeDocumentResponse;
import com.t7.seal.service.AiEmbeddingService;
import com.t7.seal.service.AiKnowledgeService;
import com.t7.seal.service.AiVectorSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AiKnowledgeServiceImpl implements AiKnowledgeService {

    private static final int MAX_CHUNK_CHARS = 1800;
    private static final Pattern SPLIT = Pattern.compile("\\s+");

    private final AiKnowledgeDocumentRepository documentRepository;
    private final AiKnowledgeChunkRepository chunkRepository;

    private final AiEmbeddingService embeddingService;
    private final AiVectorSearchService vectorSearchService;

    @Override
    @Transactional
    public KnowledgeDocumentResponse createDocument(
            CreateKnowledgeDocumentRequest request,
            User actor
    ) {
        if (request == null || request.content() == null || request.content().isBlank()) {
            throw new BadRequestException("Knowledge document content is required");
        }

        AiKnowledgeVisibility visibility = parseVisibility(request.visibility());

        AiKnowledgeDocument document = documentRepository.save(
                AiKnowledgeDocument.builder()
                        .title(request.title())
                        .docType(blankToDefault(request.docType(), "GUIDE"))
                        .sourceRef(blankToDefault(request.sourceRef(), "manual"))
                        .visibility(visibility)
                        .module(blankToDefault(request.module(), "GENERAL"))
                        .contentHash(hash(request.content()))
                        .uploadedBy(actor)
                        .isActive(true)
                        .build()
        );

        List<String> chunks = chunk(request.content());
        int index = 0;
        for (String chunk : chunks) {
            AiKnowledgeChunk savedChunk = chunkRepository.save(
                    AiKnowledgeChunk.builder()
                            .document(document)
                            .chunkIndex(index++)
                            .content(chunk)
                            .module(blankToDefault(request.module(), "GENERAL"))
                            .useCaseId(request.useCaseId())
                            .roleScope(request.roleScope())
                            .embeddingText(normalizeForSearch(chunk))
                            .metadataJson("{\"sourceRef\":\""
                                    + escape(document.getSourceRef()) + "\"}")
                            .isActive(true)
                            .build()
            );

            embeddingService.embed(savedChunk.getEmbeddingText()).ifPresent(
                    embedding -> vectorSearchService.upsertEmbedding(
                            savedChunk.getId(),
                            embedding,
                            embeddingService.modelName(),
                            embeddingService.dimension()
                    )
            );
        }

        return toKnowledgeDocumentResponse(document, chunks.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<KnowledgeDocumentResponse> listDocuments() {
        return documentRepository.findByIsActiveTrueOrderByUpdatedAtDesc()
                .stream()
                .map(doc -> toKnowledgeDocumentResponse(
                        doc,
                        chunkRepository.findByDocumentIdOrderByChunkIndexAsc(
                                doc.getId()
                        ).size()
                ))
                .toList();
    }

    @Override
    @Transactional
    public void seedDefaultKnowledge(User actor) {
        if (!documentRepository.findByIsActiveTrueOrderByUpdatedAtDesc().isEmpty()) {
            return;
        }

        createDocument(
                new CreateKnowledgeDocumentRequest(
                        "SEAL Student Guide — Teams and Submissions",
                        "Participants create or join a team, invite members, " +
                                "register to a track during the registration window, " +
                                "and submit required deliverable links before the round deadline. " +
                                "Team leaders normally submit final deliverables. " +
                                "Members can view team/submission state. " +
                                "SEAL Assistant may explain these steps, " +
                                "but must not create the team's competition code or deliverable.",
                        "USER_GUIDE",
                        "seed:student-guide",
                        "STUDENT",
                        "TEAM_SUBMISSION",
                        "UC-27",
                        "STUDENT"),
                actor
        );
        createDocument(
                new CreateKnowledgeDocumentRequest(
                        "SEAL Judge Guide — Scoring and Calibration",
                        "Judges only score assigned submissions in " +
                                "their assigned round/track. They can save draft scores " +
                                "and then final submit. Calibration helps compare judge variance. " +
                                "After grading is locked, confirmed scores should not be edited. " +
                                "Judges must not see private coordinator-only controls.",
                        "USER_GUIDE",
                        "seed:judge-guide",
                        "JUDGE",
                        "GRADING",
                        "UC-29",
                        "JUDGE"),
                actor
        );
        createDocument(
                new CreateKnowledgeDocumentRequest(
                        "SEAL Coordinator Guide — Ranking, Prizes, Disqualification, Export",
                        "Coordinators manage events, rounds, criteria, " +
                                "judge assignments, grading locks, ranking recalculation, " +
                                "result publication, awards, disqualification/appeal, " +
                                "audit logs, export reports, RBL variance dashboard, " +
                                "and advanced reminders. " +
                                "Sensitive exports and audit logs are coordinator/admin only.",
                        "USER_GUIDE",
                        "seed:coordinator-guide",
                        "COORDINATOR",
                        "OPERATIONS",
                        "UC-35",
                        "COORDINATOR"),
                actor
        );
        createDocument(
                new CreateKnowledgeDocumentRequest(
                        "Academic Integrity Policy for SEAL Assistant",
                        "The assistant must refuse requests to write full code, " +
                                "create full assignment/project solutions, " +
                                "transform an assignment prompt, screenshot, " +
                                "or uploaded file into deliverable code, " +
                                "bypass plagiarism detection, or leak private data. " +
                                "The assistant may explain concepts, outline steps, " +
                                "provide short pseudocode, debug user-written code, " +
                                "and suggest tests/checklists.",
                        "POLICY",
                        "seed:academic-integrity",
                        "AUTHENTICATED",
                        "AI_GUARDRAIL",
                        "S3-M6-ST03",
                        "ALL"),
                actor
        );
        createDocument(
                new CreateKnowledgeDocumentRequest(
                        "SEAL Technical Support Scope",
                        "The assistant may explain Spring Boot, React, TypeScript, MUI, " +
                                "Tailwind, PostgreSQL, JPA, JWT, OAuth2, API contracts, " +
                                "deployment, Docker, and debugging when " +
                                "the explanation supports learning or using SEAL. " +
                                "It should avoid producing copy-paste " +
                                "implementation for team submissions.",
                        "TECH_GUIDE",
                        "seed:tech-scope",
                        "AUTHENTICATED",
                        "TECH_SUPPORT",
                        "S3-M6-ST01",
                        "ALL"),
                actor
        );
    }

    @Override
    @Transactional
    public int reindexKnowledge() {
        return vectorSearchService.reindexAllKnowledge();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssistantSourceResponse> retrieve(String query, User user, int maxChunks) {
        if (query == null || query.isBlank()) return List.of();
        int limit = Math.max(1, maxChunks);
        List<AiKnowledgeChunk> vectorHits = vectorSearchService.search(
                query,
                user,
                limit,
                0.55
        );

        if (!vectorHits.isEmpty()) {
            return vectorHits.stream()
                    .map(chunk -> toSource(chunk, 1.0))
                    .limit(limit)
                    .toList();
        }

        Set<String> queryTokens = importantTokens(query);
        if (queryTokens.isEmpty()) return List.of();

        return chunkRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
                .filter(chunk -> isVisible(chunk.getDocument(), user))
                .map(chunk -> scored(chunk, queryTokens))
                .filter(scored -> scored.score() > 0)
                .sorted(Comparator
                        .comparingDouble(ScoredChunk::score)
                        .reversed()
                )
                .limit(limit)
                .map(scored ->
                        toSource(scored.chunk(), scored.score())
                )
                .toList();
    }

    //HELPERS

    private ScoredChunk scored(
            AiKnowledgeChunk chunk,
            Set<String> queryTokens
    ) {
        String text = normalizeForSearch(chunk.getEmbeddingText() == null
                ? chunk.getContent() : chunk.getEmbeddingText());

        double score = 0;
        for (String token : queryTokens) {
            if (text.contains(token)) {
                score += token.length() > 5 ? 2.0 : 1.0;
            }
        }

        String module = chunk.getModule() == null
                ? "" : chunk.getModule().toLowerCase(Locale.ROOT);

        for (String token : queryTokens) {
            if (module.contains(token)) score += 0.5;
        }

        return new ScoredChunk(chunk, score);
    }

    private AssistantSourceResponse toSource(
            AiKnowledgeChunk chunk,
            double score
    ) {
        AiKnowledgeDocument doc = chunk.getDocument();
        String content = chunk.getContent();
        String excerpt = content.length() > 360
                ? content.substring(0, 357) + "..." : content;

        return new AssistantSourceResponse(
                doc.getId(),
                chunk.getId(),
                doc.getTitle(),
                doc.getDocType(),
                chunk.getModule(),
                chunk.getUseCaseId(),
                excerpt,
                score
        );
    }

    private boolean isVisible(AiKnowledgeDocument doc, User user) {
        if (doc == null || !Boolean.TRUE.equals(doc.getIsActive())) {
            return false;
        }

        AiKnowledgeVisibility visibility = doc.getVisibility();
        if (visibility == AiKnowledgeVisibility.PUBLIC
                || visibility == AiKnowledgeVisibility.AUTHENTICATED) {
            return true;
        }

        if (user == null || user.getRole() == null) {
            return false;
        }

        UserRole role = user.getRole();
        return switch (visibility) {
            case STUDENT -> role == UserRole.STUDENT
                    || role == UserRole.ADMIN
                    || role == UserRole.COORDINATOR;
            case JUDGE -> role == UserRole.JUDGE
                    || role == UserRole.ADMIN
                    || role == UserRole.COORDINATOR;
            case MENTOR -> role == UserRole.MENTOR
                    || role == UserRole.ADMIN
                    || role == UserRole.COORDINATOR;
            case COORDINATOR -> role == UserRole.COORDINATOR
                    || role == UserRole.ADMIN;
            case ADMIN, STAFF_ONLY -> role == UserRole.ADMIN;
            default -> true;
        };
    }

    private KnowledgeDocumentResponse toKnowledgeDocumentResponse(
            AiKnowledgeDocument doc,
            int chunkCount
    ) {
        return new KnowledgeDocumentResponse(
                doc.getId(),
                doc.getTitle(),
                doc.getDocType(),
                doc.getSourceRef(),
                doc.getVisibility() == null
                        ? null : doc.getVisibility().name(),
                doc.getModule(),
                Boolean.TRUE.equals(doc.getIsActive()),
                chunkCount,
                doc.getUpdatedAt()
        );
    }

    private List<String> chunk(String content) {
        String normalized = content.replace("\r\n", "\n").trim();
        List<String> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();

        for (String paragraph : normalized.split("\\n\\s*\\n|\\n")) {
            if (paragraph.isBlank()) continue;

            if (current.length() + paragraph.length() + 1 > MAX_CHUNK_CHARS
                    && !current.isEmpty()) {
                chunks.add(current.toString().trim());
                current = new StringBuilder();
            }

            current.append(paragraph.trim()).append("\n");
        }

        if (!current.isEmpty()) {
            chunks.add(current.toString().trim());
        }

        if (chunks.isEmpty()) {
            chunks.add(normalized.substring(
                    0, Math.min(MAX_CHUNK_CHARS, normalized.length())
            ));
        }

        return chunks;
    }

    private Set<String> importantTokens(String value) {
        Set<String> stop = Set.of(
                "the", "and", "or", "for", "with", "how",
                "what", "when", "where", "this", "that",
                "mình", "toi", "tôi", "của", "cho",
                "làm", "như", "nào", "cach", "cách"
        );
        Set<String> tokens = new LinkedHashSet<>();

        for (String token : SPLIT.split(normalizeForSearch(value))) {
            String cleaned = token.replaceAll("[^\\p{L}\\p{N}_-]", "");
            if (cleaned.length() >= 3 && !stop.contains(cleaned)) {
                tokens.add(cleaned);
            }
        }

        return tokens;
    }

    private AiKnowledgeVisibility parseVisibility(String value) {
        if (value == null || value.isBlank()) {
            return AiKnowledgeVisibility.AUTHENTICATED;
        }
        try {
            return AiKnowledgeVisibility.valueOf(
                    value.trim().toUpperCase(Locale.ROOT)
            );
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unsupported AI knowledge visibility: " + value);
        }
    }

    private String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private String normalizeForSearch(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).trim();
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            return HexFormat.of().formatHex(
                    digest.digest(value.getBytes(StandardCharsets.UTF_8))
            );
        } catch (NoSuchAlgorithmException ex) {
            return Integer.toHexString(value.hashCode());
        }
    }

    private String escape(String value) {
        return value == null
                ? "" : value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }
}
