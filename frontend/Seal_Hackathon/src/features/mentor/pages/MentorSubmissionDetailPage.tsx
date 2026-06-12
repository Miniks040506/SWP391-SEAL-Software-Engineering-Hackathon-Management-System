import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import { MentorSubmissionDetailCard } from "../components/submission/MentorSubmissionDetailCard";
import { MentorSubmissionLinksList } from "../components/submission/MentorSubmissionLinkList";
import { useMentorSubmission } from "../hooks/useMentorSubmission";

export const MentorSubmissionDetailPage = () => {
  const { submissionDetailQuery, goBackToHistory } = useMentorSubmission();
  
  const { data: response, isLoading, isError } = submissionDetailQuery;
  const submission = response?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load submission details or submission not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={goBackToHistory}
        >
          Back to History
        </Button>
      </div>

      <MentorSubmissionDetailCard submission={submission} />
      <MentorSubmissionLinksList links={submission.links} />
    </div>
  );
};