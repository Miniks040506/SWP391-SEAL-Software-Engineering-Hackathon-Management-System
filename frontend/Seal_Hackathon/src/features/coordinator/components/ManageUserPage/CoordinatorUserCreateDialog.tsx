import {
  CreateUserDialog,
  type BaseCreateUserPayload,
  type CreateGuestJudgePayload,
} from "@/components/common/CreateUserDialog";
import {
  createUserSchema,
  CREATE_ROLES,
} from "@/features/coordinator/schemas/coordinator.schema";
import {
  useCoordinatorCreateUserMutation,
  useCreateGuestJudgeMutation,
} from "@/features/coordinator/hooks/useCoordinatorManageUserMutations";

export function CoordinatorUserCreateDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createMutation = useCoordinatorCreateUserMutation();
  const createGuestJudgeMutation = useCreateGuestJudgeMutation();

  const handleCreateUser = async (payload: BaseCreateUserPayload) => {
    await createMutation.mutateAsync(payload as any);
  };

  const handleCreateGuestJudge = async (payload: CreateGuestJudgePayload) => {
    await createGuestJudgeMutation.mutateAsync(payload);
  };

  return (
    <CreateUserDialog
      open={open}
      onClose={onClose}
      availableRoles={CREATE_ROLES}
      defaultRole="JUDGE"
      validationSchema={createUserSchema}
      isPending={createMutation.isPending}
      isPendingGuestJudge={createGuestJudgeMutation.isPending}
      onSubmitUser={handleCreateUser}
      onSubmitGuestJudge={handleCreateGuestJudge}
    />
  );
}
