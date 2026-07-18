export const PASSWORD_RULES = [
  {
    label: "At least 8 characters",
    short: "8+ characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "One uppercase letter",
    short: "Uppercase",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "One lowercase letter",
    short: "Lowercase",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "One number",
    short: "Number",
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    label: "One special character",
    short: "Special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
];

export function getPasswordStrength(password: string) {
  const hasMinLength8 = password.length >= 8;
  const hasMinLength16 = password.length >= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const normalizedPassword = password.toLowerCase();

  const commonPasswords = [
    "password",
    "12345678",
    "123456789",
    "qwerty",
    "abcdef",
    "abc123",
    "admin",
  ];

  const isCommonPassword = commonPasswords.some((common) =>
    normalizedPassword.includes(common),
  );

  const hasRepeatedChars = /(.)\1{3,}/.test(password);

  const typeCount = [
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  ].filter(Boolean).length;

  if (!password) return { label: "", segments: 0, color: "#D9D9D9" };

  if (
    !hasMinLength8 ||
    typeCount <= 1 ||
    isCommonPassword ||
    hasRepeatedChars
  ) {
    return { label: "Weak", segments: 1, color: "#FF4D4F" };
  }

  if (hasMinLength8 && (!hasUppercase || typeCount < 4)) {
    return { label: "Medium", segments: 2, color: "#FFA940" };
  }

  if (
    hasMinLength8 &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    !hasMinLength16
  ) {
    return { label: "Strong", segments: 3, color: "#73D13D" };
  }

  return { label: "Very Strong", segments: 4, color: "#008000" };
}
