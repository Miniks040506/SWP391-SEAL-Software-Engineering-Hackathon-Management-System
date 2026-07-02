import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { StepProgress } from "@/features/auth/components/StepProgress";
import {
  registerSchema,
  type RegisterFormInput,
  type RegisterFormValues,
} from "@/features/auth/schemas/auth.schema";
import { useRegisterMutation } from "@/features/auth/hooks/useAuthMutations";

const steps = [
  { label: "Registration" },
  { label: "Verification" },
  { label: "Success" },
];

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    ".dark & fieldset": {
      borderColor: "#334155",
    },
    ".dark &:hover fieldset": {
      borderColor: "#475569",
    },
    ".dark &.Mui-focused fieldset": {
      borderColor: "#3b82f6",
    },
  },
  "& .MuiInputLabel-root": {
    ".dark &": {
      color: "#94a3b8",
    },
    ".dark &.Mui-focused": {
      color: "#3b82f6",
    },
  },
  "& .MuiInputBase-input": {
    ".dark &": {
      color: "#f8fafc",
    },
    ".dark &::placeholder": {
      color: "#64748b",
      opacity: 1,
    },
  },
  "& .MuiIconButton-root": {
    ".dark &": {
      color: "#94a3b8",
    },
  },
  "& .MuiFormHelperText-root": {
    ".dark &": {
      color: "#94a3b8",
    },
    ".dark &.Mui-error": {
      color: "#f43f5e",
    },
  },
};

