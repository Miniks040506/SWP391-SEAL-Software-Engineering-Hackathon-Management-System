import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";

interface PublishDistributionDialogProps {
    open: boolean;
    isPublishing: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const PublishDistributionDialog = ({
    open,
    isPublishing,
    onClose,
    onConfirm,
}: PublishDistributionDialogProps) => {
    return (
        <Dialog 
            open={open} 
            onClose={isPublishing ? undefined : onClose}
            PaperProps={{ sx: { borderRadius: "16px" } }}
        >
            <DialogTitle sx={{ fontWeight: 900, color: "slate.900" }}>
                Publish calibration distribution?
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ fontWeight: 500, color: "slate.600" }}>
                    After publishing, judges can view anonymized calibration distribution. Judge identities will not be shown.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button 
                    onClick={onClose} 
                    disabled={isPublishing}
                    sx={{ textTransform: "none", fontWeight: 700, color: "slate.500" }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={isPublishing}
                    variant="contained"
                    color="primary"
                    startIcon={<AssessmentIcon />}
                    sx={{ 
                        textTransform: "none", 
                        fontWeight: 800, 
                        borderRadius: "10px", 
                    }}
                >
                    {isPublishing ? "Publishing..." : "Publish distribution"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
