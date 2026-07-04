// Reused in: AllEventsStandings, SingleEventLeaderboard
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

export const TransparencyBanner = () => (
  <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-4 shadow-sm">
    <VerifiedUserIcon style={{ fontSize: 20 }} className="text-blue-500 mt-0.5" />
    <div className="space-y-1">
      <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">
        Transparency Protocol
      </p>
      <p className="text-sm text-gray-500 font-semibold leading-relaxed">
        All results displayed are official. Scores have been verified through
        Inter-Rater Reliability (IRR) analysis to ensure absolute fairness
        across all judging panels.
      </p>
    </div>
  </div>
);
