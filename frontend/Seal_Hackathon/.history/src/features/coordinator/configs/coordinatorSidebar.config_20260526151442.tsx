import type { SidebarLoggedinItem } from '@/components/layout/SidebarLoggedin';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import GradingOutlinedIcon from '@mui/icons-material/GradingOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

export const coordinatorSidebarItems: LoggedinSidebarItem[] = [
  {
    label: 'Dashboard',
    path: '/coordinator/dashboard',
    icon: <HomeOutlinedIcon fontSize="small" />,
  },
  {
    label: 'Events',
    path: '/coordinator/events',
    icon: <EventOutlinedIcon fontSize="small" />,
  },
  {
    label: 'Teams',
    path: '/coordinator/teams',
    icon: <GroupsOutlinedIcon fontSize="small" />,
  },
  {
    label: 'Submissions',
    path: '/coordinator/submissions',
    icon: <UploadFileOutlinedIcon fontSize="small" />,
  },
  {
    label: 'Grading',
    path: '/coordinator/grading',
    icon: <GradingOutlinedIcon fontSize="small" />,
  },
  {
    label: 'Results',
    path: '/coordinator/results',
    icon: <EmojiEventsOutlinedIcon fontSize="small" />,
  },
  {
    label: 'Analytics',
    path: '/coordinator/analytics',
    icon: <InsightsOutlinedIcon fontSize="small" />,
  },
  {
    label: 'Notifications',
    path: '/coordinator/notifications',
    icon: <NotificationsNoneOutlinedIcon fontSize="small" />,
  },
  {
    label: 'Schedule',
    path: '/coordinator/schedule',
    icon: <CalendarMonthOutlinedIcon fontSize="small" />,
  },
  {
    label: 'Reports',
    path: '/coordinator/reports',
    icon: <AssessmentOutlinedIcon fontSize="small" />,
  },
  {
    label: 'Profile',
    path: '/coordinator/profile',
    icon: <PersonOutlineOutlinedIcon fontSize="small" />,
  },
];