import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@material-ui/core/styles';
import { Button, Grid, Typography, useMediaQuery } from '@material-ui/core';

// project imports
import AuthWrapper from './AuthWrapper';
import AuthCardWrapper from './AuthCardWrapper';
import Logo from '../../ui-component/Logo';
import AuthFooter from '../../ui-component/cards/AuthFooter';

// assets

// ==============================|| AUTH3 - CHECK MAIL ||============================== //

const CheckMail = () => {
    const theme = useTheme();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <AuthWrapper>
            <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
                <Grid item xs={12}>
                    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
                        <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
                            <AuthCardWrapper>
                                <Grid container spacing={2} alignItems="center" justifyContent="center">
                                    <Grid item sx={{ mb: 3 }}>
                                        <Link to="#">
                                            <Logo />
                                        </Link>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center" justifyContent="center" textAlign="center" spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography
                                                    color={theme.palette.secondary.main}
                                                    gutterBottom
                                                    variant={matchDownSM ? 'h3' : 'h2'}
                                                >
                                                    Hi, Check Your Mail
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography
                                                    variant="caption"
                                                    fontSize="16px"
                                                    textAlign={matchDownSM ? 'center' : 'inherit'}
                                                >
                                                    We have sent a password recover instructions to your email.
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant="contained"
                                                    component={Link}
                                                    to="/login"
                                                    color="secondary"
                                                    sx={{ textDecoration: 'none' }}
                                                >
                                                    Back to Login Page
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </AuthCardWrapper>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
                    <AuthFooter />
                </Grid>
            </Grid>
        </AuthWrapper>
    );
};

export default CheckMail;
