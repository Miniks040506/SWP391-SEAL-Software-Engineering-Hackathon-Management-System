import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import { Button } from "@mui/material";
import { authApi } from "@/api/auth.api";

export function SocialLoginButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={authApi.loginWithGoogle}
        sx={{
          height: 44,
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 900,
        }}
      >
        Google
      </Button>

      <Button
        type="button"
        variant="outlined"
        startIcon={<GitHubIcon />}
        onClick={authApi.loginWithGithub}
        sx={{
          height: 44,
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 900,
        }}
      >
        GitHub
      </Button>
    </div>
  );
}
