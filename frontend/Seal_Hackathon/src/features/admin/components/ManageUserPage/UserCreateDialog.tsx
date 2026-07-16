import {
  CreateUserDialog,
  type BaseCreateUserPayload,
  type CreateGuestJudgePayload,
} from "@/components/common/CreateUserDialog";
import {
  createUserSchema,
  CREATE_ROLES,
} from "@/features/admin/schemas/admin.schema";
import {
  useCreateUserMutation,
  useCreateGuestJudgeMutation,
} from "@/features/admin/hooks/useAdminMutations";

export function UserCreateDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreateUserMutation();
  const createGuestJudgeMutation = useCreateGuestJudgeMutation();

  const handleCreateUser = async (payload: BaseCreateUserPayload) => {
    await createMutation.mutateAsync(payload);
  };

  const handleCreateGuestJudge = async (payload: CreateGuestJudgePayload) => {
    await createGuestJudgeMutation.mutateAsync(payload);
  };

  return (
    <CreateUserDialog
      open={open}
      onClose={onClose}
      availableRoles={CREATE_ROLES}
      defaultRole="ADMIN"
      validationSchema={createUserSchema}
      isPending={createMutation.isPending}
      isPendingGuestJudge={createGuestJudgeMutation.isPending}
      onSubmitUser={handleCreateUser}
      onSubmitGuestJudge={handleCreateGuestJudge}
    />
  );
}
