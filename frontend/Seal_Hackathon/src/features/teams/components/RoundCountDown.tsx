import type {
  CountdownState,
  CountdownUrgency,
} from "@/features/teams/utils/competitionTiming";

const urgencyTone: Record<CountdownUrgency, string> = {
  calm: "text-gray-900 dark:text-white",
  warning: "text-amber-600 dark:text-amber-300",
  critical: "text-red-600 dark:text-red-400",
  idle: "text-gray-400 dark:text-slate-500",
  closed: "text-gray-500 dark:text-slate-400",
  over: "text-red-600 dark:text-red-400",
};

const urgencyNote: Record<CountdownUrgency, string> = {
  calm: "Time remaining to submit",
  warning: "Less than a day left — submit soon",
  critical: "Final hour — submit now",
  idle: "Timer starts when a coordinator opens this round",
  closed: "This round's submission window has closed",
  over: "The submission deadline has passed",
};

const urgencyHeadline: Record<CountdownUrgency, string> = {
  calm: "",
  warning: "",
  critical: "",
  idle: "Standby",
  closed: "Closed",
  over: "Closed",
};

type Props = {
  state: CountdownState;
  deadlineLabel: string;
};

export function RoundCountdown({ state, deadlineLabel }: Props) {
  const { urgency, parts } = state;
  const live = parts.length > 0;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-slate-500">
        Submission window
      </p>

      <div
        className="mt-3 flex items-end gap-3"
        role="timer"
        aria-live="off"
        aria-label={
          live
            ? `Time remaining: ${parts.map((p) => `${Number(p.value)} ${p.label}`).join(", ")}`
            : urgencyNote[urgency]
        }
      >
        {live ? (
          parts.map((part, index) => (
            <div key={part.label} className="flex items-end gap-3">
              {index > 0 && (
                <span
                  aria-hidden
                  className="pb-3 text-3xl font-light text-gray-300 dark:text-slate-700"
                >
                  :
                </span>
              )}
              <div>
                <p
                  className={[
                    "text-4xl font-semibold tabular-nums tracking-tight md:text-5xl",
                    urgencyTone[urgency],
                  ].join(" ")}
                >
                  {part.value}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-slate-500">
                  {part.label}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p
            className={[
              "text-3xl font-semibold tracking-tight md:text-4xl",
              urgencyTone[urgency],
            ].join(" ")}
          >
            {urgencyHeadline[urgency]}
          </p>
        )}
      </div>

      <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
        {urgencyNote[urgency]}
        {live && (
          <>
            {" · "}
            <span className="font-medium text-gray-700 dark:text-slate-300">
              {deadlineLabel}
            </span>
          </>
        )}
      </p>
    </div>
  );
}
