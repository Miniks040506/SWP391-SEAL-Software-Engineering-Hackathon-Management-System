interface JudgeSubmissionProgressCellProps {
  confirmedScoreCount: number;
  criteriaCount: number;
}

export const JudgeSubmissionProgressCell = ({
  confirmedScoreCount,
  criteriaCount,
}: JudgeSubmissionProgressCellProps) => {
  const progress = criteriaCount > 0 ? (confirmedScoreCount / criteriaCount) * 100 : 0;

  return (
    <div className="flex flex-col gap-1.5 w-full min-w-[140px]">
      <span className="text-xs text-gray-600 font-medium">
        {confirmedScoreCount} / {criteriaCount} criteria completed
      </span>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
