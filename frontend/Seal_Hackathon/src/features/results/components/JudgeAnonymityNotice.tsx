import { Alert } from "@mui/material";

export const JudgeAnonymityNotice = () => {
  return (
    <Alert severity="info" variant="standard">
      Judge anonymity is protected. This page shows aggregated scores only and does not reveal individual judge identities.
    </Alert>
  );
};
