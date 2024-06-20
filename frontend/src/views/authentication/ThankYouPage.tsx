import { useEffect } from 'react';
import { Card, Grid, Typography, Stack, Button, useMediaQuery, Theme } from '@material-ui/core';
import { gridSpacing } from 'store/constant';
import CompletedImage from 'assets/images/completed.png';
import { useTheme } from '@material-ui/core/styles';
import useSignupScript from 'hooks/useSignupScript';
import { useSearchParams } from 'react-router-dom';
import InitAPI from 'services/InitService';
import { useNavigate } from 'react-router';

const ThankYouPage = () => {
    const matchSm = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('sm'));
    const theme = useTheme();
    const navigate = useNavigate();
    useSignupScript();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id') || '';

    const { data, isLoading, error } = InitAPI.useStripeTYPageQuery(sessionId);

    useEffect(() => {
        if (!sessionId || (!isLoading && !data) || error) {
            navigate('/');
        }
    }, [data, error, isLoading, navigate, sessionId]);

    return data?.order_id ? (
        <Card sx={{ p: 2 }}>
            <Grid container direction="column" spacing={gridSpacing} alignItems="center" justifyContent="center" sx={{ my: 3 }}>
                <Grid item xs={12}>
                    <Typography variant={matchSm ? 'h2' : 'h1'} align="center">
                        Thank you for registering with Chilled Butter!
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Stack alignItems="center" spacing={2}>
                        <Typography align="center" maxWidth={1000} color={theme.palette.grey[500]}>
                            You may now proceed to the login page and start using the system. However, if you have not done it already, we
                            strongly recommend booking a free onboarding session with one of our specialists, who will help you get familiar
                            with all the features that Chilled Butter offers, and configure the system to be the best match for your
                            business.
                        </Typography>
                    </Stack>
                </Grid>
                <Grid item xs={12} sx={{ m: 3 }}>
                    <img src={CompletedImage} alt="Order Complete" width="100%" style={{ maxWidth: 780 }} />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={gridSpacing} alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <Button href="/login" variant="contained">
                                Log In
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" target="_blank" href="https://app.chilledbutter.com/cal/chilled-butter-1">
                                Book Onboarding
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <img
                src={`https://www.shareasale.com/sale.cfm?tracking=${data.order_id}&amount=${data.order_subtotal}&merchantID=135717&transtype=sale`}
                width="1"
                height="1"
            />
        </Card>
    ) : null;
};

export default ThankYouPage;
