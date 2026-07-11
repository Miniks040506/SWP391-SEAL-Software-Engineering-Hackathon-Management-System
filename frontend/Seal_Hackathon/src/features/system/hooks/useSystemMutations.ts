import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { systemApi } from "@/api/system.api";
import type { UpdateSystemConfigRequest } from "@/types/system.types";
import { systemQueryKeys } from "./useSystemQueries";

export const useUpdateSystemConfigMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSystemConfigRequest) => systemApi.updateSystemConfig(payload),
    onSuccess: () => {
      enqueueSnackbar("System configuration saved.", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.all });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      enqueueSnackbar(
        error?.response?.data?.message || error?.message || "Could not save system configuration.",
        { variant: "error" },
      );
    },
  });
};

export const useSeedSystemConfigMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => systemApi.seedDefaultSystemConfig(),
    onSuccess: () => {
      enqueueSnackbar("Default system configuration seeded.", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: systemQueryKeys.all });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      enqueueSnackbar(
        error?.response?.data?.message || error?.message || "Could not seed default configuration.",
        { variant: "error" },
      );
    },
  });
};
