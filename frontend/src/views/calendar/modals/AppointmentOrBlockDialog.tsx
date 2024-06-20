import { Box, Stack } from '@material-ui/core';
import { alpha, Typography, useTheme } from '@mui/material';

interface AppointmentOrBlockDialogProps {
    isOpened: boolean;
    closeModal: () => void;
    handleOpenWizard: () => void;
    handleOpenBlock: () => void;
    matchSm: boolean;
    setIsEditBlockMode: (data: boolean) => void;
}

const AppointmentOrBlockDialog = ({
    setIsEditBlockMode,
    isOpened,
    closeModal,
    handleOpenWizard,
    handleOpenBlock,
    matchSm
}: AppointmentOrBlockDialogProps) => {
    const theme = useTheme();
    const handleOpenNewBlock = () => {
        handleOpenBlock();
        setIsEditBlockMode(true);
    };

    return (
        <Stack sx={{ p: 2, maxWidth: '400px' }} spacing={2}>
            <Stack
                onClick={handleOpenWizard}
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={{
                    p: '20px 32px',
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.getContrastText(theme.palette.primary.main),
                    border: `1px solid ${theme.palette.primary.dark}`,
                    cursor: 'pointer',
                    transition: 'backgroundColor 0.3s',
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark
                    }
                }}
            >
                <Typography textAlign="center" sx={{ fontSize: matchSm ? '16px' : '20px' }}>
                    New Appointment
                </Typography>
            </Stack>
            <Stack
                onClick={handleOpenNewBlock}
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={{
                    position: 'relative',
                    p: '20px 32px',
                    fontSize: '20px',
                    backgroundColor: alpha(theme.palette.primary.light, 0.5),
                    border: `1px solid ${theme.palette.primary.dark}`,
                    color: theme.palette.getContrastText(theme.palette.primary.light),
                    cursor: 'pointer',
                    transition: 'backgroundColor 0.3s',
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.light, 0.7)
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        height: '100%',
                        width: '20px',
                        border: `1px solid ${theme.palette.primary.dark}`,
                        backgroundImage: `repeating-linear-gradient(-45deg, ${theme.palette.primary.main} 0, transparent 1px 5px, ${theme.palette.primary.main} 6px 10px)`
                    }}
                />
                <Typography sx={{ fontSize: matchSm ? '16px' : '20px' }}>Block Time</Typography>
            </Stack>
        </Stack>
    );
};

export default AppointmentOrBlockDialog;
