import type { CalibrationRoundResponse } from "@/types/calibration.types";
import { CalibrationRoundCard } from "./CalibrationRoundCard";

interface CalibrationRoundTableProps {
    rounds: CalibrationRoundResponse[];
    onPublish: (id: string) => void;
    isPublishing: string | null;
}

export const CalibrationRoundTable = ({
    rounds,
    onPublish,
    isPublishing,
}: CalibrationRoundTableProps) => {
    if (!rounds || rounds.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {rounds.map((round, index) => (
                <CalibrationRoundCard
                    key={round.id}
                    round={round}
                    index={index}
                    onPublish={onPublish}
                    isPublishing={isPublishing === round.id}
                />
            ))}
        </div>
    );
};
