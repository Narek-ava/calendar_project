import { Avatar, Box, Stack, Typography } from '@mui/material';
import { stringToColor } from '../../../store/constant';
import { styled } from '@material-ui/core/styles';
import { ReactNode } from 'react';
import { Tooltip } from '@material-ui/core';

const StyledHeader = styled(Box)(({ theme }) => ({
    color: theme.palette.widget.title,
    display: 'flex',
    maxWidth: '920px',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: 'auto',
    marginRight: 'auto',

    '& .MuiAvatar-root': {
        color: '#fff',
        width: 70,
        height: 70,
        [theme.breakpoints.down('sm')]: {
            width: 50,
            height: 50
        },

        '& img': {
            width: 'auto',
            backgroundColor: 'transparent !important'
        }
    },

    '& .MuiTypography-root.title': {
        fontSize: '24px',
        lineHeight: '24px',
        [theme.breakpoints.down('sm')]: {
            fontSize: '16px'
        }
    },

    '& .MuiTypography-root.subtitle': {
        marginTop: '0 !important',
        fontSize: '15px',
        [theme.breakpoints.down('sm')]: {
            fontSize: '14px'
        }
    },

    '@media(max-width: 600px)': {
        padding: theme.spacing(0, 1)
    }
}));

interface WidgetHeaderProps {
    name: string;
    imageUrl?: string;
    subtitle?: string | ReactNode;
    tooltipText?: string;
    onAvatarClick?: () => void;
}

const WidgetHeader = ({ name, imageUrl, subtitle = 'Appointment Booking', tooltipText, onAvatarClick }: WidgetHeaderProps) => (
    <StyledHeader>
        <Tooltip title={tooltipText || ''}>
            <Avatar
                onClick={onAvatarClick}
                color="inherit"
                variant="rounded"
                src={imageUrl}
                sx={{
                    width: imageUrl ? 'auto !important' : 'inherit',
                    background: imageUrl ? 'none' : stringToColor(name),
                    cursor: onAvatarClick ? 'pointer' : 'default'
                }}
            >
                <Typography sx={{ fontSize: '40px' }}>{name.charAt(0).toUpperCase()}</Typography>
            </Avatar>
        </Tooltip>
        <Stack spacing="4px" ml={2}>
            <Typography className="title">{name}</Typography>
            <Typography className="subtitle" display="flex" alignItems="center">
                {subtitle}
            </Typography>
        </Stack>
    </StyledHeader>
);

export default WidgetHeader;
