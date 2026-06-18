import { useState } from 'react';
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { TeamStatusBadge } from "./TeamStatusBagde";

// Mock data cho giao diện "Global Browse Teams"
const MOCK_RECRUITING_TEAMS = [
  {
    id: "team-1",
    name: "Alpha Squad",
    projectTitle: "AI Healthcare Assistant",
    leaderName: "John Doe",
    memberCount: 3,
    maxMembers: 5,
    status: "FORMING",
    skills: ["React", "Node.js", "AI/ML"],
  },
  {
    id: "team-2",
    name: "Cyber Knights",
    projectTitle: "Blockchain Voting System",
    leaderName: "Jane Smith",
    memberCount: 2,
    maxMembers: 4,
    status: "FORMING",
    skills: ["Solidity", "Web3", "Next.js"],
  },
  {
    id: "team-3",
    name: "Data Miners",
    projectTitle: "Predictive Market Analysis",
    leaderName: "Alice Johnson",
    memberCount: 4,
    maxMembers: 5,
    status: "FORMING",
    skills: ["Python", "Data Science"],
  }
];

export function BrowseTeamsSection() {
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const handleOpenRequest = (team: any) => {
    setSelectedTeam(team);
    setMessage("");
    setRequestDialogOpen(true);
  };

  const handleCloseRequest = () => {
    setRequestDialogOpen(false);
    setSelectedTeam(null);
  };

  const handleSendRequest = () => {
    setSending(true);
    // Simulate API call
    setTimeout(() => {
      setSending(false);
      setSentRequests((prev) => new Set(prev).add(selectedTeam.id));
      handleCloseRequest();
    }, 1000);
  };

  return (
    <div className="mt-12 space-y-6 border-t border-slate-200 pt-10 dark:border-slate-800">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
          Find a Team
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Discover teams that are currently recruiting members and send a request to join them.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_RECRUITING_TEAMS.map((team) => {
          const isSent = sentRequests.has(team.id);

          return (
            <Card key={team.id} variant="outlined" className="flex flex-col overflow-hidden rounded-2xl transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
              <CardContent className="flex flex-col flex-1 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30">
                    <GroupsOutlinedIcon />
                  </div>
                  <TeamStatusBadge memberCount={team.memberCount} maxMembers={team.maxMembers} status={team.status} />
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{team.name}</h3>
                  <p className="mt-1 text-sm font-medium text-gray-500 line-clamp-1">Project: {team.projectTitle}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {team.skills.map((skill: string) => (
                    <Chip key={skill} label={skill} size="small" variant="outlined" sx={{ borderRadius: "8px", fontSize: "0.7rem", fontWeight: 600, color: "var(--mui-palette-text-secondary)", borderColor: "var(--mui-palette-divider)" }} />
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-6">
                  <p className="text-xs font-semibold text-gray-400">Leader: {team.leaderName}</p>

                  <Button
                    variant={isSent ? "outlined" : "contained"}
                    size="small"
                    disabled={isSent}
                    startIcon={!isSent && <PersonAddOutlinedIcon />}
                    onClick={() => handleOpenRequest(team)}
                    sx={{
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 700,
                      ...(isSent ? { color: "#16a34a", borderColor: "#16a34a" } : { bgcolor: "#4f46e5", boxShadow: "none", "&:hover": { bgcolor: "#4338ca", boxShadow: "none" } })
                    }}
                  >
                    {isSent ? "Request Sent" : "Request to Join"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={requestDialogOpen} onClose={handleCloseRequest} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>Request to Join Team</DialogTitle>
        <DialogContent dividers>
          {selectedTeam && (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  You are sending a request to join <strong className="text-gray-900 dark:text-white">{selectedTeam.name}</strong>.
                </p>
                <p className="text-sm mt-1 text-gray-600 dark:text-slate-400">
                  Leader: <strong className="text-gray-900 dark:text-white">{selectedTeam.leaderName}</strong>
                </p>
              </div>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message to Leader (Optional)"
                placeholder="Introduce yourself and explain why you'd be a great fit for this team..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseRequest} disabled={sending} sx={{ fontWeight: 800, textTransform: "none", borderRadius: "8px" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendRequest}
            disabled={sending}
            sx={{ bgcolor: "#4f46e5", fontWeight: 800, textTransform: "none", borderRadius: "8px", boxShadow: "none", "&:hover": { bgcolor: "#4338ca", boxShadow: "none" } }}
          >
            {sending ? "Sending..." : "Send Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
