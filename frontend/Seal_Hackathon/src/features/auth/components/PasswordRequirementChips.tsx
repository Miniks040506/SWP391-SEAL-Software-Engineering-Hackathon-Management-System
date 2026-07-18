import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { PASSWORD_RULES } from "@/features/auth/utils/password";

type Props = {
  password: string;
};

export function PasswordRequirementChips({ password }: Props) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);

        return (
          <span
            key={rule.short}
            className={[
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
              passed
                ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400",
            ].join(" ")}
          >
            {passed ? (
              <CheckCircleOutlinedIcon sx={{ fontSize: 13 }} />
            ) : (
              <RadioButtonUncheckedIcon sx={{ fontSize: 13 }} />
            )}
            {rule.short}
          </span>
        );
      })}
    </div>
  );
}
