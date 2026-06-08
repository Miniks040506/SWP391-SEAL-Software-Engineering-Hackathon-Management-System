import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { announcementApi } from "@/api/announcement.api";
import type { UUID } from "@/types/common.types";
import type {
  AnnouncementResponse,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "@/types/announcement.types";

import { coordinatorAnnouncementEventsMock } from "../mocks/coordinatorAnnouncements.mock";
import type {
  AnnouncementAction,
  AnnouncementFormValues,
} from "../schemas/announcement.schema";

const announcementQueryKeys = {
  eventAnnouncements: (eventId: string) =>
    ["event-announcements", eventId] as const,
};

function mapFormToCreateRequest(
  values: AnnouncementFormValues,
  action: AnnouncementAction,
): CreateAnnouncementRequest {
  return {
    title: values.title,
    content: values.content,
    pinned: values.pinned,
    resultAnnouncement: values.resultAnnouncement,
    publishNow: action === "PUBLISH",
  };
}

function mapFormToUpdateRequest(
  values: AnnouncementFormValues,
): UpdateAnnouncementRequest {
  return {
    title: values.title,
    content: values.content,
    pinned: values.pinned,
    resultAnnouncement: values.resultAnnouncement,
  };
}

export function useCoordinatorAnnouncements(initialEventId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const events = coordinatorAnnouncementEventsMock;

  const [selectedEventId, setSelectedEventId] = useState(
    initialEventId || events[0]?.id || "",
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementResponse | null>(null);

  const announcementsQuery = useQuery({
    queryKey: announcementQueryKeys.eventAnnouncements(selectedEventId),
    queryFn: () => announcementApi.getEventAnnouncements(selectedEventId as UUID),
    enabled: Boolean(selectedEventId),
  });

  const announcements = useMemo(() => {
    return announcementsQuery.data ?? [];
  }, [announcementsQuery.data]);

  const invalidateAnnouncements = async () => {
    await queryClient.invalidateQueries({
      queryKey: announcementQueryKeys.eventAnnouncements(selectedEventId),
    });
  };

  const createAnnouncementMutation = useMutation({
    mutationFn: ({
      values,
      action,
    }: {
      values: AnnouncementFormValues;
      action: AnnouncementAction;
    }) => {
      return announcementApi.createAnnouncement(
        values.eventId as UUID,
        mapFormToCreateRequest(values, action),
      );
    },
    onSuccess: async (_, variables) => {
      await invalidateAnnouncements();

      enqueueSnackbar(
        variables.action === "PUBLISH"
          ? "Announcement published successfully."
          : "Announcement saved as draft.",
        {
          variant: "success",
        },
      );
    },
    onError: () => {
      enqueueSnackbar("Failed to create announcement.", {
        variant: "error",
      });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({
      announcementId,
      values,
    }: {
      announcementId: UUID;
      values: AnnouncementFormValues;
    }) => {
      return announcementApi.updateAnnouncement(
        announcementId,
        mapFormToUpdateRequest(values),
      );
    },
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

  const deleteAnnouncementMutation = useMutation({
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

  const publishAnnouncementMutation = useMutation({
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

  const unpublishAnnouncementMutation = useMutation({
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

  const pinAnnouncementMutation = useMutation({
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

  const unpinAnnouncementMutation = useMutation({
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

  const markResultAnnouncementMutation = useMutation({
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
      await updateAnnouncementMutation.mutateAsync({
        announcementId: editingAnnouncement.id,
        values,
      });

      if (action === "PUBLISH" && !editingAnnouncement.publishedAt) {
        await publishAnnouncementMutation.mutateAsync(editingAnnouncement.id);
      }

      closeDialog();
      return;
    }

    await createAnnouncementMutation.mutateAsync({
      values,
      action,
    });

    closeDialog();
  };

  const isSubmitting =
    createAnnouncementMutation.isPending ||
    updateAnnouncementMutation.isPending ||
    publishAnnouncementMutation.isPending;

  return {
    events,
    selectedEventId,
    setSelectedEventId,

    announcements,
    announcementsQuery,

    isDialogOpen,
    editingAnnouncement,
    isSubmitting,

    openCreateDialog,
    openEditDialog,
    closeDialog,
    submitAnnouncement,

    deleteAnnouncement: deleteAnnouncementMutation.mutate,
    publishAnnouncement: publishAnnouncementMutation.mutate,
    unpublishAnnouncement: unpublishAnnouncementMutation.mutate,
    pinAnnouncement: pinAnnouncementMutation.mutate,
    unpinAnnouncement: unpinAnnouncementMutation.mutate,
    markResultAnnouncement: markResultAnnouncementMutation.mutate,
  };
}