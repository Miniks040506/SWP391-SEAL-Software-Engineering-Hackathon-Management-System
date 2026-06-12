import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import { MentorSubmissionDetailCard } from "../components/submission/MentorSubmissionDetailCard";
import { MentorSubmissionLinksList } from "../components/submission/MentorSubmissionLinkList";

import { useMentorSubmissions } from "../hooks/useMentorSubmission";

export const MentorSubmissionDetailPage = () => {
  // Lấy query và hàm điều hướng từ hook
  const { submissionDetailQuery, goBackToHistory } = useMentorSubmissions();
  
  const { data: response, isLoading, isError } = submissionDetailQuery;
  
  // Axios thường bọc data trong thuộc tính data
  // Hàm mock của chúng ta cũng đã bọc { data: mockSubmissionDetail }
  const submission = response?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <CircularProgress />
        <p className="text-gray-500 dark:text-slate-400">Loading submission details...</p>
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-8 text-center dark:border-slate-700 dark:bg-[#1e293b]">
        <p className="text-lg font-medium text-red-500 dark:text-red-400">
          Failed to load submission details or submission not found.
        </p>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={goBackToHistory}
          className="mt-6"
        >
          Go Back
        </Button>
      </div>
    );
  }

  // 3. Trạng thái Thành công (Success)
  return (
    <div className="space-y-6">
      {/* Thanh điều hướng */}
      <div className="flex items-center gap-4">
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={goBackToHistory}
          className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
        >
          Back to Track Submissions
        </Button>
      </div>

      {/* Header của trang chi tiết */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Submission Detail
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Review the specific deliverables and notes from the team.
        </p>
      </div>

      {/* Component hiển thị Thông tin chung (Status, Round, Notes) */}
      <MentorSubmissionDetailCard submission={submission} />
      
      {/* Component hiển thị Danh sách các Link (GitHub, Demo, Report) */}
      <MentorSubmissionLinksList links={submission.links || []} />
    </div>
  );
};