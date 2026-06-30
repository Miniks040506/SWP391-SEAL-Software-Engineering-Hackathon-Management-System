import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationDetailDialog } from "@/features/notification/components/NotificationDetailDialog";
import { NotificationList } from "@/features/notification/components/NotificationList";
import {
  useDeleteNotificationMutation,
  useMarkNotificationReadMutation,
} from "@/features/notification/hooks/useNotificationMutations";
import { useNotificationsQuery } from "@/features/notification/hooks/useNotificationQueries";
import {
  useAcceptInvitationMutation,
  useMyInvitationsQuery,
  useRejectInvitationMutation,
} from "@/features/teams/hooks/useParticipantTeams";
import type { NotificationResponse } from "@/types/notification.types";
import type { TeamInvitationResponse } from "@/types/team.types";

type Props = {
  inboxPath: string;
  onClose: () => void;
};

export function NotificationDropdown({ inboxPath, onClose }: Props) {
  const navigate = useNavigate();
  const notificationsQuery = useNotificationsQuery({ page: 0, size: 5 });
  const showTeamInvitations = inboxPath.startsWith("/participant");
  const invitationsQuery = useMyInvitationsQuery(showTeamInvitations);
  const acceptInvitationMutation = useAcceptInvitationMutation();
  const rejectInvitationMutation = useRejectInvitationMutation();
  const markReadMutation = useMarkNotificationReadMutation();
  const deleteMutation = useDeleteNotificationMutation();
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationResponse | null>(null);

  const notifications = notificationsQuery.data?.content ?? [];
  const invitations = showTeamInvitations
    ? ((invitationsQuery.data ?? []) as TeamInvitationResponse[]).filter(
        (invitation) => invitation.status === "PENDING",
      )
    : [];
  const isLoading = notificationsQuery.isLoading || (showTeamInvitations && invitationsQuery.isLoading);

  const openNotification = async (notification: NotificationResponse) => {
    if (!notification.read) {
      await markReadMutation.mutateAsync(notification.id);
    }
    setSelectedNotification({ ...notification, read: true });
  };

  const deleteNotification = async (notification: NotificationResponse) => {
    await deleteMutation.mutateAsync(notification.id);
    setSelectedNotification(null);
  };

  const openTarget = (notification: NotificationResponse) => {
    onClose();
    setSelectedNotification(null);
    let url = notification.targetUrl ?? inboxPath;
    if (url.endsWith("/awards")) {
      url = url.replace("/awards", "");
    }
    navigate(url);
  };

  return (
    <div className="absolute right-0 top-full z-50 mt-3 w-[min(calc(100vw-1rem),360px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div>
          <p className="text-sm font-black text-slate-900 dark:text-white">Notifications</p>
          <p className="text-xs font-semibold text-slate-400">Latest SEAL updates and team invites</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate(inboxPath);
          }}
          className="rounded-md px-3 py-1.5 text-xs font-black text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
        >
          View all
        </button>
      </div>
      <div className="max-h-[430px] overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.length > 0 && (
              <div className="space-y-2">
                <div className="px-1 text-xs font-black uppercase tracking-wide text-blue-500">
                  Team invitations
                </div>
                {invitations.map((invitation) => (
                  <TeamInvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    disabled={acceptInvitationMutation.isPending || rejectInvitationMutation.isPending}
                    onAccept={() => acceptInvitationMutation.mutate(invitation.id)}
                    onReject={() => rejectInvitationMutation.mutate(invitation.id)}
                  />
                ))}
              </div>
            )}

            {notifications.length > 0 ? (
              <NotificationList
                notifications={notifications}
                compact
                onOpen={openNotification}
                onMarkRead={(notification) => markReadMutation.mutate(notification.id)}
              />
            ) : invitations.length === 0 ? (
              <NotificationList
                notifications={notifications}
                compact
                onOpen={openNotification}
                onMarkRead={(notification) => markReadMutation.mutate(notification.id)}
              />
            ) : null}
          </div>
        )}
      </div>
      <NotificationDetailDialog
        open={Boolean(selectedNotification)}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onMarkRead={(notification) => markReadMutation.mutate(notification.id)}
        onDelete={deleteNotification}
        onOpenTarget={openTarget}
        markReadLoading={markReadMutation.isPending}
        deleteLoading={deleteMutation.isPending}
      />
    </div>
  );
}

type TeamInvitationCardProps = {
  invitation: TeamInvitationResponse;
  disabled: boolean;
  onAccept: () => void;
  onReject: () => void;
};

function TeamInvitationCard({
  invitation,
  disabled,
  onAccept,
  onReject,
}: TeamInvitationCardProps) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 shadow-blue-100/50 dark:border-blue-500/30 dark:bg-blue-500/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-black text-slate-900 dark:text-white">
            You are invited to join {invitation.teamName}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase text-blue-500">
            Team invitation
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Invitation sent to {invitation.invitedEmail}.
          </p>
        </div>
        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onReject}
          className="flex-1 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/30 dark:bg-slate-950 dark:text-red-300 dark:hover:bg-red-500/10"
        >
          Decline
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onAccept}
          className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
