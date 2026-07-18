import { useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean | string;
  disabled?: boolean;
};

export function CodeInput({
  value,
  onChange,
  length = 6,
  error,
  disabled = false,
}: Props) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  const focusInput = (index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), length - 1);
    inputs.current[safeIndex]?.focus();
    inputs.current[safeIndex]?.select();
  };

  const updateDigits = (nextDigits: string[]) => {
    onChange(nextDigits.join("").slice(0, length));
  };

  const handlePasteValue = (rawValue: string, startIndex = 0) => {
    const pastedDigits = rawValue
      .replace(/\D/g, "")
      .slice(0, length - startIndex);

    if (!pastedDigits) return;

    const nextDigits = [...digits];

    pastedDigits.split("").forEach((digit, offset) => {
      nextDigits[startIndex + offset] = digit;
    });

    updateDigits(nextDigits);

    window.setTimeout(() => {
      focusInput(startIndex + pastedDigits.length);
    }, 0);
  };

  const handleChange = (index: number, rawValue: string) => {
    const onlyDigits = rawValue.replace(/\D/g, "");

    if (onlyDigits.length > 1) {
      handlePasteValue(onlyDigits, index);
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = onlyDigits;
    updateDigits(nextDigits);

    if (onlyDigits && index < length - 1) {
      window.setTimeout(() => focusInput(index + 1), 0);
    }
  };

  const handleBackspace = (index: number) => {
    const nextDigits = [...digits];

    if (nextDigits[index]) {
      nextDigits[index] = "";
      updateDigits(nextDigits);
      return;
    }

    if (index > 0) {
      nextDigits[index - 1] = "";
      updateDigits(nextDigits);
      window.setTimeout(() => focusInput(index - 1), 0);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputs.current[index] = node;
          }}
          value={digit}
          disabled={disabled}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Code digit ${index + 1}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onPaste={(event) => {
            event.preventDefault();
            handlePasteValue(event.clipboardData.getData("text"), index);
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace") {
              event.preventDefault();
              handleBackspace(index);
              return;
            }

            if (event.key === "ArrowLeft") {
              event.preventDefault();
              focusInput(index - 1);
              return;
            }

            if (event.key === "ArrowRight") {
              event.preventDefault();
              focusInput(index + 1);
            }
          }}
          className={[
            "h-14 w-13.5 rounded-xl border-2 bg-slate-50 text-center dark:bg-slate-900/60",
            "text-[22px] font-extrabold outline-none transition",
            "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600",
            error
              ? "border-rose-500 text-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 dark:focus:ring-rose-900/40"
              : "border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-blue-900/40",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
