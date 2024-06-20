import { alpha, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { Box, Stack } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import ArrowBack from '@material-ui/icons/ArrowBack';

export interface ConfirmationDialogRawProps {
    keepMounted: boolean;
    isOpened: boolean;
    onClose: () => void;
    matchSm: boolean;
    handleOpenWizard: () => void;
    handleOpenBlock: () => void;
    setIsEditBlockMode: (data: boolean) => void;
}

// enum Actions {
//     Wizard = 'wizard',
//     Block = 'block'
// }

const MobileActionConfirmation = ({
    onClose,
    isOpened,
    keepMounted,
    matchSm,
    handleOpenWizard,
    handleOpenBlock,
    setIsEditBlockMode
}: ConfirmationDialogRawProps) => {
    const theme = useTheme();
    // const [value, setValue] = useState<Actions>(Actions.Wizard);

    const handleOpenNewBlock = () => {
        handleOpenBlock();
        setIsEditBlockMode(true);
    };

    // useEffect(() => {
    //     if (!isOpened) {
    //         setValue(Actions.Wizard);
    //     }
    // }, [isOpened]);

    // const handleCancel = () => {
    //     onClose();
    // };
    //
    // const handleOk = () => {
    //     if (value) {
    //         switch (value) {
    //             case Actions.Wizard:
    //                 handleOpenWizard();
    //                 break;
    //             case Actions.Block:
    //                 handleOpenNewBlock();
    //                 break;
    //         }
    //     }
    //     onClose();
    // };

    return (
        <Dialog
            id="appointment_type_select"
            // sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
            maxWidth="xs"
            open={isOpened}
            fullScreen
            fullWidth
            keepMounted={keepMounted}
        >
            <DialogTitle sx={{ p: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <IconButton
                    sx={{ position: 'absolute', left: '16px' }}
                    type="button"
                    onClick={onClose}
                    // sx={{ ml: isMobile ? 'auto !important' : undefined }}
                >
                    <ArrowBack sx={{ color: theme.palette.text.dark }} />
                </IconButton>
                <Typography sx={{ fontSize: '20px' }}>Choose Event Type</Typography>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Stack
                        // onClick={() => setValue(Actions.Wizard)}
                        onClick={handleOpenWizard}
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            p: '20px 32px',
                            // backgroundColor: value === Actions.Wizard ? theme.palette.primary.main : theme.palette.primary.light,
                            backgroundColor: theme.palette.primary.main,
                            // color: theme.palette.getContrastText(
                            //     value === Actions.Wizard ? theme.palette.primary.main : theme.palette.primary.light
                            // ),
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
                        // onClick={() => setValue(Actions.Block)}
                        onClick={handleOpenNewBlock}
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            position: 'relative',
                            p: '20px 32px',
                            fontSize: '20px',
                            // backgroundColor: value === Actions.Block ? theme.palette.primary.main : alpha(theme.palette.primary.light, 0.7),
                            backgroundColor: alpha(theme.palette.primary.light, 0.7),
                            border: `1px solid ${theme.palette.primary.dark}`,
                            // color: theme.palette.getContrastText(
                            //     value === Actions.Block ? theme.palette.primary.main : theme.palette.primary.light
                            // ),
                            color: theme.palette.getContrastText(theme.palette.primary.light),
                            cursor: 'pointer',
                            transition: 'backgroundColor 0.3s'
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                left: 0,
                                height: '100%',
                                width: '20px',
                                border: `1px solid ${theme.palette.primary.dark}`,
                                // backgroundImage: `repeating-linear-gradient(-45deg, ${
                                //     value === Actions.Block ? alpha(theme.palette.primary.light, 0.7) : theme.palette.primary.main
                                // } 0, transparent 1px 5px, ${
                                //     value === Actions.Block ? alpha(theme.palette.primary.light, 0.7) : theme.palette.primary.main
                                // } 6px 10px)`
                                backgroundImage: `repeating-linear-gradient(-45deg, ${theme.palette.primary.main} 0, transparent 1px 5px, ${theme.palette.primary.main} 6px 10px)`
                            }}
                        />
                        <Typography sx={{ fontSize: matchSm ? '16px' : '20px' }}>Block Time</Typography>
                    </Stack>
                </Stack>
            </DialogContent>
            {/*
            <DialogActions sx={{ p: '8px 24px' }}>
                <Button autoFocus onClick={handleCancel}>
                    Cancel
                </Button>
                <Button onClick={handleOk} variant="contained">
                    Ok
                </Button>
            </DialogActions>
            */}
        </Dialog>
    );
};

export default MobileActionConfirmation;
