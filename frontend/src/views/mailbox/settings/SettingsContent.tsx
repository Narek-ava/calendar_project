import { useTheme } from '@material-ui/core/styles';
import { Grid, useMediaQuery } from '@material-ui/core';
import SettingsDrawerControl from './SettingsDrawerControl';

// assets
import { SettingsPageProps } from './types';
import SettingsSelector from './SettingsSelector';

// ==============================|| CUSTOMER LIST ||============================== //

const SettingsContent = ({ handleDrawerOpen, data, employees, isLoading }: SettingsPageProps) => {
    const theme = useTheme();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <>
            <Grid container spacing={matchDownSM ? 3 : 1}>
                <Grid item xs={12}>
                    <SettingsDrawerControl handleDrawerOpen={handleDrawerOpen} />
                </Grid>
                <Grid item xs={12}>
                    <SettingsSelector data={data} employees={employees} isLoading={isLoading} />
                </Grid>
            </Grid>
        </>
    );
};

export default SettingsContent;
