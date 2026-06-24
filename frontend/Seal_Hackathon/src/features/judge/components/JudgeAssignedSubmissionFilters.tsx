export interface FilterState {
  roundId?: string;
  trackId?: string;
  gradingStatus?: string;
  search?: string;
}

interface JudgeAssignedSubmissionFiltersProps {
  value: FilterState;
  onChange: (f: FilterState) => void;
}

const mockRounds = [
  { id: "round-1", name: "Preliminary Round" },
  { id: "round-2", name: "Final Round" },
];

const mockTracks = [
  { id: "track-1", name: "Web Track" },
  { id: "track-2", name: "AI Track" },
];

export const JudgeAssignedSubmissionFilters = ({
  value,
  onChange,
}: JudgeAssignedSubmissionFiltersProps) => {
  const handleChange = (key: keyof FilterState, val: string) => {
    onChange({ ...value, [key]: val || undefined });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search team or project..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
          value={value.search || ""}
          onChange={(e) => handleChange("search", e.target.value)}
        />
      </div>

      <div className="w-full md:w-48">
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
          value={value.roundId || ""}
          onChange={(e) => handleChange("roundId", e.target.value)}
        >
          <option value="">All Rounds</option>
          {mockRounds.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full md:w-48">
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
          value={value.trackId || ""}
          onChange={(e) => handleChange("trackId", e.target.value)}
        >
          <option value="">All Tracks</option>
          {mockTracks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full md:w-48">
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
          value={value.gradingStatus || ""}
          onChange={(e) => handleChange("gradingStatus", e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Not started</option>
          <option value="READY">Ready</option>
          <option value="GRADED">Graded</option>
        </select>
      </div>
    </div>
  );
};
