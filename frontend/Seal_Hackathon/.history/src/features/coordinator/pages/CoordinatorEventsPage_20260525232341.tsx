import { useNavigate } from 'react-router-dom';

import MOreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';

import {
    coordinatorEventMock,
    type CoordinatorEventStatus,
} from '../mocks/coordinatorEvents.mock';

export const CpordinatorEventsPage = () => {
    const navigate = useNavigate();

    const getStatusChip = (status: CoordinatorEventStatus) => {
    switch (status) {
      case 'ONGOING':
        return (
          <Chip
            label="ONGOING"
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              borderRadius: '8px',
              borderColor: '#bfdbfe',
              bgcolor: '#eff6ff',
              color: '#2563eb',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}
          />
        );

        case 'DRAFT':
        return (
          <Chip
            label="DRAFT"
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              borderRadius: '8px',
              borderColor: '#fef3c7',
              bgcolor: '#fffbeb',
              color: '#d97706',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}
          />
        );

        case 'ENDED':
        return (
          <Chip
            label="ENDED"
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              borderRadius: '8px',
              borderColor: '#e5e7eb',
              bgcolor: '#f3f4f6',
              color: '#6b7280',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}
          />
        );

        default:
        return null;
    }
    };

    return (
        <div className="space-y-8">
            <section  className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                        Event Management
                    </h1>

                    <p className="mt-3 text-base text-gray-500">
                        Manage all Hackathon events, timelines, and configurations.
                    </p>
                </div>
            </section>
        </div>
    )
