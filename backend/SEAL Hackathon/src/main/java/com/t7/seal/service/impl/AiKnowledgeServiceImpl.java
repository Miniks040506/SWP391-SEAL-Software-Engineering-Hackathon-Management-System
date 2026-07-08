package com.t7.seal.service.impl;

import com.t7.seal.domain.AiKnowledgeVisibility;
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
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
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

    }

    @Override
    @Transactional
    public int reindexKnowledge() {
        return 0;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssistantSourceResponse> retrieve(String query, User user, int maxChunks) {
        return List.of();
    }

    //HELPERS

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
