import { useEffect } from "react";
import { Controller, FormProvider, useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import type { AnnouncementResponse } from "@/types/announcement.types";

import type { AnnouncementEventOption } from "../mocks/coordinatorAnnouncements.mock";
import {
  announcementFormSchema,
  initialAnnouncementFormValues,
  type AnnouncementAction,
  type AnnouncementFormValues,
} from "../schemas/announcement.schema";

type AnnouncementFormDialogProps = {
  open: boolean;
  events: AnnouncementEventOption[];
  selectedEventId: string;
  initialAnnouncement: AnnouncementResponse | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: AnnouncementFormValues, action: AnnouncementAction) => void;
};

export const AnnouncementFormDialog = ({
  open,
  events,
  selectedEventId,
  initialAnnouncement,
  isSubmitting,
  onClose,
  onSubmit,
}: AnnouncementFormDialogProps) => {
  const isEditMode = Boolean(initialAnnouncement);

  const methods = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      ...initialAnnouncementFormValues,
      eventId: selectedEventId,
    },
    mode: "onSubmit",
  });

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (!open) return;

    if (initialAnnouncement) {
      reset({
        eventId: initialAnnouncement.eventId,
        title: initialAnnouncement.title,
        content: initialAnnouncement.content,
        pinned: initialAnnouncement.pinned,
        resultAnnouncement: initialAnnouncement.resultAnnouncement,
      });
      return;
    }

    reset({
      ...initialAnnouncementFormValues,
      eventId: selectedEventId,
    });
  }, [open, initialAnnouncement, selectedEventId, reset]);

  const handleActionSubmit = (action: AnnouncementAction) => {
    handleSubmit((values) => onSubmit(values, action))();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 900 }}>
        {isEditMode ? "Edit Announcement" : "Create Announcement"}
      </DialogTitle>

      <FormProvider {...methods}>
        <DialogContent dividers>
          <div className="space-y-5">
            <TextField
              select
              label="Event"
              error={Boolean(errors.eventId)}
              helperText={errors.eventId?.message}
              fullWidth
              required
              size="small"
              disabled={isEditMode}
              {...register("eventId")}
            >
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Title"
              placeholder="e.g. Submission deadline reminder"
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
              fullWidth
              required
              size="small"
              {...register("title")}
            />

            <TextField
              label="Content"
              placeholder="Write announcement content..."
              error={Boolean(errors.content)}
              helperText={errors.content?.message}
              fullWidth
              required
              multiline
              minRows={6}
              {...register("content")}
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Controller
                name="pinned"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                      />
                    }
                    label="Pin announcement"
                  />
                )}
              />

              <Controller
                name="resultAnnouncement"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                      />
                    }
                    label="Mark as result announcement"
                  />
                )}
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="outlined"
            onClick={() => handleActionSubmit("DRAFT")}
            disabled={isSubmitting}
            sx={{ fontWeight: 800 }}
          >
            Save Draft
          </Button>

          <Button
            variant="contained"
            onClick={() => handleActionSubmit("PUBLISH")}
            disabled={isSubmitting}
            sx={{
              bgcolor: "#2563eb",
              fontWeight: 800,
              "&:hover": {
                bgcolor: "#1d4ed8",
              },
            }}
          >
            Publish Now
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};