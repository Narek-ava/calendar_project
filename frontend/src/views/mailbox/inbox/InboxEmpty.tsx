// material-ui
import { makeStyles } from '@material-ui/styles';
import { useTheme } from '@material-ui/core/styles';
import { CardMedia, Grid, Typography } from '@material-ui/core';

// project imports
import { gridSpacing } from 'store/constant';
import imageEmpty from 'assets/images/maintenance/empty.svg';
import imageDarkEmpty from 'assets/images/maintenance/empty-dark.svg';

// style constant
const useStyles = makeStyles(() => ({
    emailEmptyContent: {
        maxWidth: '720px',
        margin: '0 auto',
        textAlign: 'center'
    }
}));

// ==============================|| NO/EMPTY MAIL ||============================== //

const InboxEmpty = () => {
    const theme = useTheme();
    const classes = useStyles();

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <div className={classes.emailEmptyContent}>
                    <Grid container justifyContent="center" spacing={gridSpacing}>
                        <Grid item xs={12}>
                            <CardMedia
                                component="img"
                                image={theme.palette.mode === 'dark' ? imageDarkEmpty : imageEmpty}
                                title="Slider5 image"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={gridSpacing}>
                                <Grid item xs={12}>
                                    <Typography variant="h1" color="inherit" component="div">
                                        There is No Message
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2">When You have message that will Display here</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
            </Grid>
        </Grid>
    );
};

export default InboxEmpty;
