import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";
import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

import {
  useAssistantContextQuery,
  useAssistantConversationsQuery,
  useAssistantMessagesQuery,
} from "@/features/assistant/hooks/useAssistantQueries";
import { useAssistantChatMutation } from "@/features/assistant/hooks/useAssistantMutations";
import type {
  AiLanguage,
  AssistantChatRequest,
  AssistantChatResponse,
  AssistantMessageResponse,
  AssistantSourceResponse,
} from "@/types/assistant.types";
import type { UUID } from "@/types/common.types";

const FALLBACK_PROMPTS = [
  "How do I submit deliverables?",
  "Explain a 403 error without writing the solution for me.",
  "What happens after judging is complete?",
];

const MAX_ATTACHMENT_BYTES = 256 * 1024;
const MAX_ATTACHMENT_CHARACTERS = 6_000;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  blocked?: boolean;
  intent?: string | null;
  language?: AiLanguage | null;
  provider?: string | null;
  model?: string | null;
  usedRag?: boolean | null;
  suggestions?: string[];
  sources?: AssistantSourceResponse[];
  isError?: boolean;
  retryPayload?: AssistantChatRequest;
};

type ApiError = {
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

function makeAssistantMessage(response: AssistantChatResponse): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: response.answer,
    blocked: response.blocked,
    intent: response.intent,
    language: response.language,
    provider: response.provider,
    model: response.model,
    usedRag: response.usedRag,
    suggestions: response.suggestedActions ?? [],
    sources: response.sources ?? [],
  };
}

function makePersistedMessage(message: AssistantMessageResponse): ChatMessage {
  return {
    id: message.id,
    role: message.role === "USER" ? "user" : "assistant",
    text: message.content,
    blocked: message.safetyDecision === "BLOCK",
    intent: message.intent,
    language: message.language,
    provider: message.provider,
    model: message.model,
    usedRag: message.usedRag,
  };
}

function getErrorStatus(error: unknown) {
  return (error as ApiError | undefined)?.response?.status;
}

function getErrorMessage(error: unknown) {
  const apiError = error as ApiError | undefined;
  return (
    apiError?.response?.data?.message ||
    apiError?.message ||
    "The assistant could not answer. Check your connection and try again."
  );
}

