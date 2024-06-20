import { Stack, Typography } from '@material-ui/core';
import { Switch } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface SwitchStatusProps {
    trashed: boolean;
    handleChangeStatus: (d: boolean) => void;
}

const SwitchStatus = ({ trashed, handleChangeStatus }: SwitchStatusProps) => {
    const theme = useTheme();
    return (
        <Stack>
            <Stack direction="row" alignItems="center">
                Status
                <Switch
                    // defaultChecked
                    checked={!trashed}
                    name="self_book"
                    onChange={() => handleChangeStatus(!trashed)}
                    value={trashed}
                    sx={{ color: '#9e9e9e' }}
                />
                <Typography
                    sx={{
                        cursor: 'pointer',
                        color: trashed ? undefined : theme.palette.primary.main
                    }}
                    onClick={() => {
                        handleChangeStatus(!trashed);
                    }}
                >
                    {trashed ? 'Inactive' : 'Active'}
                </Typography>
            </Stack>
        </Stack>
    );
};

export default SwitchStatus;
