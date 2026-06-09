import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { announcementApi } from "@/api/announcement.api";
import { eventApi } from "@/api/event.api";
import { trackApi } from "@/api/track.api";

import type { UUID } from "@/types/common.types";
import type {
  AnnouncementResponse,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "@/types/announcement.types";
import type { EventSummaryResponse } from "@/types/event.types";
import type { TrackResponse } from "@/types/track.types";

import type {
  AnnouncementAction,
  AnnouncementFormValues,
} from "../schemas/announcement.schema";

const announcementQueryKeys = {
  events: ["announcement-events"] as const,
  tracks: (eventId: string) => ["announcement-tracks", eventId] as const,
  manageEventAnnouncements: (eventId: string) =>
    ["manage-event-announcements", eventId] as const,
};

function getPageItems<T>(data: unknown): T[] {
  if (!data) return [];

  if (Array.isArray(data)) return data as T[];

  const page = data as {
    content?: T[];
    items?: T[];
    data?: T[];
  };

  return page.content ?? page.items ?? page.data ?? [];
}

function toLocalDateTime(value?: string) {
  if (!value) return undefined;

  return value.length === 16 ? `${value}:00` : value;
}

function mapCreatePayload(
  values: AnnouncementFormValues,
  action: AnnouncementAction,
): CreateAnnouncementRequest {
  return {
    title: values.title,
    content: values.content,
    pinned: values.pinned,
    resultAnnouncement: values.resultAnnouncement,
    publishNow: action === "PUBLISH",
    sendEmail: values.sendEmail,
    sendInApp: values.sendInApp,
    scheduledAt:
      action === "SCHEDULE" ? toLocalDateTime(values.scheduledAt) : undefined,
    targetScope: values.targetScope,
    targetId: values.targetId ? (values.targetId as UUID) : undefined,
    targetTrackIds: values.targetTrackIds as UUID[],
    targetRoleNames: values.targetRoleNames,
  };
}

function mapUpdatePayload(
  values: AnnouncementFormValues,
  action?: AnnouncementAction,
): UpdateAnnouncementRequest {
  return {
    title: values.title,
    content: values.content,
    pinned: values.pinned,
    resultAnnouncement: values.resultAnnouncement,
    sendEmail: values.sendEmail,
    sendInApp: values.sendInApp,
    scheduledAt:
      action === "SCHEDULE" ? toLocalDateTime(values.scheduledAt) : undefined,
    targetScope: values.targetScope,
    targetId: values.targetId ? (values.targetId as UUID) : undefined,
    targetTrackIds: values.targetTrackIds as UUID[],
    targetRoleNames: values.targetRoleNames,
  };
}

export function useCoordinatorAnnouncements(initialEventId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [selectedEventId, setSelectedEventId] = useState(initialEventId ?? "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementResponse | null>(null);

  const eventsQuery = useQuery({
    queryKey: announcementQueryKeys.events,
    queryFn: () => eventApi.getEvents({ page: 0, size: 50 }),
  });

  const events = useMemo(() => {
    return getPageItems<EventSummaryResponse>(eventsQuery.data);
  }, [eventsQuery.data]);

  const effectiveEventId = selectedEventId || initialEventId || events[0]?.id || "";

  const tracksQuery = useQuery({
    queryKey: announcementQueryKeys.tracks(effectiveEventId),
    queryFn: () => trackApi.getTracksByEvent(effectiveEventId as UUID),
    enabled: Boolean(effectiveEventId),
  });

  const tracks = useMemo(() => {
    return tracksQuery.data ?? [];
  }, [tracksQuery.data]);

  const announcementsQuery = useQuery({
    queryKey: announcementQueryKeys.manageEventAnnouncements(effectiveEventId),
    queryFn: () =>
      announcementApi.getManageEventAnnouncements(effectiveEventId as UUID),
    enabled: Boolean(effectiveEventId),
  });

  const announcements = useMemo(() => {
    return announcementsQuery.data ?? [];
  }, [announcementsQuery.data]);

  const invalidateAnnouncements = async () => {
    if (!effectiveEventId) return;

    await queryClient.invalidateQueries({
      queryKey: announcementQueryKeys.manageEventAnnouncements(effectiveEventId),
    });
  };

  const createMutation = useMutation({
    mutationFn: ({
      values,
      action,
    }: {
      values: AnnouncementFormValues;
      action: AnnouncementAction;
    }) =>
      announcementApi.createAnnouncement(
        values.eventId as UUID,
        mapCreatePayload(values, action),
      ),

    onSuccess: async (_, variables) => {
      await invalidateAnnouncements();

      const messageMap: Record<AnnouncementAction, string> = {
        DRAFT: "Announcement saved as draft.",
        PUBLISH: "Announcement published successfully.",
        SCHEDULE: "Announcement created successfully.",
      };

      enqueueSnackbar(messageMap[variables.action], {
        variant: "success",
      });
    },

    onError: () => {
      enqueueSnackbar("Failed to create announcement.", {
        variant: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      announcementId,
      values,
      action,
    }: {
      announcementId: UUID;
      values: AnnouncementFormValues;
      action?: AnnouncementAction;
    }) =>
      announcementApi.updateAnnouncement(
        announcementId,
        mapUpdatePayload(values, action),
      ),

    onSuccess: async () => {
      await invalidateAnnouncements();

      enqueueSnackbar("Announcement updated successfully.", {
        variant: "success",
      });
    },

    onError: () => {
      enqueueSnackbar("Failed to update announcement.", {
        variant: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (announcementId: UUID) =>
      announcementApi.deleteAnnouncement(announcementId),
    onSuccess: async () => {
      await invalidateAnnouncements();

      enqueueSnackbar("Announcement deleted successfully.", {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar("Failed to delete announcement.", {
        variant: "error",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (announcementId: UUID) =>
      announcementApi.publishAnnouncement(announcementId),
    onSuccess: async () => {
      await invalidateAnnouncements();

      enqueueSnackbar("Announcement published successfully.", {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar("Failed to publish announcement.", {
        variant: "error",
      });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: ({
      announcementId,
      values,
    }: {
      announcementId: UUID;
      values: AnnouncementFormValues;
    }) =>
      announcementApi.scheduleAnnouncement(
        announcementId,
        mapUpdatePayload(values, "SCHEDULE"),
      ),
    onSuccess: async () => {
      await invalidateAnnouncements();

      enqueueSnackbar("Announcement scheduled successfully.", {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar("Failed to schedule announcement.", {
        variant: "error",
      });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (announcementId: UUID) =>
      announcementApi.unpublishAnnouncement(announcementId),
    onSuccess: async () => {
      await invalidateAnnouncements();

      enqueueSnackbar("Announcement unpublished successfully.", {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar("Failed to unpublish announcement.", {
        variant: "error",
      });
    },
  });

  const pinMutation = useMutation({
    mutationFn: (announcementId: UUID) =>
      announcementApi.pinAnnouncement(announcementId),
    onSuccess: async () => {
      await invalidateAnnouncements();

      enqueueSnackbar("Announcement pinned successfully.", {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar("Failed to pin announcement.", {
        variant: "error",
      });
    },
  });

  const unpinMutation = useMutation({
    mutationFn: (announcementId: UUID) =>
      announcementApi.unpinAnnouncement(announcementId),
    onSuccess: async () => {
      await invalidateAnnouncements();

      enqueueSnackbar("Announcement unpinned successfully.", {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar("Failed to unpin announcement.", {
        variant: "error",
      });
    },
  });

  const markResultMutation = useMutation({
    mutationFn: (announcementId: UUID) =>
      announcementApi.markResultAnnouncement(announcementId),
    onSuccess: async () => {
      await invalidateAnnouncements();

      enqueueSnackbar("Announcement marked as result announcement.", {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar("Failed to mark result announcement.", {
        variant: "error",
      });
    },
  });

  const openCreateDialog = () => {
    setEditingAnnouncement(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (announcement: AnnouncementResponse) => {
    setEditingAnnouncement(announcement);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingAnnouncement(null);
    setIsDialogOpen(false);
  };

  const submitAnnouncement = async (
    values: AnnouncementFormValues,
    action: AnnouncementAction,
  ) => {
    if (editingAnnouncement) {
      await updateMutation.mutateAsync({
        announcementId: editingAnnouncement.id,
        values,
        action,
      });

      if (action === "PUBLISH") {
        await publishMutation.mutateAsync(editingAnnouncement.id);
      }

      if (action === "SCHEDULE") {
        await scheduleMutation.mutateAsync({
          announcementId: editingAnnouncement.id,
          values,
        });
      }

      closeDialog();
      return;
    }

    if (action === "SCHEDULE") {
      const createdAnnouncement = await createMutation.mutateAsync({
        values: {
          ...values,
          scheduledAt: "",
        },
        action: "DRAFT",
      });

      await scheduleMutation.mutateAsync({
        announcementId: createdAnnouncement.id,
        values,
      });

      closeDialog();
      return;
    }

    await createMutation.mutateAsync({
      values,
      action,
    });

    closeDialog();
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    publishMutation.isPending ||
    scheduleMutation.isPending;

  return {
    events,
    tracks,

    selectedEventId: effectiveEventId,
    setSelectedEventId,

    announcements,
    announcementsQuery,
    eventsQuery,
    tracksQuery,

    isDialogOpen,
    editingAnnouncement,
    isSubmitting,

    openCreateDialog,
    openEditDialog,
    closeDialog,
    submitAnnouncement,

    deleteAnnouncement: deleteMutation.mutate,
    publishAnnouncement: publishMutation.mutate,
    scheduleAnnouncement: scheduleMutation.mutate,
    unpublishAnnouncement: unpublishMutation.mutate,
    pinAnnouncement: pinMutation.mutate,
    unpinAnnouncement: unpinMutation.mutate,
    markResultAnnouncement: markResultMutation.mutate,
  };
}