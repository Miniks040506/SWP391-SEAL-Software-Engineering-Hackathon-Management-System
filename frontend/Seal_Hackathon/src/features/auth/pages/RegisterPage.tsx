import { zodResolver } from "@hookform/resolvers/zod";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { authTextFieldSx } from "@/features/auth/components/authFieldStyles";
import { PasswordRequirementChips } from "@/features/auth/components/PasswordRequirementChips";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";
import { RegistrationShell } from "@/features/auth/components/RegistrationShell";
import { useRegisterMutation } from "@/features/auth/hooks/useAuthMutations";
import {
  registerSchema,
  type RegisterFormInput,
  type RegisterFormValues,
} from "@/features/auth/schemas/auth.schema";

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {children}
      </span>
      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
    </div>
  );
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || "Registration failed.",
        {
          variant: "error",
        },
      );
    }
  };

  const affiliationCardClass = (selected: boolean) =>
    [
      "cursor-pointer rounded-2xl border p-4 text-left transition-all duration-200",
      selected
        ? "border-blue-500 bg-blue-50 shadow-[0_0_0_1px_rgba(59,130,246,0.25)] dark:bg-blue-900/20 dark:shadow-[0_0_0_1px_rgba(59,130,246,0.5)]"
        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800",
    ].join(" ");

  return (
    <RegistrationShell currentStep={1}>
      <span className="inline-block rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        Step 1 of 3
      </span>

      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
        Create your account
      </h2>
      <p className="mt-2 text-base leading-7 text-slate-500 dark:text-slate-400">
        Initialize your developer profile to start competing in the upcoming
        FPT Hackathon cycles.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <SectionLabel>Account details</SectionLabel>

        <TextField
          fullWidth
          label="Full Name"
          placeholder="e.g. Alex Nguyen"
          {...register("fullName")}
          error={Boolean(errors.fullName)}
          helperText={errors.fullName?.message}
          sx={authTextFieldSx}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            fullWidth
            label="Email"
            placeholder="alex.n@fpt.edu.vn"
            {...register("email")}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            sx={authTextFieldSx}
          />

          <TextField
            fullWidth
            label="Phone"
            placeholder="Optional"
            {...register("phone")}
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            sx={authTextFieldSx}
          />
        </div>

        <div>
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            sx={authTextFieldSx}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      type="button"
                      edge="end"
                      aria-label={showPassword ? "Hide password" : "Show password"}
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

          <PasswordStrengthMeter password={password} />

          <PasswordRequirementChips password={password} />
        </div>

        <SectionLabel>Academic profile</SectionLabel>

        <Controller
          control={control}
          name="studentType"
          render={({ field }) => (
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
                className={affiliationCardClass(field.value === "FPT")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      field.value === "FPT"
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300",
                    ].join(" ")}
                  >
                    <SchoolOutlinedIcon sx={{ fontSize: 20 }} />
                  </span>

                  {field.value === "FPT" && (
                    <CheckCircleIcon fontSize="small" className="text-blue-500" />
                  )}
                </div>

                <div className="mt-3 font-extrabold text-slate-800 dark:text-slate-200">
                  FPT University
                </div>
                <div className="mt-0.5 text-xs font-extrabold uppercase tracking-wider text-slate-400">
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
                className={affiliationCardClass(field.value === "EXTERNAL")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      field.value === "EXTERNAL"
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300",
                    ].join(" ")}
                  >
                    <PublicOutlinedIcon sx={{ fontSize: 20 }} />
                  </span>

                  {field.value === "EXTERNAL" && (
                    <CheckCircleIcon fontSize="small" className="text-blue-500" />
                  )}
                </div>

                <div className="mt-3 font-extrabold text-slate-800 dark:text-slate-200">
                  External
                </div>
                <div className="mt-0.5 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Global Talent
                </div>
              </button>
            </div>
          )}
        />

        <TextField
          fullWidth
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
              backgroundColor: studentType === "FPT" ? "#F1F5F9" : "#f8fafc",

              "& fieldset": {
                borderColor: studentType === "FPT" ? "#CBD5E1" : "#e2e8f0",
              },

              ".dark &": {
                backgroundColor:
                  studentType === "FPT" ? "#0f172a" : "rgba(15,23,42,0.55)",
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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            fullWidth
            label="Student Code"
            placeholder={studentType === "FPT" ? "SE123456" : "Your student ID"}
            {...register("studentCode")}
            error={Boolean(errors.studentCode)}
            helperText={errors.studentCode?.message}
            sx={authTextFieldSx}
          />

          <TextField
            fullWidth
            label="Graduation Year"
            placeholder="2027"
            {...register("graduationYear")}
            error={Boolean(errors.graduationYear)}
            helperText={errors.graduationYear?.message}
            sx={authTextFieldSx}
          />
        </div>

        <TextField
          fullWidth
          label="Major"
          placeholder="e.g. Software Engineering"
          {...register("major")}
          error={Boolean(errors.major)}
          helperText={errors.major?.message}
          sx={authTextFieldSx}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={registerMutation.isPending}
          sx={{
            height: 50,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 800,
            fontSize: 16,
            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            boxShadow: "0 10px 24px rgba(59,130,246,0.35)",
            transition: "box-shadow 200ms ease, transform 200ms ease",
            "&:hover": {
              background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
              boxShadow: "0 12px 28px rgba(59,130,246,0.45)",
            },
            "&:active": {
              transform: "translateY(1px)",
              boxShadow: "0 6px 16px rgba(59,130,246,0.3)",
            },
            "&.Mui-disabled": {
              background: "#93c5fd",
              color: "#ffffff",
            },
          }}
        >
          {registerMutation.isPending
            ? "Creating account..."
            : "Create account"}
        </Button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          You already have an account?{" "}
          <Link
            className="font-bold text-blue-500 transition-colors hover:text-blue-600 hover:underline"
            to="/login"
          >
            Go to log in
          </Link>
        </p>
      </form>
    </RegistrationShell>
  );
}
