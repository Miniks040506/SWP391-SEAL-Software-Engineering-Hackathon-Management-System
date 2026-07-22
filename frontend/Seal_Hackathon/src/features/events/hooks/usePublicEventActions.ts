import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import type { UUID } from "@/types/common.types";

export function usePublicEventActions() {
  const navigate = useNavigate();

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
          from: "/participant/teams/create",
        },
      });

      return;
    }

    navigate(`/participant/teams/create`);
  };

  const viewResults = (eventId: UUID) => {
    navigate(`/events/${eventId}/leaderboard`);
  };

  return {
    isAuthenticated,
    joinEvent,
    viewResults,
  };
}
