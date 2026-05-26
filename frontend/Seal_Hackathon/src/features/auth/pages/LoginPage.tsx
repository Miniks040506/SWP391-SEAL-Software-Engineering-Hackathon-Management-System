import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButton";
import { useLoginMutation } from "@/features/auth/hooks/useAuthMutations";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/stores/authStore";
import { getDashboardPathByRole } from "@/utils/roleRedirect";

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(values);

      const user = useAuthStore.getState().user;
      const fallbackPath = getDashboardPathByRole(user?.role || "STUDENT");
      const fromPath = (location.state as { from?: string } | null)?.from;
      const redirectPath = fromPath || fallbackPath;

      enqueueSnackbar("Login successfully.", {
        variant: "success",
      });

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || "Login failed.", {
        variant: "error",
      });
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-155 py-16">
        <AuthCard
          title="Welcome Back"
          description="Sign in to continue managing your SEAL Hackathon workspace."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <PasswordField
              fullWidth
              size="small"
              label="Password"
              {...register("password")}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              sx={textFieldSx}
            />

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-bold text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loginMutation.isPending}
              sx={{
                height: 46,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 900,
                boxShadow: "none",
              }}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Or
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <SocialLoginButtons />

            <p className="text-center text-xs text-slate-500">
              Do not have an account?{" "}
              <Link
                className="font-semibold text-blue-500 hover:underline"
                to="/register"
              >
                Create account
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </>
  );
}