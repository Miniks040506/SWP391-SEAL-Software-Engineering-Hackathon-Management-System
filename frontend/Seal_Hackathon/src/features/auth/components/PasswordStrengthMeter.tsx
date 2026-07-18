import { getPasswordStrength } from "@/features/auth/utils/password";

type Props = {
  password: string;
};

export function PasswordStrengthMeter({ password }: Props) {
  if (!password) return null;

  const strength = getPasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                index < strength.segments ? strength.color : "#D9D9D9",
            }}
          />
        ))}
      </div>

      <div className="mt-1 text-[10px] font-bold uppercase tracking-wide">
        <span style={{ color: strength.color }}>
          Strength: {strength.label}
        </span>
      </div>
    </div>
  );
}
