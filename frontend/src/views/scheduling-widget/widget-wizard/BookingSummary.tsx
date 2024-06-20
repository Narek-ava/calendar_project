import { useMemo } from 'react';
import { TimeSlot, WidgetSummaryProps } from './types';
import { Grid, useMediaQuery, Box, Typography } from '@material-ui/core';
import WidgetNav from './WidgetNav';
import { styled, Theme } from '@material-ui/core/styles';
import moment from 'moment';
import FormattedPhoneNumber from '../../../ui-component/FormattedPhoneNumber';
import Alarm from '@material-ui/icons/Alarm';
import LocationOn from '@material-ui/icons/LocationOn';
import Person from '@material-ui/icons/Person';
import Event from '@material-ui/icons/Event';
import PersonOutlineOutlined from '@material-ui/icons/PersonOutlineOutlined';
import MailOutlined from '@material-ui/icons/MailOutlined';
import Smartphone from '@material-ui/icons/Smartphone';
import NoteOutlined from '@material-ui/icons/NoteOutlined';
import ServiceCost from '../components/ServiceCost';
import ImageTitle from '../components/ImageTitle';
import useSteps from './hooks/useSteps';

const StyledSummary = styled(Box)(({ theme }) => ({
    borderRadius: '5px',
    overflow: 'hidden',
    color: theme.palette.widget.text,
    backgroundColor: theme.palette.grey[50],

    '& .summary-info, & .user-info': {
        '& .MuiGrid-root.MuiGrid-item': {
            display: 'flex',
            alignItems: 'center',

            '& .MuiTypography-root': {
                fontSize: '16px',

                '@media(max-width: 600px)': {
                    fontSize: '15px'
                }
            },

            '& .MuiSvgIcon-root': {
                width: '22px',
                marginRight: '8px'
            }
        }
    },

    '& .summary-info': {
        background: theme.palette.grey[100],
        borderRadius: '0 0 5px 5px',

        '& .info-row': {
            cursor: 'pointer',
            padding: theme.spacing(0.5, 2),
            transition: 'background-color 0.3s',

            '&:hover': {
                background: theme.palette.grey[300]
            },

            '&:first-of-type': {
                paddingTop: theme.spacing(1)
            },

            '&:last-child': {
                paddingBottom: theme.spacing(1)
            }
        },

        '& .MuiGrid-root.MuiGrid-item .service-name': {
            '& .MuiTypography-root': {
                fontWeight: 700,
                fontSize: '22px'
            }
        }
    },

    '& .user-info': {
        padding: theme.spacing(1, 2),
        cursor: 'pointer',
        transition: 'background-color 0.3s',

        '&:hover': {
            backgroundColor: theme.palette.grey[300]
        },

        '& .user-info-title': {
            fontSize: '18px',
            fontWeight: 700,
            margin: theme.spacing(0.5, 0)
        },

        '& .info-row': {
            margin: theme.spacing(0.5, 0),

            '@media(max-width: 600px)': {
                margin: 0
            }
        }
    }
}));

