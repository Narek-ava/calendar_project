import { FC } from 'react';
import { Divider } from '@mui/material';
import { Stack } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import Transitions from '../../../ui-component/extended/Transitions';

interface CollapsibleContentProps {
    state: boolean;
    p?: string | 0;
}

const CollapsibleContent: FC<CollapsibleContentProps> = ({ children, state, p = '16px' }) => {
    const theme = useTheme();
    return (
        <Transitions type="collapse" in={state}>
            <Divider />
            <Stack
                sx={{
                    backgroundColor: theme.palette.background.default,
                    padding: p,
                    boxShadow: 2
                }}
                spacing={1}
            >
                {children}
            </Stack>
        </Transitions>
    );
};

export default CollapsibleContent;
