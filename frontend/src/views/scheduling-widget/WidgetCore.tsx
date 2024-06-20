import { useCallback, useRef, useMemo, useEffect } from 'react';
import { skipToken } from '@reduxjs/toolkit/query/react';

// material-ui
import { Grid, Theme, useMediaQuery } from '@mui/material';
import { makeStyles } from '@material-ui/styles';

// project imports
import WidgetWrapper from './WidgetWrapper';
import WidgetWizard from './widget-wizard/WidgetWizard';
import Head from 'utils/head';
import WidgetCardWrapper from './WidgetCardWrapper';
import appointmentWidgetAPI from '../../services/WidgetService';
import WidgetError from './widget-wizard/WidgetError';
import { replaceMinioToLocalhost } from '../../utils/functions/uploading-images-helpers';
import Loader from '../../ui-component/Loader';
import WidgetHeader from './components/WidgetHeader';
import WidgetThemeProvider from './WidgetThemeProvider';

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        margin: 3,
        marginBottom: 0,
        borderRadius: '50% !important',
        [theme.breakpoints.down('md')]: {
            margin: 0
        }
    }
}));

interface WidgetProps {
    companySlug?: string;
    useMobileStyles?: boolean;
}

const WidgetCore = ({ companySlug, useMobileStyles }: WidgetProps) => {
    const scrollRef = useRef();
    const classes = useStyles();

    const { refetch } = appointmentWidgetAPI.useGetCsrfCookiesQuery(null);

    useEffect(() => {
        const csrfRenew = setInterval(() => {
            refetch();
        }, 300000);

        return () => {
            clearInterval(csrfRenew);
        };
    }, [refetch]);

    const query = useMemo(() => {
        const path = window.location.pathname.split('/');
        path.splice(0, 3);
        return path.join('/');
    }, []);

    const { data, isLoading } = appointmentWidgetAPI.useGetWidgetCompanyWithQueryStringQuery(
        companySlug ? { slug: companySlug, query } : skipToken
    );

    const matchDownMedia = useMediaQuery('(max-width: 800px)');

    const matchDownMd = useMemo(() => useMobileStyles || matchDownMedia, [matchDownMedia, useMobileStyles]);

    const scrollToTop = () => {
        const curr: any = scrollRef.current;
        if (curr) {
            curr.scrollTop = 0;
        }
    };

    const getLogo = useCallback((logo) => replaceMinioToLocalhost(logo ? logo?.url : ''), []);

    return (
        <>
            {companySlug && data && (
                <WidgetThemeProvider styles={data?.settings.widget}>
                    <WidgetWrapper>
                        <Grid container alignItems="center" justifyContent="center" sx={{ m: '0 important' }}>
                            <Grid item xs justifyContent="center" className={classes.container}>
                                <Head title={`${data.name} Booking |`} />
                                <WidgetHeader
                                    name={data.name}
                                    imageUrl={data?.logo_rectangular ? getLogo(data.logo_rectangular) : getLogo(data.logo)}
                                />
                                <WidgetCardWrapper>
                                    <WidgetWizard
                                        company_slug={companySlug}
                                        categories={data.service_categories}
                                        data={data}
                                        matchDownMd={matchDownMd}
                                        scrollToTop={scrollToTop}
                                    />
                                </WidgetCardWrapper>
                            </Grid>
                        </Grid>
                    </WidgetWrapper>
                </WidgetThemeProvider>
            )}
            {isLoading && <Loader />}
            {!isLoading && !data && <WidgetError />}
        </>
    );
};

export default WidgetCore;
