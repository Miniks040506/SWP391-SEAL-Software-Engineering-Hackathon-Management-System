import { Alert, AlertTitle, Button } from "@mui/material";
import {
  CheckCircleOutlined,
  CancelOutlined,
  HourglassEmptyOutlined,
  ArrowForwardOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { FinalAdvancementStatus } from "@/types/advancement.types";

interface TeamAdvancementStatusBannerProps {
  status: FinalAdvancementStatus;
  message: string;
  nextRoundId?: string | null;
  nextRoundName?: string | null;
  canAccessNextRound: boolean;
  eventId: string;
}

export function TeamAdvancementStatusBanner({
  status,
  message,
  nextRoundId,
  nextRoundName,
  canAccessNextRound,
  eventId,
}: TeamAdvancementStatusBannerProps) {
  const navigate = useNavigate();

  if (status === "WAITING") {
    return (
      <Alert severity="info" icon={<HourglassEmptyOutlined />} className="mb-4">
        <AlertTitle>Waiting for advancement result</AlertTitle>
        {message ||
          "Your team result for this round has not been confirmed yet."}
      </Alert>
    );
  }

  if (status === "ELIMINATED") {
    return (
      <Alert severity="error" icon={<CancelOutlined />} className="mb-4">
        <AlertTitle>Eliminated</AlertTitle>
        {message || "Your team cannot submit deliverables for later rounds."}
      </Alert>
    );
  }

  if (status === "ADVANCED") {
    return (
      <Alert
        severity="success"
        icon={<CheckCircleOutlined />}
        className="mb-4"
        action={
          canAccessNextRound && nextRoundId ? (
            <Button
              color="inherit"
              size="small"
              endIcon={<ArrowForwardOutlined />}
              onClick={() => navigate(`/events/${eventId}/competing`)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {nextRoundName ? `Go to ${nextRoundName}` : "Go to next round"}
            </Button>
          ) : undefined
        }
      >
        <AlertTitle>Advanced to next round</AlertTitle>
        {canAccessNextRound
          ? message || "Your team is eligible for the next round."
          : "Your team is eligible for the next round once it opens."}
      </Alert>
    );
  }

  return null;
}
