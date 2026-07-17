import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdvanceRulesQuery } from "../hooks/useAdvancementQueries";
import {
  useCreateAdvanceRuleMutation,
  useDeleteAdvanceRuleMutation,
  useUpdateAdvanceRuleMutation,
} from "../hooks/useAdvancementMutations";
import type { AdvanceRuleResponse, AdvanceRuleType } from "@/types/round.types";
import type { TrackResponse } from "@/types/track.types";
import { ActionConfirmDialog } from "@/components/common/ActionConfirmDialog";

interface AdvanceRulePanelProps {
  roundId: string;
  isLocked?: boolean;
  tracks: TrackResponse[];
}

const ruleSchema = z.object({
  ruleType: z.string().min(1, "Rule type is required"),
  value: z.coerce.number().positive("Value must be greater than 0"),
  trackId: z.string().optional(),
  description: z.string().optional(),
}).superRefine((data, context) => {
  if (
    ["TOP_N", "WILDCARD"].includes(data.ruleType) &&
    !Number.isInteger(data.value)
  ) {
    context.addIssue({
      code: "custom",
      path: ["value"],
      message: "Value must be a whole number",
    });
  }
  if (data.ruleType === "TOP_PERCENT" && data.value > 100) {
    context.addIssue({
      code: "custom",
      path: ["value"],
      message: "Percentage must not exceed 100",
    });
  }
});

type RuleFormData = z.infer<typeof ruleSchema>;

const getRuleValue = (rule: AdvanceRuleResponse) => {
  switch (rule.ruleType) {
    case "TOP_N":
      return rule.topN;
    case "TOP_PERCENT":
      return rule.topPercent;
    case "MIN_SCORE":
      return rule.minScore;
    case "WILDCARD":
      return rule.wildCardSlots;
    default:
      return "-";
  }
};

const ruleHelperText: Record<string, string> = {
  TOP_N: "Advance the top N teams in each track.",
  TOP_PERCENT: "Advance the top percentage of ranked teams.",
  MIN_SCORE: "Advance teams whose total score is above the threshold.",
  WILDCARD: "Coordinator manually selects extra teams.",
};

