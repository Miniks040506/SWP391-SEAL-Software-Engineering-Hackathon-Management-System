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
	if (!sources?.length) {
		return null;
	}
	
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
		</>
	)
}