function getPasswordStrength(password: string) {
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

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      studentType: "FPT",
      fullName: "",
      email: "",
      password: "",
      phone: "",
      studentCode: "",
      universityName: "FPT University",
      major: "",
      graduationYear: "",
    },
  });

  const studentType = watch("studentType");
  const password = watch("password") ?? "";

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password],
  );

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const normalizedEmail = values.email.trim().toLowerCase();

      await registerMutation.mutateAsync({
        email: normalizedEmail,
        password: values.password,
        fullName: values.fullName.trim(),
        phone: values.phone || undefined,
        studentType: values.studentType,
        studentCode: values.studentCode || undefined,
        universityName:
          values.studentType === "FPT"
            ? "FPT University"
            : values.universityName || undefined,
        major: values.major || undefined,
        graduationYear: values.graduationYear,
      });

      enqueueSnackbar("Verification code sent to your email.", {
        variant: "success",
      });

      navigate(
        `/verify-email?email=${encodeURIComponent(normalizedEmail)}&mode=register`,
      );
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || "Registration failed.",
        {
          variant: "error",
        },
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-155 py-10">
      <StepProgress
        title="Registration Progress"
        currentStep={1}
        steps={steps}
      />

      <AuthCard
        title="Create Account"
        description="Initialize your developer profile to start competing in the upcoming FPT Hackathon cycles."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <TextField
            fullWidth
            size="small"
            label="Full Name"
            placeholder="e.g. Alex Nguyen"
            {...register("fullName")}
            error={Boolean(errors.fullName)}
            helperText={errors.fullName?.message}
            sx={textFieldSx}
          />

          <TextField
            fullWidth
            size="small"
            label="Email"
            placeholder="alex.n@fpt.edu.vn"
            {...register("email")}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            sx={textFieldSx}
          />

          <TextField
            fullWidth
            size="small"
            label="Phone"
            placeholder="Optional"
            {...register("phone")}
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            sx={textFieldSx}
          />

          <div>
            <TextField
              fullWidth
              size="small"
              label="Password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              sx={textFieldSx}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        type="button"
                        edge="end"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? (
                          <VisibilityOffIcon fontSize="small" />
                        ) : (
                          <VisibilityIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {password && (
              <div className="mt-2">
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor:
                          index < passwordStrength.segments
                            ? passwordStrength.color
                            : "#D9D9D9",
                      }}
                    />
                  ))}
                </div>

                <div className="mt-1 flex justify-between text-[10px] font-bold uppercase tracking-wide">
                  <span style={{ color: passwordStrength.color }}>
                    Strength: {passwordStrength.label}
                  </span>

                  <span className="text-slate-400">8+ characters</span>
                </div>
              </div>
            )}
          </div>

          <TextField
            fullWidth
            size="small"
            label="Student Code"
            placeholder={studentType === "FPT" ? "SE123456" : "Your student ID"}
            {...register("studentCode")}
            error={Boolean(errors.studentCode)}
            helperText={errors.studentCode?.message}
            sx={textFieldSx}
          />

          <Controller
            control={control}
            name="studentType"
            render={({ field }) => (
              <div>
                <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-600">
                  Student Affiliation
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange("FPT");
                      setValue("universityName", "FPT University", {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    className={[
                      "min-h-24 rounded-2xl border p-5 text-left transition",
                      field.value === "FPT"
                        ? "border-blue-500 bg-blue-50 shadow-[0_0_0_1px_rgba(59,130,246,0.25)] dark:bg-blue-900/20 dark:shadow-[0_0_0_1px_rgba(59,130,246,0.5)]"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:bg-slate-800",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
                        FPT University
                      </div>

                      {field.value === "FPT" && (
                        <CheckCircleIcon
                          fontSize="small"
                          className="text-blue-500"
                        />
                      )}
                    </div>

                    <div className="mt-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Internal
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      field.onChange("EXTERNAL");
                      setValue("universityName", "", {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    className={[
                      "min-h-24 rounded-2xl border p-5 text-left transition",
                      field.value === "EXTERNAL"
                        ? "border-blue-500 bg-blue-50 shadow-[0_0_0_1px_rgba(59,130,246,0.25)] dark:bg-blue-900/20 dark:shadow-[0_0_0_1px_rgba(59,130,246,0.5)]"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:bg-slate-800",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
                        External
                      </div>

                      {field.value === "EXTERNAL" && (
                        <CheckCircleIcon
                          fontSize="small"
                          className="text-blue-500"
                        />
                      )}
                    </div>

                    <div className="mt-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Global Talent
                    </div>
                  </button>
                </div>
              </div>
            )}
          />

          <TextField
            fullWidth
            size="small"
            label="University Name"
            placeholder={
              studentType === "EXTERNAL"
                ? "e.g. University of Science"
                : "FPT University"
            }
            {...register("universityName")}
            error={Boolean(errors.universityName)}
            helperText={errors.universityName?.message}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: studentType === "FPT" ? "#F8FAFC" : "#FFFFFF",

                "& fieldset": {
                  borderColor: studentType === "FPT" ? "#CBD5E1" : undefined,
                },

                ".dark &": {
                  backgroundColor:
                    studentType === "FPT" ? "#0f172a" : "transparent",
                },
                ".dark & fieldset": {
                  borderColor: studentType === "FPT" ? "#1e293b" : "#334155",
                },
                ".dark &:hover fieldset": {
                  borderColor: studentType === "FPT" ? "#1e293b" : "#475569",
                },
              },
              "& .MuiInputBase-input": {
                color: "#334155",
                WebkitTextFillColor: "#334155",
                fontWeight: studentType === "FPT" ? 700 : 400,
                cursor: studentType === "FPT" ? "default" : "text",
                ".dark &": {
                  color: "#f8fafc",
                  WebkitTextFillColor: "#f8fafc",
                },
              },
              "& .MuiInputLabel-root": {
                ".dark &": {
                  color: "#94a3b8",
                },
              },
            }}
            slotProps={{
              input: {
                readOnly: studentType === "FPT",
              },
            }}
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              fullWidth
              size="small"
              label="Major"
              {...register("major")}
              error={Boolean(errors.major)}
              helperText={errors.major?.message}
              sx={textFieldSx}
            />

            <TextField
              fullWidth
              size="small"
              label="Graduation Year"
              placeholder="2027"
              {...register("graduationYear")}
              error={Boolean(errors.graduationYear)}
              helperText={errors.graduationYear?.message}
              sx={textFieldSx}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={registerMutation.isPending}
            sx={{
              height: 46,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 900,
              boxShadow: "none",
            }}
          >
            {registerMutation.isPending
              ? "Creating account..."
              : "Create account"}
          </Button>

          <p className="text-center text-xs text-slate-500">
            You already have account?{" "}
            <Link
              className="font-semibold text-blue-500 hover:underline"
              to="/login"
            >
              Go to log in
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}
