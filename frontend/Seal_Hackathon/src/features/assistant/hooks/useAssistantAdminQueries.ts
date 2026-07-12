import { useQuery } from "@tanstack/react-query";
import { assistantAdminApi } from "@/api/assistantAdmin.api";

export const assistantAdminKeys = {
  all: ["assistant-admin"] as const,
  knowledge: () => [...assistantAdminKeys.all, "knowledge"] as const,
  safetyLogs: (params?: { decision?: string; page?: number; size?: number }) =>
    [...assistantAdminKeys.all, "safety-logs", params] as const,
};

export function useAiKnowledgeDocumentsQuery() {
  return useQuery({
    queryKey: assistantAdminKeys.knowledge(),
    queryFn: () => assistantAdminApi.getKnowledgeDocuments(),
  });
}

export function useAiSafetyLogsQuery(params?: { decision?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: assistantAdminKeys.safetyLogs(params),
    queryFn: () => assistantAdminApi.getSafetyLogs(params),
  });
}
