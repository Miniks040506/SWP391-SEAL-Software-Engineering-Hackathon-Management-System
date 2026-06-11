import { useNavigate } from "react-router-dom";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";

import { TeamStatusBadge } from "../components/TeamStatusBagde";
import { useMyTeamsQuery } from "../hooks/useParticipantTeams";

export const MyTeamsPage = () => {
  const navigate = useNavigate();

  const myTeamsQuery = useMyTeamsQuery();

  const teams = myTeamsQuery.data ?? [];

  if (myTeamsQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <CircularProgress />
      </div>
    );
  }

  if (myTeamsQuery.isError) {
    return (
      <div className="space-y-4 py-32 text-center">
        <p className="font-semibold text-rose-500">Cannot load your teams.</p>

        <Button
          variant="outlined"
          onClick={() => myTeamsQuery.refetch()}
          sx={{ fontWeight: 800, textTransform: "none" }}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <section className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
            <GroupsOutlinedIcon />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
            You are not in any team yet.
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-slate-400">
            Create a team to join a SEAL event or wait for an invitation from
            another Team Leader.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={() => navigate("/participant/teams/create")}
              sx={{
                bgcolor: "#2563eb",
                fontWeight: 800,
                textTransform: "none",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              Create Team
            </Button>

            <Button
              variant="outlined"
              startIcon={<ExploreOutlinedIcon />}
              onClick={() => navigate("/events")}
              sx={{ fontWeight: 800, textTransform: "none" }}
            >
              Explore Events
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-500">
            My Teams
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
            Team Management
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            View your teams and manage team members.
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => navigate("/participant/teams/create")}
          sx={{
            bgcolor: "#2563eb",
            fontWeight: 800,
            textTransform: "none",
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          Create Team
        </Button>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {teams.map((team) => (
          <Card
            key={team.id}
            variant="outlined"
            className="overflow-hidden dark:border-slate-700 dark:bg-slate-800"
          >
            <CardContent>
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                      <GroupsOutlinedIcon />
                    </div>

                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {team.name}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {team.projectTitle || "No project title yet"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/40">
                      <p className="text-sm text-gray-500">Role</p>

                      <div className="mt-2">
                        <TeamStatusBadge status={team.roleInTeam} />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/40">
                      <p className="text-sm text-gray-500">Status</p>

                      <div className="mt-2">
                        <TeamStatusBadge status={team.status} />
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="contained"
                  onClick={() => navigate(`/participant/teams/${team.id}`)}
                  sx={{
                    bgcolor: "#2563eb",
                    fontWeight: 800,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  View Team
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};