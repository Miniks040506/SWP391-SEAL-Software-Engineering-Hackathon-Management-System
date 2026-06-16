import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { eventApi } from "@/api/event.api";
import { trackApi } from "@/api/track.api";
import type { UUID } from "@/types/common.types";
import type {
  RegisterTeamTrackRequest,
} from "@/types/track.types";
import { participantTeamQueryKeys } from "./useParticipantTeams";

export function useTrackRegistration(teamId: UUID) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [selectedEventId, setSelectedEventId] = useState<UUID | null>(null);

  const eventsQuery = useQuery({
    queryKey: ["events", "REGISTRATION"],
    queryFn: () => eventApi.getPublicEvents({ status: "REGISTRATION" }),
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const events = eventsQuery.data?.content || [];

  useEffect(() => {
    if (events.length === 1 && !selectedEventId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const availableTracksQuery = useQuery({
    queryKey: ["available-tracks", selectedEventId],
    queryFn: () => trackApi.getAvailableTracks(selectedEventId!),
    enabled: Boolean(selectedEventId),
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterTeamTrackRequest) => {
      return trackApi.registerTeamForTrack(teamId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });
      enqueueSnackbar("Registered successfully.", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Failed to register track.", { variant: "error" });
    },
  });

  return {
    eventsQuery,
    events,
    selectedEventId,
    setSelectedEventId,
    availableTracksQuery,
    registerMutation,
  };
}
