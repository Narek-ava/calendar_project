import { Button, Card, CardContent, Grid, Typography } from '@material-ui/core';
import { gridSpacing } from '../../../store/constant';
import AnimateButton from '../../../ui-component/extended/AnimateButton';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';
import AssignmentIndOutlined from '@material-ui/icons/AssignmentIndOutlined';

const useStyles = makeStyles((theme: Theme) => ({
    errorContent: {
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center'
    },
    errorBlock: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
}));

const CalendarError = () => {
    const classes = useStyles();
    return (
        <Card className={classes.errorBlock}>
            <CardContent>
                <Grid container justifyContent="center" spacing={gridSpacing}>
                    <Grid item xs={12}>
                        <div className={classes.errorContent}>
                            <Grid container spacing={gridSpacing}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ fontSize: '1.3rem' }}>
                                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                                        Please assign at least 1 location to yourself in order to view a calendar
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <AnimateButton>
                                        <Button variant="contained" size="large" component={Link} to="/employee">
                                            <AssignmentIndOutlined sx={{ fontSize: '1.3rem', mr: 0.75 }} /> To Profiles
                                        </Button>
                                    </AnimateButton>
                                </Grid>
                            </Grid>
                        </div>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default CalendarError;
