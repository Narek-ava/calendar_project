import { Stack, Switch, Typography } from '@material-ui/core';
import { useTheme } from '@mui/material/styles';

interface SwitchWithLabelProps {
    isActive: boolean;
    toggleStatus: () => void;
    title: string;
    width?: number;
    labelPlacement?: 'left' | 'right';
}

const SwitchWithLabel = ({ isActive, toggleStatus, title, width, labelPlacement = 'right' }: SwitchWithLabelProps) => {
    const theme = useTheme();

    return (
        <Stack display="flex" flexDirection="row" alignItems="center" width={width || 200}>
            <Typography
                order={labelPlacement === 'left' ? 0 : 1}
                onClick={toggleStatus}
                sx={{
                    cursor: 'pointer',
                    fontWeight: isActive ? 'bold' : 'normal',
                    color: isActive ? theme.palette.primary.main : 'inherit'
                }}
            >
                {title}
            </Typography>
            <Switch checked={isActive} onChange={toggleStatus} />
        </Stack>
    );
};

export default SwitchWithLabel;
