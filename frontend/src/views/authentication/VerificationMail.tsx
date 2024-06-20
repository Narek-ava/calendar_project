import { useTheme } from '@material-ui/core/styles';
import { Grid, Typography, useMediaQuery } from '@material-ui/core';
import AuthWrapper from './AuthWrapper';
import AuthCardWrapper from './AuthCardWrapper';
import AuthFooter from '../../ui-component/cards/AuthFooter';
import config from 'config';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosServices } from '../../utils/axios';

const VerificationMail = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
    // const params = useParams();

    useEffect(() => {
        // @ts-ignore
        const { pathname, search } = window.location;

        axiosServices.get(pathname + search).then(() => {
            navigate(config.defaultPath, { replace: true });
        });
    }, []);

    return (
        <AuthWrapper>
            <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
                <Grid item xs={12}>
                    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
                        <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
                            <AuthCardWrapper>
                                <Grid container spacing={2} alignItems="center" justifyContent="center">
                                    <Grid item xs={12}>
                                        <Grid container alignItems="center" justifyContent="center" textAlign="center" spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography
                                                    variant="caption"
                                                    fontSize="16px"
                                                    textAlign={matchDownSM ? 'center' : 'inherit'}
                                                >
                                                    Verification email
                                                </Typography>
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

export default VerificationMail;
