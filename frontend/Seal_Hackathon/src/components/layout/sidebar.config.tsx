import type { ReactNode } from "react";
import type { UserRole } from "@/types/auth.types";

import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import GradingOutlinedIcon from "@mui/icons-material/GradingOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import ModelTrainingOutlinedIcon from "@mui/icons-material/ModelTrainingOutlined";

export type SidebarItem = {
  label: string;
  path: string;
  icon: ReactNode;
  end?: boolean;
};

export type SidebarSection = {
  title?: string;
  items: SidebarItem[];
};

export type RoleLayoutConfig = {
  role: UserRole;
  basePath: string;
  homePath: string;
  profilePath: string;
  settingsPath: string;
  notificationPath?: string;
  sidebar: SidebarSection[];
};

export const roleLayoutConfigs: Partial<Record<UserRole, RoleLayoutConfig>> = {
  ADMIN: {
    role: "ADMIN",
    basePath: "/admin",
    homePath: "/admin/dashboard",
    profilePath: "/admin/profile",
    settingsPath: "/admin/settings",
    notificationPath: "/admin/notifications",
    sidebar: [
      {
        title: "Administration",
        items: [
          {
            label: "Dashboard",
            path: "/admin/dashboard",
            icon: <DashboardOutlinedIcon fontSize="small" />,
            end: true,
          },
          {
            label: "Users",
            path: "/admin/users",
            icon: <ManageAccountsOutlinedIcon fontSize="small" />,
          },
          {
            label: "Roles",
            path: "/admin/roles",
            icon: <RuleOutlinedIcon fontSize="small" />,
          },
          {
            label: "Permissions",
            path: "/admin/permissions",
            icon: <FactCheckOutlinedIcon fontSize="small" />,
          },
        ],
      },
      {
        title: "System",
        items: [
          {
            label: "Audit Logs",
            path: "/admin/auditLogs",
            icon: <StickyNote2OutlinedIcon fontSize="small" />,
          },
          {
            label: "System Config",
            path: "/admin/system-config",
            icon: <SettingsOutlinedIcon fontSize="small" />,
          },
          {
            label: "Health",
            path: "/admin/health",
            icon: <HealthAndSafetyOutlinedIcon fontSize="small" />,
          },
          {
            label: "Criteria",
            path: "/admin/criteria",
            icon: <GradingOutlinedIcon fontSize="small" />,
          },
          {
            label: "Exports",
            path: "/admin/exports",
            icon: <AssessmentOutlinedIcon fontSize="small" />,
          },
        ],
      },
    ],
  },

  COORDINATOR: {
    role: "COORDINATOR",
    basePath: "/coordinator",
    homePath: "/coordinator/dashboard",
    profilePath: "/coordinator/profile",
    settingsPath: "/coordinator/settings",
    notificationPath: "/coordinator/notifications",
    sidebar: [
      {
        title: "Event Management",
        items: [
          {
            label: "Dashboard",
            path: "/coordinator/dashboard",
            icon: <DashboardOutlinedIcon fontSize="small" />,
            end: true,
          },
          {
            label: "Events",
            path: "/coordinator/events",
            icon: <EventOutlinedIcon fontSize="small" />,
          },
          {
            label: "Users",
            path: "/coordinator/users",
            icon: <ManageAccountsOutlinedIcon fontSize="small" />,
          },
          {
            label: "Teams",
            path: "/coordinator/teams",
            icon: <GroupsOutlinedIcon fontSize="small" />,
          },
          {
            label: "Submissions",
            path: "/coordinator/submissions",
            icon: <UploadFileOutlinedIcon fontSize="small" />,
          },
          {
            label: "Grading",
            path: "/coordinator/grading",
            icon: <GavelOutlinedIcon fontSize="small" />,
          },
          {
            label: "Grading Progress",
            path: "/coordinator/grading-progress",
            icon: <AssessmentOutlinedIcon fontSize="small" />,
          },
          {
            label: "Results",
            path: "/coordinator/results",
            icon: <EmojiEventsOutlinedIcon fontSize="small" />,
          },
          {
            label: "Calibration Rounds",
            path: "/coordinator/calibrations",
            icon: <FactCheckOutlinedIcon fontSize="small" />,
          },
          {
            label: "Criteria",
            path: "/coordinator/criteria",
            icon: <VerifiedUserOutlinedIcon fontSize="small" />,
          },
        ],
      },
      {
        title: "Operations",
        items: [
          {
            label: "Analytics",
            path: "/coordinator/analytics",
            icon: <InsightsOutlinedIcon fontSize="small" />,
          },
          {
            label: "Announcement",
            path: "/coordinator/announcement",
            icon: <NotificationsNoneOutlinedIcon fontSize="small" />,
          },
          {
            label: "Schedule",
            path: "/coordinator/schedule",
            icon: <CalendarMonthOutlinedIcon fontSize="small" />,
          },
          {
            label: "Reports",
            path: "/coordinator/reports",
            icon: <AssessmentOutlinedIcon fontSize="small" />,
          },
          {
            label: "Audit Logs",
            path: "/coordinator/auditLogs",
            icon: <StickyNote2OutlinedIcon fontSize="small" />,
          },
        ],
      },
    ],
  },

  JUDGE: {
    role: "JUDGE",
    basePath: "/judge",
    homePath: "/judge/dashboard",
    profilePath: "/judge/profile",
    settingsPath: "/judge/settings",
    notificationPath: "/judge/notifications",
    sidebar: [
      {
        title: "Judging",
        items: [
          {
            label: "Dashboard",
            path: "/judge/dashboard",
            icon: <DashboardOutlinedIcon fontSize="small" />,
            end: true,
          },
          {
            label: "Assigned Submissions",
            path: "/judge/submissions",
            icon: <UploadFileOutlinedIcon fontSize="small" />,
          },
          {
            label: "Scoring",
            path: "/judge/scoring",
            icon: <GradingOutlinedIcon fontSize="small" />,
          },
          {
            label: "Calibration Tasks",
            path: "/judge/calibrations",
            icon: <ModelTrainingOutlinedIcon fontSize="small" />,
          },
          {
            label: "Schedule",
            path: "/judge/schedule",
            icon: <CalendarMonthOutlinedIcon fontSize="small" />,
          },
        ],
      },
    ],
  },

  MENTOR: {
    role: "MENTOR",
    basePath: "/mentor",
    homePath: "/mentor/dashboard",
    profilePath: "/mentor/profile",
    settingsPath: "/mentor/settings",
    notificationPath: "/mentor/notifications",
    sidebar: [
      {
        title: "Mentor",
        items: [
          {
            label: "Dashboard",
            path: "/mentor/dashboard",
            icon: <DashboardOutlinedIcon fontSize="small" />,
            end: true,
          },
          {
            label: "Teams",
            path: "/mentor/teams",
            icon: <GroupsOutlinedIcon fontSize="small" />,
          },
          {
            label: "Submissions",
            path: "/mentor/submissions",
            icon: <UploadFileOutlinedIcon fontSize="small" />,
          },
          {
            label: "Schedule",
            path: "/mentor/schedule",
            icon: <CalendarMonthOutlinedIcon fontSize="small" />,
          },
        ],
      },
    ],
  },
};

export function getRoleLayoutConfig(role: UserRole | null | undefined) {
  return role ? roleLayoutConfigs[role] : undefined;
}
