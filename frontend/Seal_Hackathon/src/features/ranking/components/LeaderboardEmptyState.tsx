export const LeaderboardEmptyState = () => {
  return (
    <div className="py-20">
      <div className="max-w-xl space-y-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Results aren't out yet.
        </h2>
        <p className="text-base leading-relaxed text-gray-500 dark:text-slate-400">
          Every submission is scored blind by the judge panel before anything
          goes public. Rankings appear here the moment the coordinator publishes
          them.
        </p>
      </div>
    </div>
  );
};
