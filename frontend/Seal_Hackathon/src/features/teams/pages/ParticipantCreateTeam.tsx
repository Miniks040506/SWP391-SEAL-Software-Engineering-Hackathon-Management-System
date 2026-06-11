import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";

import {
  createTeamSchema,
  type CreateTeamFormValues,
} from "../schemas/myTeams.schema";
import { useCreateTeamMutation } from "../hooks/useParticipantTeams";

export const CreateTeamPage = () => {
  const navigate = useNavigate();

  const createTeamMutation = useCreateTeamMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      projectTitle: "",
      description: "",
    },
  });

  const onSubmit = async (values: CreateTeamFormValues) => {
    const createdTeam = await createTeamMutation.mutateAsync({
      name: values.name,
      projectTitle: values.projectTitle || undefined,
      description: values.description || undefined,
    });

    navigate(`/participant/teams/${createdTeam.id}`);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <button
        type="button"
        onClick={() => navigate("/participant/teams")}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-blue-500"
      >
        <ArrowBackOutlinedIcon style={{ fontSize: 16 }} />
        Back to My Teams
      </button>

      <Card
        variant="outlined"
        className="mx-auto max-w-3xl dark:border-slate-700 dark:bg-slate-800"
      >
        <CardContent>
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-500">
              Create Team
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
              Create Team
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              Create a team first. Event or track registration will be handled
              later when the registration API is available.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Team Name"
              required
              fullWidth
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register("name")}
            />

            <TextField
              label="Project Title"
              fullWidth
              error={Boolean(errors.projectTitle)}
              helperText={errors.projectTitle?.message}
              {...register("projectTitle")}
            />

            <TextField
              label="Project Description"
              fullWidth
              multiline
              minRows={5}
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
              {...register("description")}
            />

            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
              <p className="text-sm font-bold text-blue-700">
                After submitting this form, you will become the Team Leader.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outlined"
                onClick={() => navigate("/participant/teams")}
                disabled={createTeamMutation.isPending}
                sx={{ fontWeight: 800, textTransform: "none" }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={createTeamMutation.isPending}
                sx={{
                  bgcolor: "#2563eb",
                  fontWeight: 800,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#1d4ed8" },
                }}
              >
                {createTeamMutation.isPending ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};