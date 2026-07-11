import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";

import { useAssistantContextQuery } from "@/features/assistant/hooks/useAssistantQueries";
import { useAssistantChatMutation } from "@/features/assistant/hooks/useAssistantMutations";
import type { AiLanguage, AssistantChatResponse, AssistantSourceResponse } from "@/types/assistant.types";
import type { UUID } from "@/types/common.types";

const FALLBACK_PROMPTS = [
  "How do I submit deliverables?",
  "Dịch hướng dẫn nộp bài sang English",
  "Explain result publication flow.",
  "Giải thích lỗi 403 ở mức debug, không code hộ.",
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  blocked?: boolean;
  intent?: string;
  language?: AiLanguage;
  safetyDecision?: string | null;
  riskType?: string | null;
  provider?: string | null;
  model?: string | null;
  usedRag?: boolean;
  suggestions?: string[];
  sources?: AssistantSourceResponse[];
};

function makeAssistantMessage(response: AssistantChatResponse): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: response.answer,
    blocked: response.blocked,
    intent: response.intent,
    language: response.language,
    safetyDecision: response.safetyDecision,
    riskType: response.riskType,
    provider: response.provider,
    model: response.model,
    usedRag: response.usedRag,
    suggestions: response.suggestedActions ?? [],
    sources: response.sources ?? [],
  };
}

