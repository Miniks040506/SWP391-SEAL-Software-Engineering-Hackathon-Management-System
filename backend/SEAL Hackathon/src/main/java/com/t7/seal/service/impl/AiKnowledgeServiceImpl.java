package com.t7.seal.service.impl;

import com.t7.seal.entities.User;
import com.t7.seal.request.assistant.CreateKnowledgeDocumentRequest;
import com.t7.seal.response.assistant.AssistantSourceResponse;
import com.t7.seal.response.assistant.KnowledgeDocumentResponse;
import com.t7.seal.service.AiKnowledgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiKnowledgeServiceImpl implements AiKnowledgeService {
    @Override
    public KnowledgeDocumentResponse createDocument(CreateKnowledgeDocumentRequest request, User actor) {
        return null;
    }

    @Override
    public List<KnowledgeDocumentResponse> listDocuments() {
        return List.of();
    }

    @Override
    public void seedDefaultKnowledge(User actor) {

    }

    @Override
    public int reindexKnowledge() {
        return 0;
    }

    @Override
    public List<AssistantSourceResponse> retrieve(String query, User user, int maxChunks) {
        return List.of();
    }
}
