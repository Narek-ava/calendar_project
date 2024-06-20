// material-ui
import { makeStyles } from '@material-ui/styles';
import { Theme, useTheme } from '@material-ui/core/styles';
import { Button, Card, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import { gridSpacing } from 'store/constant';

// assets

import imageBackground from 'assets/images/maintenance/img-error-bg.svg';
import imageDarkBackground from 'assets/images/maintenance/img-error-bg-dark.svg';
import imageBlue from 'assets/images/maintenance/img-error-blue.svg';
import imageText from 'assets/images/maintenance/img-error-text.svg';
import imagePurple from 'assets/images/maintenance/img-error-purple.svg';
import { useNavigate } from 'react-router';
import { IconArrowBack } from '@tabler/icons';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    errorImg: {
        maxWidth: '720px',
        margin: '0 auto',
        position: 'relative'
    },
    errorContent: {
        maxWidth: '350px',
        margin: '0 auto',
        textAlign: 'center'
    },
    errorBlock: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    imgBlock: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        animation: '3s bounce ease-in-out infinite'
    },
    imgBlue: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        animation: '15s wings ease-in-out infinite'
    },
    imgPurple: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        animation: '12s wings ease-in-out infinite'
    }
}));

// ==============================|| WIDGET ERROR PAGE ||============================== //

const Error = () => {
    const theme = useTheme();
    const classes = useStyles();
    const navigate = useNavigate();
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <Card className={classes.errorBlock}>
            <CardContent>
                <Grid container justifyContent="center" spacing={gridSpacing}>
                    <Grid item xs={12}>
                        <div className={classes.errorImg}>
                            <CardMedia
                                component="img"
                                image={theme.palette.mode === 'dark' ? imageDarkBackground : imageBackground}
                                title="Slider5 image"
                            />
                            <CardMedia component="img" image={imageText} title="Slider5 image" className={classes.imgBlock} />
                            <CardMedia component="img" image={imageBlue} title="Slider5 image" className={classes.imgBlue} />
                            <CardMedia component="img" image={imagePurple} title="Slider5 image" className={classes.imgPurple} />
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <div className={classes.errorContent}>
                            <Grid container spacing={gridSpacing}>
                                <Grid item xs={12}>
                                    <Typography variant="h1" component="div">
                                        Something is wrong
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2">
                                        The Organization you are looking was moved, removed, renamed, or might never exist!{' '}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <AnimateButton>
                                        <Button variant="contained" size="large" onClick={handleBack}>
                                            <IconArrowBack /> Back
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

export default Error;
