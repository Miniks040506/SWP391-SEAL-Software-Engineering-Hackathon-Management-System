import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  TextField,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";

import { useCreateAiKnowledgeDocumentMutation, useReindexAiKnowledgeMutation, useSeedAiKnowledgeMutation } from "@/features/assistant/hooks/useAssistantAdminMutations";
import { useAiKnowledgeDocumentsQuery } from "@/features/assistant/hooks/useAssistantAdminQueries";

const visibilityOptions = ["PUBLIC", "AUTHENTICATED", "STUDENT", "JUDGE", "MENTOR", "COORDINATOR", "ADMIN", "STAFF_ONLY"];

export function AdminAiKnowledgePage() {
  const { data, isLoading, isError } = useAiKnowledgeDocumentsQuery();
  const createMutation = useCreateAiKnowledgeDocumentMutation();
  const seedMutation = useSeedAiKnowledgeMutation();
  const reindexMutation = useReindexAiKnowledgeMutation();
  const [form, setForm] = useState({
    title: "",
    docType: "USER_GUIDE",
    sourceRef: "manual",
    visibility: "AUTHENTICATED",
    module: "GENERAL",
    useCaseId: "",
    roleScope: "ALL",
    content: "",
  });

  const canSubmit = form.title.trim() && form.content.trim();

  const submit = async () => {
    if (!canSubmit) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await createMutation.mutateAsync(form as any);
    setForm((current) => ({ ...current, title: "", content: "", useCaseId: "" }));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PsychologyOutlinedIcon color="primary" />
            <h1 className="text-2xl font-black text-slate-950 dark:text-white">AI Knowledge Base</h1>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Add SEAL docs, guides, policies and tech notes used by the assistant RAG pipeline. Keep assignment/team-solution code out of the global knowledge base.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outlined"
            startIcon={<AutoFixHighOutlinedIcon />}
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
          >
            Seed default knowledge
          </Button>
          <Button
            variant="contained"
            startIcon={<HubOutlinedIcon />}
            onClick={() => reindexMutation.mutate()}
            disabled={reindexMutation.isPending}
          >
            Reindex embeddings
          </Button>
        </div>
      </div>

      <Alert severity="info">
        Recommended docs: UseCase Table, Entity Design, API guide, role permission matrix, user manual, FAQ, and academic-integrity policy. Visibility controls which roles can retrieve each document. After changing AI keys or embedding model, click <b>Reindex embeddings</b>.
      </Alert>

      {reindexMutation.data && (
        <Alert severity="success">
          Reindexed {reindexMutation.data.indexedChunks} chunks using {reindexMutation.data.embeddingModel} ({reindexMutation.data.dimension} dimensions).
        </Alert>
      )}

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-bold">Create knowledge document</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField label="Doc type" value={form.docType} onChange={(e) => setForm({ ...form, docType: e.target.value })} />
            <TextField label="Source ref" value={form.sourceRef} onChange={(e) => setForm({ ...form, sourceRef: e.target.value })} />
            <TextField select label="Visibility" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
              {visibilityOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
            <TextField label="Module" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} />
            <TextField label="Use case ID" value={form.useCaseId} onChange={(e) => setForm({ ...form, useCaseId: e.target.value })} />
            <TextField label="Role scope" value={form.roleScope} onChange={(e) => setForm({ ...form, roleScope: e.target.value })} />
          </div>
          <TextField
            label="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            multiline
            minRows={8}
            fullWidth
            placeholder="Paste SEAL documentation, guide, policy, FAQ or tech note here..."
          />
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={submit}
            disabled={!canSubmit || createMutation.isPending}
          >
            Add to knowledge base
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-lg font-bold">Knowledge documents</h2>
          <Divider sx={{ my: 2 }} />
          {isLoading && <CircularProgress size={22} />}
          {isError && <Alert severity="error">Could not load AI knowledge documents.</Alert>}
          <div className="grid gap-3">
            {data?.map((doc) => (
              <Box key={doc.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{doc.title}</h3>
                    <p className="text-sm text-slate-500">{doc.sourceRef}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Chip size="small" label={doc.docType} />
                    <Chip size="small" label={doc.visibility} variant="outlined" />
                    <Chip size="small" label={`${doc.chunkCount} chunks`} color="primary" variant="outlined" />
                    <Chip size="small" label={doc.module ?? "GENERAL"} variant="outlined" />
                  </div>
                </div>
              </Box>
            ))}
            {!isLoading && !data?.length && <Alert severity="warning">No AI knowledge documents yet. Seed defaults or add your project docs.</Alert>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
