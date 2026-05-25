import React from "react";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

interface EventMetaGridProps {
  startDate: string;
}

export const EventMetaGrid = ({ startDate }: EventMetaGridProps) => {
  const items = [
    { label: "Start Date", val: startDate, Icon: EventIcon },
    { label: "Venue", val: "FPT Uni HCM", Icon: LocationOnIcon },
    { label: "Audience", val: "SE Faculty", Icon: GroupIcon },
    { label: "Awards", val: "Certified", Icon: WorkspacePremiumIcon },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
      {items.map(({ label, val, Icon }) => (
        <div
          key={label}
          className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:bg-white transition-all">
          <Icon style={{ fontSize: 18 }} className="text-blue-500 mb-3" />
          <span className="text-xs text-gray-400 block uppercase font-bold tracking-widest mb-1">
            {label}
          </span>
          <span className="text-gray-800 font-bold text-sm truncate block">
            {val}
          </span>
        </div>
      ))}
    </div>
  );
};
