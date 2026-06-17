import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

export function DashboardWelcomeBanner() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-7 text-white shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
          Event Coordinator Dashboard
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          Welcome back, Coordinator!
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">
          Manage hackathon events, review operational progress, and keep competition workflows on track.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="contained"
          sx={{ bgcolor: "white", color: "#2563eb", textTransform: "none", fontWeight: 800, "&:hover": { bgcolor: "#eff6ff" } }}
          onClick={() => navigate("/coordinator/events")}
        >
          Manage Events
        </Button>

        <Button
          variant="outlined"
          sx={{ borderColor: "rgba(255,255,255,0.6)", color: "white", textTransform: "none", fontWeight: 800, "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.08)" } }}
          onClick={() => navigate("/coordinator/teams")}
        >
          Review Teams
        </Button>
      </div>
    </section>
  );
}