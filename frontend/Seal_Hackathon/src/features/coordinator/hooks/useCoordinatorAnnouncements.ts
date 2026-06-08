


//------------------------------ API ---------------------------


// import { useMemo, useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useSnackbar } from "notistack";

// import { announcementApi } from "@/api/announcement.api";
// import type { UUID } from "@/types/common.types";
// import type {
//   AnnouncementResponse,
//   CreateAnnouncementRequest,
//   UpdateAnnouncementRequest,
// } from "@/types/announcement.types";

// import { coordinatorAnnouncementEventsMock } from "../mocks/coordinatorAnnouncements.mock";
// import type {
//   AnnouncementAction,
//   AnnouncementFormValues,
// } from "../schemas/announcement.schema";

// const announcementQueryKeys = {
//   eventAnnouncements: (eventId: string) =>
//     ["event-announcements", eventId] as const,
// };

// function mapFormToCreateRequest(
//   values: AnnouncementFormValues,
//   action: AnnouncementAction,
// ): CreateAnnouncementRequest {
//   return {
//     title: values.title,
//     content: values.content,
//     pinned: values.pinned,
//     resultAnnouncement: values.resultAnnouncement,
//     publishNow: action === "PUBLISH",
//   };
// }

// function mapFormToUpdateRequest(
//   values: AnnouncementFormValues,
// ): UpdateAnnouncementRequest {
//   return {
//     title: values.title,
//     content: values.content,
//     pinned: values.pinned,
//     resultAnnouncement: values.resultAnnouncement,
//   };
// }

// export function useCoordinatorAnnouncements(initialEventId?: string) {
//   const queryClient = useQueryClient();
//   const { enqueueSnackbar } = useSnackbar();

//   const events = coordinatorAnnouncementEventsMock;

//   const [selectedEventId, setSelectedEventId] = useState(
//     initialEventId || events[0]?.id || "",
//   );

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingAnnouncement, setEditingAnnouncement] =
//     useState<AnnouncementResponse | null>(null);

//   const announcementsQuery = useQuery({
//     queryKey: announcementQueryKeys.eventAnnouncements(selectedEventId),
//     queryFn: () => announcementApi.getEventAnnouncements(selectedEventId as UUID),
//     enabled: Boolean(selectedEventId),
//   });

//   const announcements = useMemo(() => {
//     return announcementsQuery.data ?? [];
//   }, [announcementsQuery.data]);

//   const invalidateAnnouncements = async () => {
//     await queryClient.invalidateQueries({
//       queryKey: announcementQueryKeys.eventAnnouncements(selectedEventId),
//     });
//   };

//   const createAnnouncementMutation = useMutation({
//     mutationFn: ({
//       values,
//       action,
//     }: {
//       values: AnnouncementFormValues;
//       action: AnnouncementAction;
//     }) => {
//       return announcementApi.createAnnouncement(
//         values.eventId as UUID,
//         mapFormToCreateRequest(values, action),
//       );
//     },
//     onSuccess: async (_, variables) => {
//       await invalidateAnnouncements();

//       enqueueSnackbar(
//         variables.action === "PUBLISH"
//           ? "Announcement published successfully."
//           : "Announcement saved as draft.",
//         {
//           variant: "success",
//         },
//       );
//     },
//     onError: () => {
//       enqueueSnackbar("Failed to create announcement.", {
//         variant: "error",
//       });
//     },
//   });

//   const updateAnnouncementMutation = useMutation({
//     mutationFn: ({
//       announcementId,
//       values,
//     }: {
//       announcementId: UUID;
//       values: AnnouncementFormValues;
//     }) => {
//       return announcementApi.updateAnnouncement(
//         announcementId,
//         mapFormToUpdateRequest(values),
//       );
//     },
//     onSuccess: async () => {
//       await invalidateAnnouncements();

//       enqueueSnackbar("Announcement updated successfully.", {
//         variant: "success",
//       });
//     },
//     onError: () => {
//       enqueueSnackbar("Failed to update announcement.", {
//         variant: "error",
//       });
//     },
//   });

//   const deleteAnnouncementMutation = useMutation({
//     mutationFn: (announcementId: UUID) =>
//       announcementApi.deleteAnnouncement(announcementId),
//     onSuccess: async () => {
//       await invalidateAnnouncements();

//       enqueueSnackbar("Announcement deleted successfully.", {
//         variant: "success",
//       });
//     },
//     onError: () => {
//       enqueueSnackbar("Failed to delete announcement.", {
//         variant: "error",
//       });
//     },
//   });

//   const publishAnnouncementMutation = useMutation({
//     mutationFn: (announcementId: UUID) =>
//       announcementApi.publishAnnouncement(announcementId),
//     onSuccess: async () => {
//       await invalidateAnnouncements();

