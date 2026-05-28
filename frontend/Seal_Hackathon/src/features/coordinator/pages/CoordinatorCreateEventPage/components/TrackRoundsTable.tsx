import { IconButton } from "@mui/material";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import type { TrackFormValues } from "@/features/coordinator/schemas/createEvent.schema";

type TrackRoundsTableProps = {
  tracks: TrackFormValues[];
  onDeleteTrack: (trackIndex: number) => void;
};

export const TrackRoundsTable = ({
  tracks,
  onDeleteTrack,
}: TrackRoundsTableProps) => {
  if (tracks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-gray-500">
          No tracks added yet.
        </p>

        <p className="mt-1 text-sm text-gray-400">
          Click Create Track to add the first track and its rounds.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="grid grid-cols-[1.4fr_2fr_100px_80px] bg-blue-500 px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-white">
        <div>Track</div>
        <div>Rounds</div>
        <div>Total</div>
        <div className="text-right">Action</div>
      </div>

      {tracks.map((track, trackIndex) => (
        <div
          key={track.id}
          className="grid grid-cols-[1.4fr_2fr_100px_80px] items-start border-t border-gray-100 px-6 py-5"
        >
          <div>
            <p className="font-extrabold text-gray-900">{track.trackName}</p>
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {track.description || "No description"}
            </p>
          </div>

          <div className="space-y-2">
            {track.rounds.map((round, roundIndex) => (
              <div
                key={round.id}
                className="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-bold text-gray-900">
                    {roundIndex + 1}. {round.roundName}
                  </p>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                    {round.advancementRuleType}
                  </span>

                  <span className="text-xs font-semibold text-gray-500">
                    Value: {round.advancementRuleValue || "-"}
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Submission: {round.submissionDeadline || "-"} · Judging:{" "}
                  {round.judgingDeadline || "-"}
                </p>
              </div>
            ))}
          </div>

          <div className="text-sm font-bold text-gray-700">
            {track.rounds.length} round(s)
          </div>

          <div className="text-right">
            <IconButton color="error" onClick={() => onDeleteTrack(trackIndex)}>
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  );
};