function SourceList({ sources }: { sources?: AssistantSourceResponse[] }) {
  if (!sources?.length) return null;

  return (
    <details className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-950/70">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
        <SourceOutlinedIcon sx={{ fontSize: 15 }} />
        {sources.length} SEAL {sources.length === 1 ? "source" : "sources"}
      </summary>
      <div className="mt-2 space-y-2">
        {sources.slice(0, 3).map((source) => (
          <article
            key={source.chunkId}
            className="rounded-md bg-white p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
          >
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              {source.title}
              {source.useCaseId ? ` · ${source.useCaseId}` : ""}
            </p>
            <p className="mt-1 line-clamp-3 leading-5">{source.excerpt}</p>
          </article>
        ))}
      </div>
    </details>
  );
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<UUID | undefined>();
  const [startFresh, setStartFresh] = useState(false);
  const [historyHydrated, setHistoryHydrated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyAnchor, setHistoryAnchor] = useState<HTMLElement | null>(null);
  const [preferredLanguage, setPreferredLanguage] =
    useState<AiLanguage | "AUTO">("AUTO");
  const [translationTarget, setTranslationTarget] = useState("");
  const [attachmentText, setAttachmentText] = useState("");
  const [attachmentFileName, setAttachmentFileName] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [attachmentTruncated, setAttachmentTruncated] = useState(false);
  const [isReadingAttachment, setIsReadingAttachment] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileReaderRef = useRef<FileReader | null>(null);
  const composerRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const contextQuery = useAssistantContextQuery(open);
  const conversationsQuery = useAssistantConversationsQuery(open);
  const messagesQuery = useAssistantMessagesQuery(
    conversationId,
    open && !startFresh,
  );
  const chatMutation = useAssistantChatMutation();

  const quickPrompts = useMemo(
    () =>
      contextQuery.data?.quickPrompts?.length
        ? contextQuery.data.quickPrompts.slice(0, 4)
        : FALLBACK_PROMPTS,
    [contextQuery.data?.quickPrompts],
  );

  const contextErrorStatus = getErrorStatus(contextQuery.error);
  const contextBlocked = contextErrorStatus === 401 || contextErrorStatus === 403;
  const modelLabel =
    typeof contextQuery.data?.roleContext?.chatModel === "string"
      ? contextQuery.data.roleContext.chatModel
      : "SEAL model";

  const isLoadingHistory =
    open &&
    !startFresh &&
    !historyHydrated &&
    (conversationsQuery.isLoading ||
      (Boolean(conversationId) && messagesQuery.isLoading));

  useEffect(() => {
    if (
      !open ||
      startFresh ||
      conversationId ||
      conversationsQuery.data === undefined
    ) {
      return;
    }

    const latestConversation = conversationsQuery.data[0];
    if (latestConversation) {
      setConversationId(latestConversation.id);
      setHistoryHydrated(false);
    } else {
      setHistoryHydrated(true);
    }
  }, [
    conversationId,
    conversationsQuery.data,
    open,
    startFresh,
  ]);

  useEffect(() => {
    if (
      !open ||
      startFresh ||
      !conversationId ||
      historyHydrated ||
      messagesQuery.data === undefined ||
      chatMutation.isPending
    ) {
      return;
    }

    setChat(messagesQuery.data.map(makePersistedMessage));
    setHistoryHydrated(true);
  }, [
    chatMutation.isPending,
    conversationId,
    historyHydrated,
    messagesQuery.data,
    open,
    startFresh,
  ]);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => composerRef.current?.focus(), 120);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: chat.length > 1 ? "smooth" : "auto",
      block: "end",
    });
  }, [chat.length, chatMutation.isPending, isLoadingHistory, open]);

  const clearAttachment = () => {
    fileReaderRef.current?.abort();
    fileReaderRef.current = null;
    setAttachmentText("");
    setAttachmentFileName("");
    setAttachmentError("");
    setAttachmentTruncated(false);
    setIsReadingAttachment(false);
  };

  const sendPayload = async (
    payload: AssistantChatRequest,
    appendUserMessage: boolean,
  ) => {
    if (chatMutation.isPending) return;

    if (appendUserMessage) {
      setChat((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "user",
          text: payload.attachmentFileName
            ? `${payload.message}\n\nAttached: ${payload.attachmentFileName}`
            : payload.message,
          language: payload.preferredLanguage,
        },
      ]);
    }
    setMessage("");

    try {
      const response = await chatMutation.mutateAsync(payload);
      setConversationId(response.conversationId);
      setStartFresh(false);
      setHistoryHydrated(true);
      setChat((current) => [...current, makeAssistantMessage(response)]);
      clearAttachment();
      setTranslationTarget("");
    } catch (error: unknown) {
      setChat((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: getErrorMessage(error),
          intent: "ERROR",
          isError: true,
          retryPayload: payload,
        },
      ]);
    }
  };

  const sendMessage = async (
    text = message,
    targetLanguage = translationTarget,
  ) => {
    const trimmed = text.trim();
    if (
      !trimmed ||
      chatMutation.isPending ||
      isReadingAttachment ||
      contextBlocked
    ) {
      return;
    }

    await sendPayload(
      {
        message: trimmed,
        conversationId,
        pageContext: window.location.pathname,
        preferredLanguage:
          preferredLanguage === "AUTO" ? undefined : preferredLanguage,
        attachmentText: attachmentText || undefined,
        attachmentFileName: attachmentFileName || undefined,
        translationTargetLanguage: targetLanguage || undefined,
      },
      true,
    );
  };

  const retryMessage = async (item: ChatMessage) => {
    if (!item.retryPayload || chatMutation.isPending) return;
    setChat((current) => current.filter((messageItem) => messageItem.id !== item.id));
    await sendPayload(item.retryPayload, false);
  };

  const beginNewChat = () => {
    setStartFresh(true);
    setConversationId(undefined);
    setChat([]);
    setMessage("");
    clearAttachment();
    setTranslationTarget("");
    setHistoryHydrated(true);
    setHistoryAnchor(null);
    window.setTimeout(() => composerRef.current?.focus(), 0);
  };

  const selectConversation = (id: UUID) => {
    setStartFresh(false);
    setConversationId(id);
    setChat([]);
    setHistoryHydrated(false);
    setHistoryAnchor(null);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    clearAttachment();
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentError("Choose a text file smaller than 256 KB.");
      return;
    }

    setAttachmentFileName(file.name);
    setIsReadingAttachment(true);
    const reader = new FileReader();
    fileReaderRef.current = reader;
    reader.onload = () => {
      if (fileReaderRef.current !== reader) return;
      const text = String(reader.result ?? "");
      setAttachmentText(text.slice(0, MAX_ATTACHMENT_CHARACTERS));
      setAttachmentTruncated(text.length > MAX_ATTACHMENT_CHARACTERS);
      setIsReadingAttachment(false);
      fileReaderRef.current = null;
    };
    reader.onerror = () => {
      if (fileReaderRef.current !== reader) return;
      fileReaderRef.current = null;
      clearAttachment();
      setAttachmentError("The file could not be read. Try another text file.");
    };
    reader.readAsText(file);
  };

  const assistantStatusMessage =
    contextErrorStatus === 403
      ? "The assistant is disabled for this workspace."
      : contextErrorStatus === 401
        ? "Your session expired. Sign in again to use the assistant."
        : "The assistant service could not be reached.";

  return (
    <>
      {!open && (
        <Tooltip title="Open SEAL AI" placement="left">
          <IconButton
            aria-label="Open SEAL AI assistant"
            onClick={() => setOpen(true)}
            sx={{
              position: "fixed",
              right: { xs: 16, sm: 24 },
              bottom: {
                xs: "calc(16px + env(safe-area-inset-bottom))",
                sm: 24,
              },
              zIndex: (theme) => theme.zIndex.modal + 1,
              width: 52,
              height: 52,
              bgcolor: "#1d4ed8",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 16px 38px rgba(30, 64, 175, 0.3)",
              transition: "transform 180ms ease, background-color 180ms ease",
              "&:hover": { bgcolor: "#1e40af", transform: "translateY(-2px)" },
              "&:active": { transform: "translateY(0) scale(0.97)" },
              "&:focus-visible": {
                outline: "3px solid rgba(59, 130, 246, 0.35)",
                outlineOffset: 3,
              },
            }}
          >
            <SmartToyOutlinedIcon />
          </IconButton>
        </Tooltip>
      )}

      {open && (
        <Paper
          component="section"
          role="dialog"
          aria-modal="false"
          aria-labelledby="seal-ai-title"
          elevation={0}
          className="flex flex-col overflow-hidden border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
          sx={{
            position: "fixed",
            right: { xs: 12, sm: 24 },
            bottom: {
              xs: "calc(12px + env(safe-area-inset-bottom))",
              sm: 24,
            },
            zIndex: (theme) => theme.zIndex.modal + 1,
            width: { xs: "calc(100vw - 24px)", sm: 400 },
            height: {
              xs: "min(660px, calc(100dvh - 24px - env(safe-area-inset-bottom)))",
              sm: "min(640px, calc(100dvh - 48px))",
            },
            borderRadius: { xs: "18px", sm: "20px" },
            boxShadow: "0 28px 80px rgba(15, 23, 42, 0.24)",
          }}
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white">
                <SmartToyOutlinedIcon sx={{ fontSize: 20 }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2
                    id="seal-ai-title"
                    className="truncate text-sm font-bold tracking-tight text-slate-950 dark:text-white"
                  >
                    SEAL AI
                  </h2>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      contextQuery.isError ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {contextQuery.isLoading ? "Connecting…" : modelLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <Tooltip title="Conversation history">
                <IconButton
                  size="small"
                  aria-label="Open conversation history"
                  onClick={(event) => setHistoryAnchor(event.currentTarget)}
                >
                  <HistoryOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="New chat">
                <IconButton
                  size="small"
                  aria-label="Start a new chat"
                  onClick={beginNewChat}
                >
                  <AddCommentOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton
                  size="small"
                  aria-label="Close SEAL AI assistant"
                  onClick={() => setOpen(false)}
                >
                  <CloseOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          </header>

          <Menu
            anchorEl={historyAnchor}
            open={Boolean(historyAnchor)}
            onClose={() => setHistoryAnchor(null)}
            slotProps={{ paper: { sx: { width: 300, maxHeight: 340 } } }}
          >
            <MenuItem onClick={beginNewChat}>
              <AddCommentOutlinedIcon sx={{ mr: 1.5, fontSize: 19 }} />
              New conversation
            </MenuItem>
            {conversationsQuery.isLoading && (
              <MenuItem disabled>
                <CircularProgress size={16} sx={{ mr: 1.5 }} /> Loading history…
              </MenuItem>
            )}
            {!conversationsQuery.isLoading &&
              conversationsQuery.data?.length === 0 && (
                <MenuItem disabled>No saved conversations</MenuItem>
              )}
            {conversationsQuery.data?.map((conversation) => (
              <MenuItem
                key={conversation.id}
                selected={conversation.id === conversationId && !startFresh}
                onClick={() => selectConversation(conversation.id)}
                sx={{ display: "block" }}
              >
                <p className="truncate text-sm font-medium">{conversation.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {new Date(conversation.updatedAt).toLocaleString()}
                </p>
              </MenuItem>
            ))}
          </Menu>

          {contextQuery.isError && (
            <Alert
              severity={contextBlocked ? "warning" : "info"}
              action={
                !contextBlocked ? (
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<RefreshOutlinedIcon />}
                    onClick={() => void contextQuery.refetch()}
                  >
                    Retry
                  </Button>
                ) : undefined
              }
              sx={{ borderRadius: 0, py: 0.5 }}
            >
              {assistantStatusMessage}
            </Alert>
          )}

          <div
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
            role="log"
            aria-live="polite"
            aria-label="SEAL AI conversation"
          >
            {isLoadingHistory && (
              <div className="flex h-full min-h-40 flex-col items-center justify-center gap-3 text-sm text-slate-500">
                <CircularProgress size={22} />
                Restoring your latest conversation…
              </div>
            )}

            {!isLoadingHistory && chat.length === 0 && (
              <div className="space-y-4 pt-2">
                <div className="rounded-xl bg-white p-4 dark:bg-slate-900">
                  <div className="flex items-start gap-3">
                    <LightbulbOutlinedIcon
                      className="mt-0.5 text-blue-700 dark:text-blue-400"
                      fontSize="small"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        How can I help?
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Ask about SEAL workflows, translate instructions, or debug code
                        you have written. Academic-integrity safeguards stay on.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={chatMutation.isPending || contextBlocked}
                      onClick={() => void sendMessage(prompt)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-medium leading-5 text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isLoadingHistory &&
              chat.map((item) => (
                <article
                  key={item.id}
                  className={
                    item.role === "user"
                      ? "ml-10 rounded-2xl rounded-br-md bg-blue-700 px-3.5 py-3 text-white"
                      : item.isError
                        ? "mr-8 rounded-2xl rounded-bl-md border border-red-200 bg-red-50 px-3.5 py-3 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100"
                        : "mr-8 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 text-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  }
                >
                  {item.blocked && (
                    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                      <ShieldOutlinedIcon sx={{ fontSize: 15 }} />
                      Request blocked for academic integrity
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">
                    {item.text}
                  </p>

                  {item.isError && item.retryPayload && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<RefreshOutlinedIcon />}
                      onClick={() => void retryMessage(item)}
                      disabled={chatMutation.isPending}
                      sx={{ mt: 1 }}
                    >
                      Retry answer
                    </Button>
                  )}

                  {!!item.suggestions?.length && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.suggestions.slice(0, 3).map((suggestion) => (
                        <Button
                          key={suggestion}
                          size="small"
                          variant="outlined"
                          onClick={() => void sendMessage(suggestion)}
                          disabled={chatMutation.isPending || contextBlocked}
                          sx={{ borderRadius: 2, fontSize: 11, px: 1.25, py: 0.25 }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}

                  <SourceList sources={item.sources} />

                  {item.role === "assistant" && (item.model || item.provider) && (
                    <p className="mt-2 text-[10px] text-slate-400">
                      {[item.model, item.usedRag ? "SEAL sources" : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </article>
              ))}

            {chatMutation.isPending && (
              <div className="mr-24 flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <CircularProgress size={14} />
                Checking context and preparing an answer…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <footer className="shrink-0 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <Collapse in={settingsOpen}>
              <div className="mb-2 grid grid-cols-1 gap-2 rounded-xl bg-slate-50 p-2 sm:grid-cols-2 dark:bg-slate-950/70">
                <TextField
                  select
                  size="small"
                  label="Answer language"
                  value={preferredLanguage}
                  onChange={(event) =>
                    setPreferredLanguage(event.target.value as AiLanguage | "AUTO")
                  }
                >
                  <MenuItem value="AUTO">Auto detect</MenuItem>
                  <MenuItem value="VI">Vietnamese</MenuItem>
                  <MenuItem value="EN">English</MenuItem>
                  <MenuItem value="MIXED">Mixed</MenuItem>
                </TextField>
                <TextField
                  size="small"
                  label="Translate to"
                  placeholder="Optional"
                  value={translationTarget}
                  onChange={(event) => setTranslationTarget(event.target.value)}
                />
              </div>
            </Collapse>

            {(attachmentFileName || attachmentError) && (
              <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <span className="min-w-0 truncate">
                  {attachmentError ||
                    (isReadingAttachment
                      ? `Reading ${attachmentFileName}…`
                      : `${attachmentFileName}${attachmentTruncated ? " · first 6,000 characters" : ""}`)}
                </span>
                <IconButton
                  size="small"
                  aria-label="Remove attached file"
                  onClick={clearAttachment}
                >
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </div>
            )}

            <div className="flex items-end gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleFile}
                accept=".txt,.md,.json,.csv,.log,.java,.ts,.tsx,.html,.css"
              />
              <Tooltip title="Attach a text file">
                <span>
                  <IconButton
                    aria-label="Attach a text file"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isReadingAttachment || contextBlocked}
                    sx={{ mb: 0.25 }}
                  >
                    <AttachFileOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <TextField
                inputRef={composerRef}
                fullWidth
                size="small"
                value={message}
                disabled={contextBlocked}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                aria-label="Message SEAL AI"
                placeholder={contextBlocked ? "Assistant unavailable" : "Message SEAL AI"}
                multiline
                maxRows={4}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    pr: 0.5,
                  },
                }}
              />

              <Tooltip title="Language options">
                <IconButton
                  aria-label="Toggle language options"
                  aria-expanded={settingsOpen}
                  onClick={() => setSettingsOpen((current) => !current)}
                  sx={{ mb: 0.25 }}
                >
                  {settingsOpen ? (
                    <TranslateOutlinedIcon fontSize="small" />
                  ) : (
                    <TuneOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Send">
                <span>
                  <IconButton
                    aria-label="Send message"
                    onClick={() => void sendMessage()}
                    disabled={
                      !message.trim() ||
                      chatMutation.isPending ||
                      isReadingAttachment ||
                      contextBlocked
                    }
                    sx={{
                      mb: 0.25,
                      bgcolor: "#1d4ed8",
                      color: "white",
                      "&:hover": { bgcolor: "#1e40af" },
                      "&.Mui-disabled": {
                        bgcolor: "action.disabledBackground",
                      },
                    }}
                  >
                    <SendRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </div>

            <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldOutlinedIcon sx={{ fontSize: 12 }} />
              AI can make mistakes. Verify important event information.
            </div>
          </footer>
        </Paper>
      )}
    </>
  );
}
