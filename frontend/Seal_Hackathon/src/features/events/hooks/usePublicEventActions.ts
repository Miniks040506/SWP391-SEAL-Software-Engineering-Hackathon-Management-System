import { enqueueSnackbar } from "notistack";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import type { UUID } from "@/types/common.types";

export function usePublicEventActions() {
  const navigate = useNavigate();
  const location = useLocation();

  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const isAuthenticated = Boolean(accessToken && user);

  const joinEvent = () => {
    if (!isAuthenticated) {
      enqueueSnackbar("Please sign in before joining this event.", {
        variant: "info",
      });

      navigate("/login", {
        state: {
          from: location.pathname,
        },
      });

      return;
    }

    navigate(`/participant/teams/create`);
  };

  const viewResults = (eventId: UUID) => {
    navigate(`/standings?eventId=${eventId}`);
  };

  return {
    isAuthenticated,
    joinEvent,
    viewResults,
  };
}