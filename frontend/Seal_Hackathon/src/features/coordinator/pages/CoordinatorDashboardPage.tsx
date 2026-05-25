import { useNavigate } from 'react-router-dom';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';

import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import GradingOutlinedIcon from '@mui/icons-material/GradingOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

import {
  coordinatorSummaryCards,
  coordinatorCurrentEvent,
  coordinatorResultStatus,
  coordinatorPendingActions,
  coordinatorRecentActivities,
  type PendingActionType,
  type SummaryCardType,
} from '../mocks/coordinatorDashboard.mock';

export const CoordinatorDashboardPage = () => {
  const navigate = useNavigate();

  const getPriorityColor = (priority: PendingActionType['priority']) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getSummaryIcon = (iconType: SummaryCardType['iconType']) => {
    switch (iconType) {
      case 'event':
        return <EventAvailableOutlinedIcon />;
      case 'team':
        return <GroupsOutlinedIcon />;
      case 'submission':
        return <UploadFileOutlinedIcon />;
      case 'grading':
        return <GradingOutlinedIcon />;
      default:
        return <EventAvailableOutlinedIcon />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-7 text-white shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
            Event Coordinator Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            Welcome back, Coordinator!
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-blue-100">
            Manage SEAL events, team approvals, submissions, grading progress,
            results, and reports from one workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: '#2563eb',
              '&:hover': {
                bgcolor: '#eff6ff',
              },
            }}
            onClick={() => navigate('/coordinator/events')}
          >
            Manage Events
          </Button>

          <Button
            variant="outlined"
            sx={{
              borderColor: 'rgba(255,255,255,0.6)',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.08)',
              },
            }}
            onClick={() => navigate('/coordinator/teams')}
          >
            Review Teams
          </Button>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {coordinatorSummaryCards.map((item) => (
          <Card key={item.title} variant="outlined" className="border-gray-100">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    {item.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                    {item.value}
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    {item.description}
                  </p>
                </div>

                <div className={`rounded-2xl p-3 ${item.color}`}>
                  {getSummaryIcon(item.iconType)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Current Event + Result Status */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card variant="outlined" className="xl:col-span-2">
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Current Event
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    {coordinatorCurrentEvent.name}
                  </h2>

                  <Chip
                    label={coordinatorCurrentEvent.status}
                    color="primary"
                    size="small"
                  />
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Competition Period: {coordinatorCurrentEvent.competitionPeriod}
                </p>
              </div>

              <Button
                variant="outlined"
                endIcon={<ArrowForwardOutlinedIcon />}
                onClick={() => navigate('/coordinator/events')}
              >
                View Details
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-gray-500">Season</p>
                <p className="mt-1 font-bold text-gray-900">
                  {coordinatorCurrentEvent.season}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-gray-500">Tracks</p>
                <p className="mt-1 font-bold text-gray-900">
                  {coordinatorCurrentEvent.tracks}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-gray-500">Rounds</p>
                <p className="mt-1 font-bold text-gray-900">
                  {coordinatorCurrentEvent.rounds}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-gray-500">Approved Teams</p>
                <p className="mt-1 font-bold text-gray-900">
                  {coordinatorCurrentEvent.approvedTeams}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">
                  Preliminary Round Progress
                </p>

                <p className="text-sm font-bold text-blue-600">
                  {coordinatorCurrentEvent.progress}%
                </p>
              </div>

              <LinearProgress
                variant="determinate"
                value={coordinatorCurrentEvent.progress}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  bgcolor: '#e5e7eb',
                }}
              />

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-gray-100 p-3">
                  <p className="text-xs text-gray-400">Submission</p>
                  <p className="text-sm font-bold text-gray-900">
                    {coordinatorCurrentEvent.submissionProgress}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 p-3">
                  <p className="text-xs text-gray-400">Grading</p>
                  <p className="text-sm font-bold text-gray-900">
                    {coordinatorCurrentEvent.gradingProgress}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 p-3">
                  <p className="text-xs text-gray-400">Result</p>
                  <p className="text-sm font-bold text-gray-900">
                    {coordinatorCurrentEvent.resultStatus}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Result Status
                </p>

                <h2 className="mt-2 text-xl font-extrabold text-gray-900">
                  {coordinatorResultStatus.round}
                </h2>
              </div>

              <div className="rounded-2xl bg-yellow-50 p-3 text-yellow-600">
                <EmojiEventsOutlinedIcon />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-500">Ranking calculated</span>
                  <span className="font-bold text-gray-900">
                    {coordinatorResultStatus.rankingCalculated}%
                  </span>
                </div>

                <LinearProgress
                  variant="determinate"
                  value={coordinatorResultStatus.rankingCalculated}
                  sx={{ height: 7, borderRadius: 999 }}
                />
              </div>

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-500">Awards assigned</span>
                  <span className="font-bold text-gray-900">
                    {coordinatorResultStatus.awardsAssigned}%
                  </span>
                </div>

                <LinearProgress
                  variant="determinate"
                  value={coordinatorResultStatus.awardsAssigned}
                  sx={{ height: 7, borderRadius: 999 }}
                />
              </div>

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-500">Published</span>
                  <span className="font-bold text-gray-900">
                    {coordinatorResultStatus.published}%
                  </span>
                </div>

                <LinearProgress
                  variant="determinate"
                  value={coordinatorResultStatus.published}
                  sx={{ height: 7, borderRadius: 999 }}
                />
              </div>
            </div>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 4 }}
              onClick={() => navigate('/coordinator/prizes')}
            >
              Review Results
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Pending Actions + Recent Activity */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card variant="outlined" className="xl:col-span-2">
          <CardContent>
            <div className="mb-4">
              <h2 className="text-xl font-extrabold text-gray-900">
                Pending Actions
              </h2>

              <p className="text-sm text-gray-500">
                Tasks that need your attention.
              </p>
            </div>

            <div className="space-y-3">
              {coordinatorPendingActions.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-gray-900">
                        {item.title}
                      </h3>

                      <Chip
                        label={item.priority}
                        color={getPriorityColor(item.priority)}
                        size="small"
                      />
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.description}
                    </p>
                  </div>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(item.path)}
                  >
                    {item.actionLabel}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <h2 className="text-xl font-extrabold text-gray-900">
              Recent Activity
            </h2>

            <p className="text-sm text-gray-500">
              Latest coordinator actions.
            </p>

            <div className="mt-5 space-y-5">
              {coordinatorRecentActivities.map((item) => (
                <div
                  key={item.id}
                  className="relative border-l border-gray-200 pl-4"
                >
                  <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500" />

                  <p className="text-xs font-semibold text-gray-400">
                    {item.time}
                  </p>

                  <h3 className="mt-1 text-sm font-bold text-gray-900">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};