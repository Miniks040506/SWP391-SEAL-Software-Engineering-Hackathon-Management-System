import GitHubIcon from "@mui/icons-material/GitHub";
import { Button } from "@mui/material";
import { authApi } from "@/api/auth.api";

function GoogleLogo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

const socialButtonSx = {
  height: 46,
  borderRadius: "12px",
  textTransform: "none",
  fontWeight: 750,
  fontSize: 17,

  color: "#0f172a",
  borderColor: "#dbe3ef",
  backgroundColor: "#ffffff",
  boxShadow: "none",

  "& .MuiButton-startIcon": {
    marginRight: "10px",
  },

  "&:hover": {
    color: "#2563eb",
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
    boxShadow: "0 8px 18px rgba(59,130,246,0.12)",
  },

  "&:active": {
    color: "#1d4ed8",
    borderColor: "#2563eb",
    backgroundColor: "#dbeafe",
    transform: "translateY(1px)",
    boxShadow: "none",
  },

  "&:focus-visible": {
    outline: "none",
    boxShadow: "0 0 0 4px rgba(59,130,246,0.18)",
  },
};

export function SocialLoginButtons() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        type="button"
        variant="outlined"
        startIcon={<GoogleLogo />}
        onClick={authApi.loginWithGoogle}
        sx={socialButtonSx}
        className="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-200 dark:hover:!bg-slate-700"
      >
        Google
      </Button>

      <Button
        type="button"
        variant="outlined"
        startIcon={<GitHubIcon />}
        onClick={authApi.loginWithGithub}
        sx={{
          ...socialButtonSx,

          "& .MuiButton-startIcon": {
            marginRight: "10px",
            color: "#181717",
          },

          "&:hover .MuiButton-startIcon": {
            color: "#2563eb",
          },

          "&:active .MuiButton-startIcon": {
            color: "#1d4ed8",
          },
        }}
        className="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-200 dark:hover:!bg-slate-700"
      >
        GitHub
      </Button>
    </div>
  );
}