const BookingSummary = ({
    isInProgress,
    step,
    stepsProgress,
    setActiveStep,
    serviceData,
    locationData,
    providerData,
    dateData,
    userData,
    attachments,
    setAttachments,
    handleBack,
    resetWidget,
    rawResetWidget,
    submitBooking,
    submitted,
    attachmentsIdsToDelete,
    matchDownMd,
    prepopulatedLocation,
    prepopulatedProvider,
    hideNav,
    company,
    timezone
}: WidgetSummaryProps) => {
    const { steps } = useSteps();
    const isMobile = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('sm'));

    const handleClickStep = (stepIndex: number) => {
        if (!submitted && (stepsProgress.includes(stepIndex - 1) || stepIndex < step)) {
            setActiveStep(stepIndex);
        }
    };

    const provider = useMemo(() => providerData || prepopulatedProvider || null, [prepopulatedProvider, providerData]);

    const getProviderName = (slot: TimeSlot | null) => {
        if (slot && step > steps.date.index) {
            return `${slot.employee.user.firstname} ${slot.employee.user.lastname}`;
        }
        if (provider) {
            return `${provider.user?.firstname || 'Any'} ${provider.user?.lastname || 'Provider'}`;
        }
        return 'Select Provider';
    };

    const location = useMemo(() => locationData || prepopulatedLocation || null, [locationData, prepopulatedLocation]);

    const summaryImageUrl = useMemo(
        () => serviceData?.images[serviceData.images.length - 1]?.url || company?.logo_rectangular?.url || company?.logo?.url,
        [serviceData]
    );

    const dateText = useMemo(() => {
        if (!dateData) return 'Select Appointment Date & Time';

        return `${moment(dateData.start_at).tz(timezone).format('MMMM Do YYYY, hh:mm A')} (${moment.tz(timezone).format('z')})`;
    }, [dateData, timezone]);

    return (
        <>
            <StyledSummary sx={{ display: { xs: step === steps.final.index ? 'inherit' : 'none', sm: 'block' } }}>
                <ImageTitle title="Booking Summary" imageUrl={summaryImageUrl} />
                <Grid container className="summary-info" id="summary-info">
                    <Grid item xs={12} onClick={() => handleClickStep(steps.service.index)} className="info-row">
                        <Grid container justifyContent="space-between">
                            <Grid item className="service-name">
                                <Typography id="service-name">{serviceData ? serviceData.name : 'Select Service'}</Typography>
                            </Grid>
                            {serviceData && (
                                <>
                                    <Grid item onClick={() => handleClickStep(steps.service.index)}>
                                        <ServiceCost service={serviceData} />
                                    </Grid>
                                    <Grid item xs={12} onClick={() => handleClickStep(steps.service.index)}>
                                        <Alarm />
                                        <Typography id="service-duration">{serviceData ? `${serviceData.duration}m` : ''}</Typography>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Grid>
                    {!serviceData?.is_virtual && (
                        <Grid item xs={12} onClick={() => handleClickStep(steps.location.index)} className="info-row">
                            <LocationOn />
                            {location ? (
                                <Typography id="summary-location-data">
                                    {location.name}
                                    <br />
                                    {location.address.address}
                                </Typography>
                            ) : (
                                <Typography id="summary-location-data">Select Location</Typography>
                            )}
                        </Grid>
                    )}
                    <Grid item xs={12} onClick={() => handleClickStep(steps.provider.index)} className="info-row">
                        <Person />
                        <Typography id="summary-provider-name">{getProviderName(dateData)}</Typography>
                    </Grid>
                    <Grid item xs={12} onClick={() => handleClickStep(steps.date.index)} className="info-row">
                        <Event />
                        <Typography id="summary-appointment-date">{dateText}</Typography>
                    </Grid>
                </Grid>
                {userData && (
                    <Grid container className="user-info" id="user-info" onClick={() => handleClickStep(steps.user.index)}>
                        <Typography className="user-info-title">Appointments for</Typography>
                        <Grid item xs={12} className="info-row">
                            <PersonOutlineOutlined />
                            <Typography>{userData ? `${userData.firstname} ${userData.lastname}` : 'Your Name'}</Typography>
                        </Grid>
                        {userData?.email && (
                            <Grid item xs={12} className="info-row">
                                <MailOutlined />
                                <Typography>{userData.email}</Typography>
                            </Grid>
                        )}
                        {userData?.phone && (
                            <Grid item xs={12} className="info-row">
                                <Smartphone />
                                <Typography>
                                    <FormattedPhoneNumber phone={userData.phone} />
                                </Typography>
                            </Grid>
                        )}
                        {userData?.note?.trim() && (
                            <Grid item xs={12} className="info-row">
                                <NoteOutlined />
                                <Typography>{`Note: ${userData.note}`}</Typography>
                            </Grid>
                        )}
                    </Grid>
                )}
            </StyledSummary>
            <WidgetNav
                isMobile={isMobile}
                isInProgress={!!serviceData && step > 0}
                step={step}
                handleBack={handleBack}
                stepsProgress={stepsProgress}
                resetWidget={resetWidget}
                submitted={submitted}
                hide={hideNav}
            />
        </>
    );
};

export default BookingSummary;
