import type { ISODateTime, PageResponse, UUID } from "@/types/common.types";

export type AiLanguage = "VI" | "EN" | "MIXED" | "UNKNOWN";
export type AiSafetyDecision = "ALLOW" | "WARN" | "BLOCK";

export type AssistantChatRequest = {
  message: string;
  conversationId?: UUID;
  eventId?: UUID;
  teamId?: UUID;
  roundId?: UUID;
  pageContext?: string;
  preferredLanguage?: AiLanguage;
  attachmentText?: string;
  attachmentFileName?: string;
  translationSourceLanguage?: string;
  translationTargetLanguage?: string;
};

export type AssistantSourceResponse = {
  documentId: UUID;
  chunkId: UUID;
  title: string;
  docType?: string | null;
  module?: string | null;
  useCaseId?: string | null;
  excerpt: string;
  score: number;
};

export type AssistantChatResponse = {
  conversationId: UUID;
  answer: string;
  intent: string;
  language: AiLanguage;
  blocked: boolean;
  guardrailReason?: string | null;
  safetyDecision?: AiSafetyDecision | null;
  riskType?: string | null;
  riskSeverity: number;
  ragEnabled: boolean;
  usedRag: boolean;
  provider?: string | null;
  model?: string | null;
  suggestedActions: string[];
  sources: AssistantSourceResponse[];
  roleContext: Record<string, unknown>;
  answeredAt: ISODateTime;
};

export type AssistantContextResponse = {
  userId: UUID;
  fullName: string;
  role: string;
  status: string;
  quickPrompts: string[];
  roleContext: Record<string, unknown>;
};

export type AssistantConversationResponse = {
  id: UUID;
  title: string;
  language?: AiLanguage | null;
  lastIntent?: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type AssistantMessageResponse = {
  id: UUID;
  conversationId: UUID;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  language?: AiLanguage | null;
  intent?: string | null;
  safetyDecision?: AiSafetyDecision | null;
  provider?: string | null;
  model?: string | null;
  usedRag?: boolean | null;
  createdAt: ISODateTime;
};

export type CreateKnowledgeDocumentRequest = {
  title: string;
  content: string;
  docType?: string;
  sourceRef?: string;
  visibility?: "PUBLIC" | "AUTHENTICATED" | "STUDENT" | "JUDGE" | "MENTOR" | "COORDINATOR" | "ADMIN" | "STAFF_ONLY";
  module?: string;
  useCaseId?: string;
  roleScope?: string;
};

export type KnowledgeDocumentResponse = {
  id: UUID;
  title: string;
  docType: string;
  sourceRef?: string | null;
  visibility: string;
  module?: string | null;
  active: boolean;
  chunkCount: number;
  updatedAt: ISODateTime;
};

export type AiSafetyLogResponse = {
  id: UUID;
  userId?: UUID | null;
  userName?: string | null;
  decision: AiSafetyDecision;
  riskType: string;
  intent?: string | null;
  severity: number;
  reason?: string | null;
  pageContext?: string | null;
  createdAt: ISODateTime;
};

export type AiReindexResponse = {
  indexedChunks: number;
  embeddingModel: string;
  dimension: number;
  indexedAt: ISODateTime;
};

export type AiSafetyLogPage = PageResponse<AiSafetyLogResponse>;
