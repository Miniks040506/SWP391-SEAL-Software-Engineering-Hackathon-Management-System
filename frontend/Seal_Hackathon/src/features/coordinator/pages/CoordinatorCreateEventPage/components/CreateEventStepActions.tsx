import Button from "@mui/material/Button";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

type CreateEventStepActionsProps = {
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  submit?: boolean;
};

export const CreateEventStepActions = ({
  onBack,
  onNext,
  nextLabel = "Next Step",
  submitLabel = "Create Event",
  isSubmitting = false,
  submit = false,
}: CreateEventStepActionsProps) => {
  return (
    <div className="flex justify-between border-t border-gray-100 px-7 py-5">
      <Button type="button" variant="outlined" onClick={onBack}>
        Back
      </Button>

      {submit ? (
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            px: 2.5,
            py: 1.1,
            borderRadius: 2,
            bgcolor: "#2563eb",
            fontWeight: 800,
            "&:hover": {
              bgcolor: "#1d4ed8",
            },
          }}
        >
          {isSubmitting ? "Creating..." : submitLabel}
        </Button>
      ) : (
        <Button
          type="button"
          variant="contained"
          endIcon={<ArrowForwardOutlinedIcon />}
          onClick={onNext}
          sx={{
            px: 2.5,
            py: 1.1,
            borderRadius: 2,
            bgcolor: "#2563eb",
            fontWeight: 800,
            "&:hover": {
              bgcolor: "#1d4ed8",
            },
          }}
        >
            {nextLabel}
        </Button>
      )}
    </div>
  );
};
