import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { trackApi } from "@/api/track.api";
import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  TrackDetailResponse,
  RegisterTeamTrackRequest,
} from "@/types/track.types";
import { participantTeamQueryKeys } from "./useParticipantTeams";

export const USE_MOCK = true;

// Mock Data
const MOCK_TRACKS: TrackDetailResponse[] = [
  {
    id: "track-mock-1",
    eventId: "event-mock-1",
    name: "Software Engineering Track",
    description: "Build robust software applications.",
    maxTeams: 20,
    registeredTeamCount: 5,
    mentors: [],
  },
  {
    id: "track-mock-2",
    eventId: "event-mock-1",
    name: "AI / Data Science Track",
    description: "Solve problems using AI.",
    maxTeams: 15,
    registeredTeamCount: 15, // Full capacity mock
    mentors: [],
  },
];

export function useTrackRegistration(teamId: UUID) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // TODO: resolve eventId when BE confirms approach
  // Option C chosen: Hardcode for now, leave a TODO comment. Honest, doesn't over-engineer before BE clarifies.
  const eventId = "event-mock-1";

  const availableTracksQuery = useQuery({
    queryKey: ["available-tracks", eventId],
    queryFn: async () => {
      if (USE_MOCK) {
        return new Promise<TrackDetailResponse[]>((resolve) =>
          setTimeout(() => resolve(MOCK_TRACKS), 500),
        );
      }
      return apiRequest.get<TrackDetailResponse[]>(
        `/events/${eventId}/tracks/available`,
      );
    },
    enabled: Boolean(eventId),
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterTeamTrackRequest) => {
      if (USE_MOCK) {
        return new Promise((resolve) => setTimeout(resolve, 500));
      }
      return trackApi.registerTeamForTrack(teamId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });
      enqueueSnackbar(
        USE_MOCK
          ? "Mock: Registered successfully."
          : "Registered successfully. Pending approval.",
        { variant: "success" },
      );
    },
    onError: () => {
      enqueueSnackbar("Failed to register track.", { variant: "error" });
    },
  });

  return {
    availableTracksQuery,
    registerMutation,
  };
}
