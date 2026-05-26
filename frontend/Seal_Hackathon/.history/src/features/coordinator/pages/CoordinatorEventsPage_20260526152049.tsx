import { useNavigate } from 'react-router-dom';

import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';

import {
    coordinatorEventsMock,
    type CoordinatorEventStatus,
} from '../mocks/coordinatorEvents.mock';

export const CoordinatorEventsPage = () => {
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
            <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                        Event Management
                    </h1>

                    <p className="mt-3 text-base text-gray-500">
                        Manage all Hackathon events, timelines, and configurations.
                    </p>
                </div>

                <Button
                    variant="contained"
                    onClick={() => navigate('/coordinator/events/create')}
                    sx={{
                        px: 2.5,
                        py: 1.1,
                        borderRadius: 2,
                        bgcolor: '#2563eb',
                        fontWeight: 800,
                        boxShadow: '0 8px 18px rgba(37, 99, 235, 0.18)',
                        '&:hover': {
                            bgcolor: '#1d4ed8',
                        },
                    }}
                >
                    + Create New Event
                </Button>
            </section>

            {/* Event table */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full border-collapse">
                    <thead className="border-b border-gray-200 bg-slate-50">
                        <th className="px-6 py-5 text-left text-xs font-extrabold uppercase tracking-[0.18em] text-gray-500">
                            Event Name
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-extrabold uppercase tracking-[0.18em] text-gray-500">
                            Timeline
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-extrabold uppercase tracking-[0.18em] text-gray-500">
                            Status
                        </th>
                        <th className="px-6 py-5 text-right text-xs font-extrabold uppercase tracking-[0.18em] text-gray-500">
                            Actions
                        </th>
                    </thead>
                    <tbody>
                        {coordinatorEventsMock.map((event) => (
                            <tr
                                key={event.id}
                                className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50/70"
                            >
                                <td className="px-6 py-6">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/coordinator/events/${event.id}`)}
                                        className="text-left text-sm font-extrabold text-gray-900 hover:text-blue-600"
                                    >
                                        {event.name}
                                    </button>
                                </td>

                                <td className="px-6 py-6 text-sm font-medium text-gray-600">
                                    {event.season}
                                </td>

                                <td className="px-6 py-6 text-sm font-medium text-gray-600">
                                    {event.rounds} Phases
                                </td>

                                <td className="px-6 py-6">
                                    {getStatusChip(event.status)}
                                </td>

                                <td className="px-6 py-6 text-right">
                                    <IconButton
                                        size="small"
                                        onClick={() => navigate(`/coordinator/events/${event.id}`)}
                                        sx={{
                                            color: '#94a3b8',
                                            '&:hover': {
                                                bgcolor: '#f1f5f9',
                                                color: '#475569',
                                            },
                                        }}
                                    >
                                        <MoreVertOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};