export function AdvanceRulePanel({
  roundId,
  isLocked,
  tracks,
}: AdvanceRulePanelProps) {
  const { data: rules, isLoading } = useAdvanceRulesQuery(roundId);
  const createMutation = useCreateAdvanceRuleMutation();
  const updateMutation = useUpdateAdvanceRuleMutation();
  const deleteMutation = useDeleteAdvanceRuleMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema) as Resolver<RuleFormData>,
    defaultValues: {
      ruleType: "TOP_N",
      value: 0,
      trackId: "",
      description: "",
    },
  });

  const onSubmit = async (data: RuleFormData) => {
    const payload = {
      ruleType: data.ruleType as AdvanceRuleType,
      topN: data.ruleType === "TOP_N" ? data.value : undefined,
      minScore: data.ruleType === "MIN_SCORE" ? data.value : undefined,
      topPercent: data.ruleType === "TOP_PERCENT" ? data.value : undefined,
      wildCardSlots: data.ruleType === "WILDCARD" ? data.value : undefined,
      trackId: data.trackId || null,
      description: data.description || "",
    };

    if (editingRuleId) {
      await updateMutation.mutateAsync({
        ruleId: editingRuleId,
        roundId,
        payload,
      });
      setEditingRuleId(null);
    } else {
      await createMutation.mutateAsync({ roundId, payload });
    }
    setIsAdding(false);
    reset();
  };

  const handleEdit = (rule: AdvanceRuleResponse) => {
    setEditingRuleId(rule.id);
    setIsAdding(true);
    reset({
      ruleType: rule.ruleType,
      value: getRuleValue(rule) as number,
      trackId: rule.trackId || "",
      description: rule.description || "",
    });
  };

  const handleDelete = (ruleId: string) => setRuleToDelete(ruleId);

  const confirmDelete = async () => {
    if (!ruleToDelete) return;
    await deleteMutation.mutateAsync({ ruleId: ruleToDelete, roundId });
    setRuleToDelete(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-300">
          Advance Rules
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setIsAdding(true)}
            disabled={isAdding || isLocked}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              boxShadow: "none",
              height: 40,
            }}
          >
            Add rule
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton
              variant="rectangular"
              height={80}
              className="rounded-xl"
            />
            <Skeleton
              variant="rectangular"
              height={80}
              className="rounded-xl"
            />
          </>
        ) : (
          rules?.map((rule) => (
            <Card
              key={rule.id}
              variant="outlined"
              className="rounded-xl border-slate-200 dark:border-slate-700"
            >
              <CardContent className="flex items-center justify-between p-4 last:pb-4">
                <div className="flex items-center gap-4">
                  <Chip label={rule.ruleType} color="primary" size="small" />
                  <Typography className="font-semibold text-slate-700 dark:text-slate-300">
                    Value: {getRuleValue(rule)}
                  </Typography>
                  {rule.trackId && (
                    <Chip
                      label={
                        tracks.find((track) => track.id === rule.trackId)?.name
                          ?? "Track Specific"
                      }
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {rule.description && (
                    <Typography variant="body2" className="text-slate-500">
                      {rule.description}
                    </Typography>
                  )}
                  {ruleHelperText[rule.ruleType] && (
                    <Typography
                      variant="caption"
                      className="text-slate-400 dark:text-slate-500 italic"
                    >
                      {ruleHelperText[rule.ruleType]}
                    </Typography>
                  )}
                </div>
                <div className="flex gap-2">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(rule)}
                    disabled={
                      deleteMutation.isPending || updateMutation.isPending || isLocked
                    }
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(rule.id)}
                    disabled={
                      deleteMutation.isPending || updateMutation.isPending || isLocked
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {rules?.length === 0 && !isAdding && !isLoading && (
          <Typography className="text-center text-slate-500 py-4">
            No rules configured. Add a rule to start.
          </Typography>
        )}

        {isAdding && (
          <Card
            variant="outlined"
            className="rounded-xl border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10"
          >
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-wrap gap-4 items-start"
              >
                <Controller
                  name="ruleType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Rule Type"
                      size="small"
                      error={!!errors.ruleType}
                      helperText={errors.ruleType?.message}
                      className="min-w-[150px]"
                    >
                      <MenuItem value="TOP_N">Top N</MenuItem>
                      <MenuItem value="TOP_PERCENT">Top Percent</MenuItem>
                      <MenuItem value="MIN_SCORE">Min Score</MenuItem>
                      <MenuItem value="WILDCARD">Wildcard</MenuItem>
                    </TextField>
                  )}
                />
                <Controller
                  name="value"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Value"
                      size="small"
                      error={!!errors.value}
                      helperText={errors.value?.message}
                    />
                  )}
                />
                <Controller
                  name="trackId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Track Scope"
                      size="small"
                      error={!!errors.trackId}
                      helperText={errors.trackId?.message}
                    >
                      <MenuItem value="">All tracks</MenuItem>
                      {tracks.map((track) => (
                        <MenuItem key={track.id} value={track.id}>
                          {track.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      size="small"
                      className="flex-1 min-w-[200px]"
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
                <div className="flex gap-2 w-full mt-2 justify-end">
                  <Button
                    onClick={() => {
                      setIsAdding(false);
                      setEditingRuleId(null);
                      reset();
                    }}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "10px",
                      boxShadow: "none",
                      height: 40,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "10px",
                      boxShadow: "none",
                      height: 40,
                    }}
                  >
                    Save Rule
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      <ActionConfirmDialog
        open={ruleToDelete !== null}
        title="Delete advance rule?"
        description="This rule will no longer be used when calculating which teams advance."
        confirmLabel="Delete rule"
        severity="error"
        onClose={() => setRuleToDelete(null)}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
