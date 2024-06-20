import { Grid, IconButton, Stack } from '@material-ui/core';
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import { DrawerControlProps } from './types';

const SettingsDrawerControl = ({ handleDrawerOpen }: DrawerControlProps) => (
    <Grid container alignItems="center" justifyContent="space-between">
        <Grid item xs>
            <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1.5}>
                <IconButton onClick={handleDrawerOpen} size="small">
                    <MenuRoundedIcon fontSize="small" />
                </IconButton>
            </Stack>
        </Grid>
    </Grid>
);

export default SettingsDrawerControl;