function SourceList({ sources }: { sources?: AssistantSourceResponse[] }) {
  if (!sources?.length) return null;
  return (
    <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        <SourceOutlinedIcon fontSize="inherit" /> Retrieved SEAL sources
      </div>
      {sources.slice(0, 3).map((source) => (
        <div key={source.chunkId} className="rounded-lg bg-white p-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <div className="font-bold text-slate-800 dark:text-slate-100">
            {source.title} {source.useCaseId ? `• ${source.useCaseId}` : ""}
          </div>
          <p className="mt-1 line-clamp-3">{source.excerpt}</p>
        </div>
      ))}
    </div>
  );
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<UUID | undefined>();
  const [preferredLanguage, setPreferredLanguage] = useState<AiLanguage | "AUTO">("AUTO");
  const [translationTarget, setTranslationTarget] = useState("");
  const [attachmentText, setAttachmentText] = useState("");
  const [attachmentFileName, setAttachmentFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: context, isLoading: isLoadingContext, isError } = useAssistantContextQuery();
  const chatMutation = useAssistantChatMutation();

  const quickPrompts = useMemo(
    () => (context?.quickPrompts?.length ? context.quickPrompts : FALLBACK_PROMPTS),
    [context?.quickPrompts],
  );

  const sendMessage = async (text = message, targetLanguage = translationTarget) => {
    const trimmed = text.trim();
    if (!trimmed || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: attachmentFileName ? `${trimmed}\n\n[Attached text: ${attachmentFileName}]` : trimmed,
      language: preferredLanguage === "AUTO" ? undefined : preferredLanguage,
    };
    setChat((current) => [...current, userMessage]);
    setMessage("");

    try {
      const response = await chatMutation.mutateAsync({
        message: trimmed,
        conversationId,
        pageContext: window.location.pathname,
        preferredLanguage: preferredLanguage === "AUTO" ? undefined : preferredLanguage,
        attachmentText: attachmentText || undefined,
        attachmentFileName: attachmentFileName || undefined,
        translationTargetLanguage: targetLanguage || undefined,
      });
      setConversationId(response.conversationId);
      setChat((current) => [...current, makeAssistantMessage(response)]);
      setAttachmentText("");
      setAttachmentFileName("");
      setTranslationTarget("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setChat((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: error?.response?.data?.message || error?.message || "Assistant is unavailable right now.",
          intent: "ERROR",
        },
      ]);
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAttachmentFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setAttachmentText(text.slice(0, 6000));
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <>
      <Tooltip title="SEAL Assistant">
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 1300,
            width: 56,
            height: 56,
            bgcolor: "#2563eb",
            color: "white",
            boxShadow: "0 20px 45px rgba(37, 99, 235, 0.35)",
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          <SmartToyOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box className="flex h-full w-120 max-w-[100vw] flex-col bg-slate-50 dark:bg-slate-950">
          <header className="border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <SmartToyOutlinedIcon color="primary" />
                  <h2 className="text-lg font-black text-slate-950 dark:text-white">SEAL Assistant</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Bilingual LLM/RAG-ready help with academic-integrity guardrails.
                </p>
              </div>
              <IconButton onClick={() => setOpen(false)}>
                <CloseOutlinedIcon />
              </IconButton>
            </div>

            {isLoadingContext ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <CircularProgress size={16} /> Loading context...
              </div>
            ) : isError ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Assistant context could not be loaded. Chat still works if your session is valid.
              </Alert>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip size="small" label={context?.role ?? "Authenticated"} />
                <Chip size="small" label={context?.status ?? "ACTIVE"} variant="outlined" />
                {Boolean(context?.roleContext?.ragEnabled) && <Chip size="small" color="success" label="RAG" variant="outlined" />}
                {Boolean(context?.roleContext?.guardrailsEnabled) && <Chip size="small" color="warning" label="Guardrails" variant="outlined" />}
              </div>
            )}
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {chat.length === 0 && (
              <div className="space-y-4">
                <Alert severity="info" icon={<LightbulbOutlinedIcon />}>
                  Ask about SEAL, project technology, debugging, or Vietnamese/English translation. Full assignment/team-submission coding requests are blocked.
                </Alert>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Quick prompts</p>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 999, textTransform: "none" }}
                        onClick={() => sendMessage(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {chat.map((item) => (
              <div
                key={item.id}
                className={item.role === "user" ? "ml-10 rounded-2xl bg-blue-600 p-4 text-white" : "mr-10 rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide opacity-70">
                    {item.role === "user" ? "You" : "Assistant"}
                  </span>
                  {item.blocked && <Chip size="small" color="warning" icon={<ShieldOutlinedIcon />} label="Blocked" />}
                  {item.intent && item.role === "assistant" && <Chip size="small" label={item.intent} variant="outlined" />}
                  {item.usedRag && <Chip size="small" color="success" label="RAG used" variant="outlined" />}
                  {item.provider && <Chip size="small" label={item.provider} variant="outlined" />}
                  {item.language && <Chip size="small" label={item.language} variant="outlined" />}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6">{item.text}</p>
                {!!item.suggestions?.length && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.suggestions.map((suggestion) => (
                      <Chip key={suggestion} size="small" label={suggestion} variant="outlined" />
                    ))}
                  </div>
                )}
                <SourceList sources={item.sources} />
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="mr-10 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CircularProgress size={16} sx={{ mr: 1 }} /> Checking policy, retrieving SEAL context, then answering...
              </div>
            )}
          </div>

          <footer className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            {attachmentFileName && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Attached text loaded: {attachmentFileName}. If it is an assignment prompt and you ask for full code, the assistant will block and offer safe guidance instead.
              </Alert>
            )}
            <div className="mb-2 grid grid-cols-2 gap-2">
              <TextField
                select
                size="small"
                label="Language"
                value={preferredLanguage}
                onChange={(event) => setPreferredLanguage(event.target.value as AiLanguage | "AUTO")}
              >
                <MenuItem value="AUTO">Auto</MenuItem>
                <MenuItem value="VI">Vietnamese</MenuItem>
                <MenuItem value="EN">English</MenuItem>
                <MenuItem value="MIXED">Mixed</MenuItem>
              </TextField>
              <TextField
                size="small"
                label="Translate target optional"
                placeholder="English / Vietnamese"
                value={translationTarget}
                onChange={(event) => setTranslationTarget(event.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <TextField
                fullWidth
                size="small"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask about SEAL, translate, or request safe technical guidance..."
                multiline
                maxRows={4}
              />
              <div className="flex flex-col gap-2">
                <input ref={fileInputRef} type="file" hidden onChange={handleFile} accept=".txt,.md,.json,.csv,.log,.java,.ts,.tsx,.html,.css" />
                <Button variant="outlined" onClick={() => fileInputRef.current?.click()} sx={{ minWidth: 48 }}>
                  <UploadFileOutlinedIcon />
                </Button>
                <Button
                  variant="contained"
                  onClick={() => sendMessage()}
                  disabled={!message.trim() || chatMutation.isPending}
                  sx={{ minWidth: 48 }}
                >
                  <SendOutlinedIcon />
                </Button>
              </div>
            </div>
            <Divider sx={{ my: 1.5 }} />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <TranslateOutlinedIcon fontSize="inherit" />
              Vietnamese/English translation is allowed. Full code for team submissions is blocked.
            </div>
          </footer>
        </Box>
      </Drawer>
    </>
  );
}
