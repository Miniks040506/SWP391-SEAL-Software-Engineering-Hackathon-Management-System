package com.t7.seal.service;

import com.t7.seal.entities.User;
import com.t7.seal.request.assistant.CreateKnowledgeDocumentRequest;
import com.t7.seal.response.assistant.AssistantSourceResponse;
import com.t7.seal.response.assistant.KnowledgeDocumentResponse;

import java.util.List;

public interface AiKnowledgeService {
    KnowledgeDocumentResponse createDocument(CreateKnowledgeDocumentRequest request, User actor);

    List<KnowledgeDocumentResponse> listDocuments();

    void seedDefaultKnowledge(User actor);

    int reindexKnowledge();

    List<AssistantSourceResponse> retrieve(String query, User user, int maxChunks);
}
