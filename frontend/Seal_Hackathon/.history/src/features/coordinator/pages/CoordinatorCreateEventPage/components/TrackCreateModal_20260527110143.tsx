import { useEffect } from "react";
import {
    Controller,
    FormProvider,
    useFieldArray,
    useForm,
    useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Dialog from "@mui/material";
import DialogTitle from "@mui/material";
import DialogContent from "@mui/material";
import DialogActions from "@mui/material";
import Button from "@mui/material";
import TextField from "@mui/material";
import MenuItem from "@mui/material";
import IconButton from "@mui/material";

import AddOutlinedICon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import {
    ADVANCEMENT_RULE_TYPES,
    createEmptyRound,
    createEmptyTrack,
    createEventTrackSchema,
    TrackFormValues,
} from "../createEvent.schema";

type TrackCreateModalProps = {
    open: boolean;
    onClose: () => void;
    onSave: (track: TrackFormValues) => void;
};

export const TrackCreateModal = ({
    open, onClose, onSave,
}: TrackCreateModalProps) => {
    const methods = useForm<TrackFormValues>({
        resolver: zodResolver(createEventTrackSchema),
        defaultValues: createEmptyTrack().
        mode: "onSubmit",
    });

    const {
        register, 
        control, 
        handleSubmit,
        reset,
        hadleSubmit,
        reset,
        trigger,
        formState: { error },
    } = methods;

    const {
        fields: roundFields,
        append: appendRound,
        remove: removeRound,
    } = useFieldArray ({
        control,
        name: "rounds",
        keyName: "fieldId",
    });

    const trackName = useWatch({
        control,
        name: "trackName",
    });

    const canAddRound = Boolean(trackName?.trim());

    useEffect(() => {
        if (open) {
            reset(createEmptyTrack)
        }
    }, [open, reset]);

    const handleAddRound = async () => {
        const isTracknameValid = await trigger ("trackName", {
            shouldFocus: true,
        });

        if 
    }
}