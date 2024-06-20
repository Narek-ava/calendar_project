import { useCallback } from 'react';

// third-party
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router';

// material-ui
import { Grid, Theme, useMediaQuery } from '@material-ui/core';
import PersonOutlined from '@material-ui/icons/PersonOutlined';

// project imports
import appointmentWidgetAPI from '../../services/WidgetService';
import WidgetWrapper from '../scheduling-widget/WidgetWrapper';
import WidgetCardWrapper from '../scheduling-widget/WidgetCardWrapper';
import Loader from '../../ui-component/Loader';
import AppointmentsWrapper from './appointments/AppointmentsWrapper';
import { replaceMinioToLocalhost } from '../../utils/functions/uploading-images-helpers';
import { skipToken } from '@reduxjs/toolkit/query/react';
import WidgetThemeProvider from '../scheduling-widget/WidgetThemeProvider';
import WidgetHeader from '../scheduling-widget/components/WidgetHeader';

const Widget = () => {
    const navigate = useNavigate();
    const { company_slug, appointment_uuid } = useParams();
    const { data: appointmentData, isLoading, refetch } = appointmentWidgetAPI.useGetCustomerAppointmentQuery(
        company_slug && appointment_uuid ? { company_slug, appointment_uuid } : skipToken
    );

    const matchSm = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('sm'));
    const getLogo = useCallback((logo) => replaceMinioToLocalhost(logo ? logo?.url : ''), []);

    const handleGoToBookingWidget = useCallback(() => {
        if (company_slug) {
            navigate(`/cal/${company_slug}`);
        }
    }, [company_slug, navigate]);

    return (
        <>
            {company_slug && appointmentData && (
                <WidgetThemeProvider styles={appointmentData?.company?.settings.widget}>
                    <WidgetWrapper>
                        <Grid container alignItems="center" justifyContent="center" sx={{ m: '0 important' }}>
                            <Grid item sx={{ m: matchSm ? 0 : 3, mb: 0, borderRadius: '50% !important' }} xs justifyContent="center">
                                <Helmet>
                                    <title>
                                        {`${appointmentData.customer.firstname} ${appointmentData.customer.lastname} Bookings | Chilled Butter App`}
                                    </title>
                                </Helmet>
                                <WidgetHeader
                                    name={appointmentData.company?.name || ''}
                                    imageUrl={
                                        appointmentData.company?.logo_rectangular
                                            ? getLogo(appointmentData.company?.logo_rectangular)
                                            : getLogo(appointmentData.company?.logo)
                                    }
                                    subtitle={
                                        <>
                                            <PersonOutlined />
                                            {`${appointmentData.customer.firstname} ${appointmentData.customer.lastname} `}
                                        </>
                                    }
                                    tooltipText="To Booking Widget"
                                    onAvatarClick={handleGoToBookingWidget}
                                />
                                <WidgetCardWrapper>
                                    <AppointmentsWrapper
                                        refetch={refetch}
                                        appointments={appointmentData.customer.appointments || []}
                                        targetAppointment={appointmentData}
                                        matchSm={matchSm}
                                    />
                                </WidgetCardWrapper>
                            </Grid>
                        </Grid>
                    </WidgetWrapper>
                </WidgetThemeProvider>
            )}
            {isLoading && <Loader />}
        </>
    );
};

export default Widget;