//       enqueueSnackbar("Announcement published successfully.", {
//         variant: "success",
//       });
//     },
//     onError: () => {
//       enqueueSnackbar("Failed to publish announcement.", {
//         variant: "error",
//       });
//     },
//   });

//   const unpublishAnnouncementMutation = useMutation({
//     mutationFn: (announcementId: UUID) =>
//       announcementApi.unpublishAnnouncement(announcementId),
//     onSuccess: async () => {
//       await invalidateAnnouncements();

//       enqueueSnackbar("Announcement unpublished successfully.", {
//         variant: "success",
//       });
//     },
//     onError: () => {
//       enqueueSnackbar("Failed to unpublish announcement.", {
//         variant: "error",
//       });
//     },
//   });

//   const pinAnnouncementMutation = useMutation({
//     mutationFn: (announcementId: UUID) =>
//       announcementApi.pinAnnouncement(announcementId),
//     onSuccess: async () => {
//       await invalidateAnnouncements();

//       enqueueSnackbar("Announcement pinned successfully.", {
//         variant: "success",
//       });
//     },
//     onError: () => {
//       enqueueSnackbar("Failed to pin announcement.", {
//         variant: "error",
//       });
//     },
//   });

//   const unpinAnnouncementMutation = useMutation({
//     mutationFn: (announcementId: UUID) =>
//       announcementApi.unpinAnnouncement(announcementId),
//     onSuccess: async () => {
//       await invalidateAnnouncements();

//       enqueueSnackbar("Announcement unpinned successfully.", {
//         variant: "success",
//       });
//     },
//     onError: () => {
//       enqueueSnackbar("Failed to unpin announcement.", {
//         variant: "error",
//       });
//     },
//   });

//   const markResultAnnouncementMutation = useMutation({
//     mutationFn: (announcementId: UUID) =>
//       announcementApi.markResultAnnouncement(announcementId),
//     onSuccess: async () => {
//       await invalidateAnnouncements();

//       enqueueSnackbar("Announcement marked as result announcement.", {
//         variant: "success",
//       });
//     },
//     onError: () => {
//       enqueueSnackbar("Failed to mark result announcement.", {
//         variant: "error",
//       });
//     },
//   });

//   const openCreateDialog = () => {
//     setEditingAnnouncement(null);
//     setIsDialogOpen(true);
//   };

//   const openEditDialog = (announcement: AnnouncementResponse) => {
//     setEditingAnnouncement(announcement);
//     setIsDialogOpen(true);
//   };

//   const closeDialog = () => {
//     setEditingAnnouncement(null);
//     setIsDialogOpen(false);
//   };

//   const submitAnnouncement = async (
//     values: AnnouncementFormValues,
//     action: AnnouncementAction,
//   ) => {
//     if (editingAnnouncement) {
//       await updateAnnouncementMutation.mutateAsync({
//         announcementId: editingAnnouncement.id,
//         values,
//       });

//       if (action === "PUBLISH" && !editingAnnouncement.publishedAt) {
//         await publishAnnouncementMutation.mutateAsync(editingAnnouncement.id);
//       }

//       closeDialog();
//       return;
//     }

//     await createAnnouncementMutation.mutateAsync({
//       values,
//       action,
//     });

//     closeDialog();
//   };

//   const isSubmitting =
//     createAnnouncementMutation.isPending ||
//     updateAnnouncementMutation.isPending ||
//     publishAnnouncementMutation.isPending;

//   return {
//     events,
//     selectedEventId,
//     setSelectedEventId,

//     announcements,
//     announcementsQuery,

//     isDialogOpen,
//     editingAnnouncement,
//     isSubmitting,

//     openCreateDialog,
//     openEditDialog,
//     closeDialog,
//     submitAnnouncement,

//     deleteAnnouncement: deleteAnnouncementMutation.mutate,
//     publishAnnouncement: publishAnnouncementMutation.mutate,
//     unpublishAnnouncement: unpublishAnnouncementMutation.mutate,
//     pinAnnouncement: pinAnnouncementMutation.mutate,
//     unpinAnnouncement: unpinAnnouncementMutation.mutate,
//     markResultAnnouncement: markResultAnnouncementMutation.mutate,
//   };
// }


//------------------------------ TẠM THỜI ĐỂ COI GIAO DIỆN ---------------------------


import { useMemo, useState } from "react";
import { useSnackbar } from "notistack";

import type { UUID } from "@/types/common.types";
import type { AnnouncementResponse } from "@/types/announcement.types";

import {
  coordinatorAnnouncementEventsMock,
  coordinatorAnnouncementsMock,
} from "../mocks/coordinatorAnnouncements.mock";

