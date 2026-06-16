import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import { createJudgeGradingSchema, type JudgeGradingFormValues } from "../../schemas/judgeGrading.schema";
import { useSubmitJudgeScoreMutation } from "../../hooks/useJudge";

type Criteria = {
  id: string;
  name: string;
  description: string;
  maxScore: number;
};

type Props = {
  submissionId: string;
  criteria: Criteria[];
  gradingStatus: string;
  scoredData?: any;
};

export const JudgeGradingPanel = ({ submissionId, criteria, gradingStatus, scoredData }: Props) => {
  const isScored = gradingStatus === "SCORED";
  const submitMutation = useSubmitJudgeScoreMutation(submissionId);

  const defaultScores = isScored && scoredData ? scoredData.scores : {};

  const dynamicSchema = useMemo(() => createJudgeGradingSchema(criteria), [criteria]);

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<JudgeGradingFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      scores: defaultScores,
      comment: scoredData?.comment || "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: JudgeGradingFormValues) => {
    if (!window.confirm("Are you sure you want to submit these scores? You might not be able to change them later.")) return;
    submitMutation.mutate(data);
  };

  const totalScore = criteria.reduce((sum, crit) => sum + crit.maxScore, 0);

  return (
    <Card variant="outlined" className="rounded-2xl border-blue-200 bg-blue-50/30 dark:border-blue-900/50 dark:bg-slate-800/80">
      <CardContent className="p-8">
        <div className="mb-6 flex items-center justify-between border-b border-blue-100 pb-4 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-extrabold text-blue-900 dark:text-blue-400">Scoring Panel</h2>
            <p className="text-sm font-medium text-blue-600/80 dark:text-blue-300/80">
              Evaluate the submission based on the assigned criteria. Total: {totalScore} pts.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {criteria.map((crit) => (
              <div key={crit.id} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-900">
                <div className="flex-1">
                  <p className="font-extrabold text-gray-900 dark:text-white">{crit.name}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{crit.description}</p>
                </div>
                <div className="w-full shrink-0 md:w-32">
                  <Controller
                    name={`scores.${crit.id}`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        label={`Score (Max: ${crit.maxScore})`}
                        fullWidth
                        size="small"
                        disabled={isScored || submitMutation.isPending}
                        error={Boolean(errors.scores?.[crit.id])} // Bắt lỗi màu đỏ
                        helperText={errors.scores?.[crit.id]?.message} // Hiển thị text cảnh báo
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: isScored ? "rgba(0,0,0,0.03)" : "transparent" } }}
                      />
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <Controller
              name="comment"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Private Note / Comments (Optional)"
                  fullWidth
                  multiline
                  minRows={3}
                  disabled={isScored || submitMutation.isPending}
                  placeholder="Leave a note about why you gave these scores..."
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
              )}
            />
          </div>

          {!isScored && (
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!isValid || submitMutation.isPending}
                sx={{ bgcolor: "#16a34a", fontWeight: 800, textTransform: "none", borderRadius: "10px", "&:hover": { bgcolor: "#15803d" } }}
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Official Score"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};