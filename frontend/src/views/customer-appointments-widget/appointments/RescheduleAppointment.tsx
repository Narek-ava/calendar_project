import { useEffect, useState, useCallback } from 'react';

//  third-party
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { date } from 'yup';
import { useFormik } from 'formik';
import moment, { Moment } from 'moment-timezone';

// mui
import { Box, FormControl, Grid, Stack, Typography } from '@mui/material';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MomentAdapter from '@mui/lab/AdapterMoment';
import StaticDatePicker from '@mui/lab/StaticDatePicker';
import { makeStyles } from '@material-ui/styles';
import TextField from '@mui/material/TextField';
import { Theme } from '@material-ui/core/styles';

// project-imports
import { IAppointment, WidgetAppointmentPayload } from '../../../models/IAppointment';
import Transitions from '../../../ui-component/extended/Transitions';
import SubCard from '../../../ui-component/cards/SubCard';
import AnimateButton from '../../../ui-component/extended/AnimateButton';
import { getWidgetMaxBookingDate } from '../../../store/constant';
import { GetTimeSlotsParams, TimeSlot } from '../../scheduling-widget/widget-wizard/types';
import appointmentWidgetAPI from '../../../services/WidgetService';
import { useAppDispatch } from '../../../hooks/redux';
import { SnackBarTypes } from '../../../store/snackbarReducer';
import { SNACKBAR_OPEN } from '../../../store/actions';
import { CircularProgress } from '@material-ui/core';
import { axiosServices } from '../../../utils/axios';
import { AppointmentsProps } from './AppointmentsWrapper';
import StyledGreenButton from '../../scheduling-widget/components/StyledGreenButton';
import useShouldDisableDate from '../../../hooks/useShouldDisableDate';
import CBModal from '../../../ui-component/CBModal';
import Slots from '../../scheduling-widget/components/Slots';
import TimezoneSelector from '../../scheduling-widget/components/TimezoneSelector';

interface RescheduleAppointmentProps {
    appointment: IAppointment;
    stopReschedule: () => void;
    matchSm: boolean;
    refetch: AppointmentsProps['refetch'];
}

const validationSchema = Yup.object({
    date: date().required('Date is required!'),
    slot: date().nullable()
});

const useStyles = makeStyles((theme: Theme) => ({
    datepicker: {
        '& > div > div > div': {
            maxWidth: '500px',
            width: '100%'
        },
        '& .MuiCalendarPicker-root': {
            maxWidth: '700px',
            width: '100%',
            '& > div:first-of-type': {
                marginTop: 0,
                padding: 0,
                justifyContent: 'flex-end'
            }
        },
        // Days of Week wrapper selector
        '& .MuiCalendarPicker-viewTransitionContainer > div > div': {
            justifyContent: 'space-between'
        },
        '& .PrivatePickersSlideTransition-root': {
            minHeight: '230px'
        },
        '& .PrivatePickersSlideTransition-root > div > div[role="row"]': {
            justifyContent: 'space-between'
        },
        '& .MuiCalendarPicker-viewTransitionContainer': {
            [theme.breakpoints.down('md')]: {
                marginLeft: '-12px'
            }
        },
        [theme.breakpoints.down('md')]: {
            '& .MuiCalendarPicker-viewTransitionContainer': {
                // marginLeft: '-15px'
            }
        },

        '& .MuiButtonBase-root.Mui-selected': {
            backgroundColor: theme.palette.widget.green
        },

        '@media(max-width: 600px)': {
            '& > div': {
                minWidth: 'auto !important'
            },

            '& .MuiPickersDay-root': {
                width: '34px',
                height: '34px'
            },

            '& .PrivatePickersSlideTransition-root': {
                minHeight: '190px'
            }
        }
    }
}));

