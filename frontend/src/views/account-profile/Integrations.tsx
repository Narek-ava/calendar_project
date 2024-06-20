import { Grid } from '@material-ui/core';
import GoogleCalendar from './google-calendar/GoogleCalendar';

const Integrations = () => (
    <Grid container spacing={1}>
        <Grid item>
            <GoogleCalendar />
        </Grid>
    </Grid>
);

export default Integrations;