import type {
  AnnouncementAction,
  AnnouncementFormValues,
} from "../schemas/announcement.schema";

function getNowLabel() {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function useCoordinatorAnnouncements(initialEventId?: string) {
  const { enqueueSnackbar } = useSnackbar();

  const events = coordinatorAnnouncementEventsMock;

  const [selectedEventId, setSelectedEventId] = useState(
    initialEventId || events[0]?.id || "",
  );

  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>(
    coordinatorAnnouncementsMock,
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementResponse | null>(null);

  const filteredAnnouncements = useMemo(() => {
    if (!selectedEventId) return announcements;

    return announcements.filter(
      (announcement) => announcement.eventId === selectedEventId,
    );
  }, [announcements, selectedEventId]);

  const announcementsQuery = {
    isLoading: false,
    isError: false,
    error: null,
  };

  const isSubmitting = false;

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

  const submitAnnouncement = (
    values: AnnouncementFormValues,
    action: AnnouncementAction,
  ) => {
    const now = getNowLabel();

    if (editingAnnouncement) {
      setAnnouncements((current) =>
        current.map((announcement) =>
          announcement.id === editingAnnouncement.id
            ? {
                ...announcement,
                title: values.title,
                content: values.content,
                pinned: values.pinned,
                resultAnnouncement: values.resultAnnouncement,
                publishedAt:
                  action === "PUBLISH"
                    ? now
                    : editingAnnouncement.publishedAt,
              }
            : announcement,
        ),
      );

      enqueueSnackbar(
        action === "PUBLISH"
          ? "Mock: Announcement updated and published."
          : "Mock: Announcement updated as draft.",
        {
          variant: "success",
        },
      );

      closeDialog();
      return;
    }

    const newAnnouncement: AnnouncementResponse = {
      id: crypto.randomUUID(),
      eventId: values.eventId as UUID,
      title: values.title,
      content: values.content,
      pinned: values.pinned,
      resultAnnouncement: values.resultAnnouncement,
      publishedAt: action === "PUBLISH" ? now : undefined,
      createdBy: "mock-coordinator-id",
    };

    setAnnouncements((current) => [newAnnouncement, ...current]);

    enqueueSnackbar(
      action === "PUBLISH"
        ? "Mock: Announcement published."
        : "Mock: Announcement saved as draft.",
      {
        variant: "success",
      },
    );

    closeDialog();
  };

  const deleteAnnouncement = (announcementId: UUID) => {
    setAnnouncements((current) =>
      current.filter((announcement) => announcement.id !== announcementId),
    );

    enqueueSnackbar("Mock: Announcement deleted.", {
      variant: "success",
    });
  };

  const publishAnnouncement = (announcementId: UUID) => {
    const now = getNowLabel();

    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === announcementId
          ? {
              ...announcement,
              publishedAt: now,
            }
          : announcement,
      ),
    );

    enqueueSnackbar("Mock: Announcement published.", {
      variant: "success",
    });
  };

  const unpublishAnnouncement = (announcementId: UUID) => {
    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === announcementId
          ? {
              ...announcement,
              publishedAt: undefined,
            }
          : announcement,
      ),
    );

    enqueueSnackbar("Mock: Announcement unpublished.", {
      variant: "success",
    });
  };

  const pinAnnouncement = (announcementId: UUID) => {
    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === announcementId
          ? {
              ...announcement,
              pinned: true,
            }
          : announcement,
      ),
    );

    enqueueSnackbar("Mock: Announcement pinned.", {
      variant: "success",
    });
  };

  const unpinAnnouncement = (announcementId: UUID) => {
    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === announcementId
          ? {
              ...announcement,
              pinned: false,
            }
          : announcement,
      ),
    );

    enqueueSnackbar("Mock: Announcement unpinned.", {
      variant: "success",
    });
  };

  const markResultAnnouncement = (announcementId: UUID) => {
    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === announcementId
          ? {
              ...announcement,
              resultAnnouncement: true,
            }
          : announcement,
      ),
    );

    enqueueSnackbar("Mock: Announcement marked as result announcement.", {
      variant: "success",
    });
  };

  return {
    events,
    selectedEventId,
    setSelectedEventId,

    announcements: filteredAnnouncements,
    announcementsQuery,

    isDialogOpen,
    editingAnnouncement,
    isSubmitting,

    openCreateDialog,
    openEditDialog,
    closeDialog,
    submitAnnouncement,

    deleteAnnouncement,
    publishAnnouncement,
    unpublishAnnouncement,
    pinAnnouncement,
    unpinAnnouncement,
    markResultAnnouncement,
  };
}