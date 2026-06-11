import { z } from "zod";

export const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Team name must be 3-50 characters.")
    .max(50, "Team name must be 3-50 characters."),
  projectTitle: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const updateTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Team name must be 3-50 characters.")
    .max(50, "Team name must be 3-50 characters."),
  projectTitle: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().email("Email address is invalid."),
  message: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CreateTeamFormValues = z.infer<typeof createTeamSchema>;
export type UpdateTeamFormValues = z.infer<typeof updateTeamSchema>;
export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;