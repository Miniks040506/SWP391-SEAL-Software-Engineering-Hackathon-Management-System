import { apiRequest } from "@/api/apiRequest";
import type {
  AiReindexResponse,
  AiSafetyLogPage,
  CreateKnowledgeDocumentRequest,
  KnowledgeDocumentResponse,
} from "@/types/assistant.types";

export const assistantAdminApi = {
  getKnowledgeDocuments() {
    return apiRequest.get<KnowledgeDocumentResponse[]>("/admin/assistant/knowledge");
  },

  createKnowledgeDocument(payload: CreateKnowledgeDocumentRequest) {
    return apiRequest.post<KnowledgeDocumentResponse>("/admin/assistant/knowledge", payload);
  },

  seedKnowledge() {
    return apiRequest.post<void>("/admin/assistant/knowledge/seed");
  },

  reindexKnowledge() {
    return apiRequest.post<AiReindexResponse>("/admin/assistant/knowledge/reindex");
  },

  getSafetyLogs(params?: { decision?: string; page?: number; size?: number }) {
    return apiRequest.get<AiSafetyLogPage>("/admin/assistant/safety-logs", { params });
  },
};
