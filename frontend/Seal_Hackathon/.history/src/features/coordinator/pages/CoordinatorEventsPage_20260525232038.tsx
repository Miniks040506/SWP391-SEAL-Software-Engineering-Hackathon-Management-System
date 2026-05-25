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
                        sx = {{
                            height: 24,
              borderRadius: '8px',
              borderColor: '#bfdbfe',
              bgcolor: '#eff6ff',
              color: '#2563eb',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
                        }} 
                    />;}}/>);}
