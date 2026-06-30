import SearchIcon from "@mui/icons-material/Search";
import { filterStyles } from "@/features/ranking/pages/LeaderboardPage.styles";

type RankingFiltersProps = {
  searchTerm: string;
  filterTrack: string;
  trackOptions: string[];
  onSearchChange: (value: string) => void;
  onTrackChange: (value: string) => void;
};

export function RankingFilters({
  searchTerm,
  filterTrack,
  trackOptions,
  onSearchChange,
  onTrackChange,
}: RankingFiltersProps) {
  return (
    <div className={filterStyles.wrapper}>
      <div className={filterStyles.searchWrap}>
        <SearchIcon
          style={{ fontSize: 14 }}
          className={filterStyles.searchIcon}
        />

        <input
          type="text"
          placeholder="Search team name..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className={filterStyles.searchInput}
        />
      </div>

      <select
        value={filterTrack}
        onChange={(event) => onTrackChange(event.target.value)}
        className={filterStyles.select}
      >
        {trackOptions.map((track) => (
          <option key={track} value={track}>
            {track === "All" ? "All Categories" : track}
          </option>
        ))}
      </select>
    </div>
  );
}