const RescheduleAppointment = ({ appointment, stopReschedule, matchSm, refetch }: RescheduleAppointmentProps) => {
    const dispatch = useAppDispatch();
    const { company_slug } = useParams();
    const classes = useStyles();
    const { shouldDisableDate } = useShouldDisableDate();

    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [dateArg, setDateArg] = useState({} as GetTimeSlotsParams);
    const [skip, setSkip] = useState(true);
    // if picker dates touched by user - it will stop automatic switch + 1 day if no slots for today
    const [dateTouched, setDateTouched] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
    const [newSlot, setNewSlot] = useState<TimeSlot | null>(null);
    const [timezone, setTimezone] = useState<string>('UTC');
    const { data: slots } = appointmentWidgetAPI.useGetTimeSlotsQuery(dateArg, { skip });
    const { values, handleSubmit, touched, errors, setErrors, setFieldValue } = useFormik({
        initialValues: {
            date: moment().format(),
            slot: null
        },
        validationSchema,
        onSubmit: () => {
            if (selectedSlot) {
                // setDateData(selectedSlot);
                // handleNext();
            } else {
                setErrors({ slot: 'Error' });
            }
        }
    });

    const showSnackbar = ({ alertSeverity, message }: { alertSeverity: SnackBarTypes; message: string }) => {
        dispatch({
            type: SNACKBAR_OPEN,
            open: true,
            message,
            variant: 'alert',
            alertSeverity,
            anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
    };

    useEffect(() => {
        setTimezone(appointment?.time_zone || appointment.location.time_zone || 'UTC');
    }, [appointment]);

    // automatic switch +1 day if no slots for today
    useEffect(() => {
        const { location } = appointment;
        if (!dateTouched && location && slots && (slots.length === 0 || slots.filter((slot) => !slot.occupied).length === 0)) {
            setFieldValue('date', moment.utc(values.date).add(1, 'day').tz(location.time_zone).format(), true);
        }
        if (slots && slots.filter((slot) => !slot.occupied).length !== 0) {
            setIsLoadingData(false);
        }
    }, [slots, appointment]);

    useEffect(() => {
        if (appointment) {
            moment.tz.setDefault(appointment.location.time_zone);
        }
    }, [appointment]);

    // creates a slots request, based on the appointment data
    useEffect(() => {
        if (appointment && company_slug) {
            const params: GetTimeSlotsParams = {
                slug: company_slug,
                date: moment(values.date).format('DD-MM-YYYY'),
                service: appointment.service.id,
                location: appointment.location.id,
                employee: appointment.employee.id
            };
            setDateArg(params);
            setSkip(false);
        }
    }, [appointment, values.date]);

    const changeDateConfirm = (slot: TimeSlot) => {
        setOpenConfirmModal(true);
        setNewSlot(slot);
    };

    const handleUpdateEvent = (slot: TimeSlot) => {
        if (company_slug) {
            const data = {
                service_id: appointment.service.id,
                employee_id: appointment.employee.id,
                location_id: appointment.location.id,
                start_at: slot.start_at,
                end_at: slot.end_at,
                time_zone: timezone
            } as WidgetAppointmentPayload;
            axiosServices
                .put(`/public/company/${company_slug}/appointment/${appointment.uuid}`, { ...data })
                .then((res) => {
                    showSnackbar({
                        message: 'Appointment updated',
                        alertSeverity: SnackBarTypes.Success
                    });
                    dispatch(appointmentWidgetAPI.util.invalidateTags(['Widget Slots']));
                    dispatch(appointmentWidgetAPI.util.invalidateTags(['AppointmentWidget']));
                    stopReschedule();
                    setNewSlot(null);
                })
                .catch((e: Error) => {
                    setNewSlot(null);
                    showSnackbar({
                        message: e.message,
                        alertSeverity: SnackBarTypes.Error
                    });
                    if (e.message === 'Rescheduling interval is over for the service of this appointment') {
                        stopReschedule();
                        refetch();
                    }
                });
        }
    };

    const closeConfirmModal = useCallback(() => {
        setOpenConfirmModal(false);
    }, [setOpenConfirmModal]);

    const handleSelectSlot = useCallback(() => {
        if (!newSlot) return;

        setOpenConfirmModal(false);
        setFieldValue('slot', moment(newSlot.start_at).toDate());
        setSelectedSlot(newSlot);
        handleUpdateEvent(newSlot);
    }, [setFieldValue, setSelectedSlot, newSlot, setNewSlot, setOpenConfirmModal, handleUpdateEvent]);

    const disableDate = useCallback(
        (pickerDate) => shouldDisableDate(pickerDate, appointment.employee, appointment.location, appointment.service),
        [appointment, shouldDisableDate]
    );

    return (
        <Transitions type="slide" direction="left" in>
            <form onSubmit={handleSubmit}>
                <SubCard
                    sx={{
                        border: 'none',
                        boxShadow: 0,
                        '&:hover': {
                            border: 'none',
                            boxShadow: 0
                        }
                    }}
                    title={<Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>Reschedule Appointment</Typography>}
                    secondary={
                        <AnimateButton>
                            <StyledGreenButton
                                color="secondary"
                                variant="contained"
                                onClick={stopReschedule}
                                size={matchSm ? 'small' : undefined}
                            >
                                Return
                            </StyledGreenButton>
                        </AnimateButton>
                    }
                    contentSX={{ border: matchSm ? 'none' : undefined, boxShadow: matchSm ? 0 : undefined }}
                >
                    <Grid container spacing={{ xs: 1, sm: 3 }}>
                        <Grid item xs={12}>
                            <Stack direction={matchSm ? 'column' : 'row'} alignItems={matchSm ? 'flex-start' : 'center'} spacing={1}>
                                <Typography>Current Appointment Date:</Typography>
                                <Typography sx={{ fontWeight: 'bold' }}>
                                    {`${moment(appointment.start_at).tz(timezone).format('MM/DD/YYYY hh:mm A')} (${moment
                                        .tz(timezone)
                                        .format('z')})`}
                                </Typography>
                            </Stack>
                        </Grid>
                        {!isLoadingData && (
                            <>
                                <Grid item xs={12}>
                                    <FormControl fullWidth error={Boolean(touched.date && errors.date)}>
                                        <Box className={classes.datepicker}>
                                            <LocalizationProvider dateAdapter={MomentAdapter}>
                                                <StaticDatePicker<Moment>
                                                    displayStaticWrapperAs="desktop"
                                                    openTo="day"
                                                    minDate={moment()}
                                                    maxDate={getWidgetMaxBookingDate(
                                                        appointment.company?.settings.widget.max_advance_booking || 0
                                                    )}
                                                    value={moment(values.date).tz(appointment.location.time_zone)}
                                                    onChange={(newValue) => {
                                                        if (!dateTouched) {
                                                            setDateTouched(true);
                                                        }
                                                        if (newValue) {
                                                            setFieldValue(
                                                                'date',
                                                                newValue.tz(appointment.location.time_zone).format(),
                                                                true
                                                            );
                                                            setSelectedSlot(null);
                                                        }
                                                    }}
                                                    views={['day']}
                                                    renderInput={(params) => <TextField {...params} />}
                                                    shouldDisableDate={(pickerDate) => disableDate(pickerDate)}
                                                />
                                            </LocalizationProvider>
                                        </Box>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} p={1}>
                                    <TimezoneSelector timezone={timezone} setTimezone={setTimezone} />
                                </Grid>

                                {values.date && (
                                    <Grid item xs={12} display="flex" flexWrap="wrap" justifyContent="center">
                                        <Slots
                                            slots={slots || []}
                                            locationTimezone={appointment.location.time_zone}
                                            timezone={timezone}
                                            onSlotClick={changeDateConfirm}
                                            selectedSlot={selectedSlot}
                                        />
                                    </Grid>
                                )}
                            </>
                        )}
                        {isLoadingData && (
                            <Grid item xs={12}>
                                <Stack justifyContent="center" direction="row" sx={{ mx: 'auto', mt: 1, width: 200 }}>
                                    <CircularProgress />
                                </Stack>
                            </Grid>
                        )}
                    </Grid>
                </SubCard>
            </form>
            <CBModal
                open={openConfirmModal && !!newSlot}
                onClose={closeConfirmModal}
                okButtonText="Confirm"
                onClickOk={handleSelectSlot}
                closeButtonText="Cancel"
                maxWidth="md"
                severity="warning"
            >{`Please confirm new appointment date: ${moment(newSlot?.start_at).tz(timezone).format('MM/DD/YYYY hh:mm A')} (${moment
                .tz(timezone)
                .format('z')})`}</CBModal>
        </Transitions>
    );
};

export default RescheduleAppointment;
