import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

export const JudgeAnonymityNotice = () => {
  return (
    <aside className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-4 text-sm text-blue-950 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100">
      <ShieldOutlinedIcon
        className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-300"
        style={{ fontSize: 20 }}
      />
      <p className="leading-6">
        <strong className="font-black">Judges are anonymous.</strong> Scores are
        aggregated so individual judge identities remain private.
      </p>
    </aside>
  );
};
