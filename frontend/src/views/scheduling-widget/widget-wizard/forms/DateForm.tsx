import { useEffect, useRef, useState, useCallback } from 'react';

// third-party
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { date } from 'yup';
import moment from 'moment';
import { Typography } from '@mui/material';
import { Moment } from 'moment-timezone';

// material-ui
import { FormControl, Grid, Box, Theme, Stack, CircularProgress } from '@material-ui/core';
import TextField from '@mui/material/TextField';
import MomentAdapter from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import StaticDatePicker from '@mui/lab/StaticDatePicker';
import Transitions from '../../../../ui-component/extended/Transitions';
import { makeStyles } from '@material-ui/styles';

// project imports
import { IEmployee } from '../../../../models/IEmployee';
import { DateFormProps, GetTimeSlotsParams, TimeSlot, WizardStates } from '../types';
import StepTitle from '../../components/StepTitle';
import appointmentWidgetAPI from '../../../../services/WidgetService';
import { getWidgetMaxBookingDate } from '../../../../store/constant';
import useShouldDisableDate from '../../../../hooks/useShouldDisableDate';
import TimezoneSelector from '../../components/TimezoneSelector';
import Slots from '../../components/Slots';

const useStyles = makeStyles((theme: Theme) => ({
    datepicker: {
        '& div[role=presentation]': {
            cursor: 'default'
        },
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
                justifyContent: 'flex-end',
                [theme.breakpoints.down('sm')]: {
                    margin: '0 16px'
                }
            },
            '& > div:last-of-type > div:first-of-type': {
                justifyContent: 'space-between'
                // [theme.breakpoints.down('sm')]: {
                //     margin: '0 16px'
                // }
            }
        },
        // Days of Week wrapper selector
        '& .MuiCalendarPicker-viewTransitionContainer > div > div': {
            justifyContent: 'space-between'
        },
        '& .PrivatePickersSlideTransition-root': {
            minHeight: '200px'
        },
        '& .PrivatePickersSlideTransition-root > div > div[role="row"]': {
            justifyContent: 'space-between'
        },

        '& .MuiButtonBase-root.Mui-selected': {
            backgroundColor: theme.palette.widget.green
        }
    }
}));

const getInitialValues = (dateArg: WizardStates['dateData']) => {
    const newDate = {
        date: moment().format(),
        slot: null
    };

    if (dateArg) {
        return {
            date: dateArg.start_at,
            slot: dateArg
        };
    }

    return newDate;
};

const validationSchema = Yup.object({
    date: date().required('Date is required!'),
    slot: date().nullable()
});

const DateForm = ({
    step,
    addProgress,
    company,
    serviceData,
    locationData,
    providerData,
    setProviderData,
    dateData,
    setDateData,
    handleNext,
    errorIndex,
    isAnyProvider,
    setIsAnyProvider,
    handleBack,
    submitted,
    timezone,
    setTimezone
}: DateFormProps) => {
    const classes = useStyles();
    const { shouldDisableDate } = useShouldDisableDate();

    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [dateArg, setDateArg] = useState({} as GetTimeSlotsParams);
    const [skip, setSkip] = useState(true);
    const [dateTouched, setDateTouched] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const dayIncrement = useRef(1);
    const { data: slots, isLoading } = appointmentWidgetAPI.useGetTimeSlotsQuery(dateArg, { skip, refetchOnMountOrArgChange: true });
    const { values, handleSubmit, touched, errors, setErrors, setFieldValue } = useFormik({
        initialValues: getInitialValues(dateData),
        validationSchema,
        onSubmit: () => {
            if (selectedSlot) {
                setDateData(selectedSlot);
                handleNext();
            } else {
                setErrors({ slot: 'Error' });
            }
        }
    });

    useEffect(() => {
        if (locationData) {
            moment.tz.setDefault(locationData.time_zone);
        }
    }, [locationData]);

    useEffect(() => {
        if (serviceData && locationData && providerData) {
            const params: GetTimeSlotsParams = {
                slug: company.slug,
                date: moment(values.date).format('DD-MM-YYYY'),
                service: serviceData && serviceData.id,
                location: locationData?.id,
                ...(!isAnyProvider && Object.keys(providerData).length > 0 && { employee: providerData.id })
            };
            setDateArg(params);
            if (skip) {
                setSkip(false);
            }
        }
    }, [serviceData, locationData, values.date]);

    useEffect(() => {
        if (!dateTouched && locationData && slots && (slots.length === 0 || slots.filter((slot) => !slot.occupied).length === 0)) {
            if (dayIncrement.current > company.settings.widget.max_advance_booking) {
                setIsLoadingData(false);
            }
            setFieldValue('date', moment(values.date).add(1, 'day').tz(locationData.time_zone).format(), true);
            dayIncrement.current += 1;
        }
        if (slots && slots.filter((slot) => !slot.occupied).length !== 0) {
            setIsLoadingData(false);
        }
    }, [slots, locationData, company]);

    const chooseSlot = (slot: TimeSlot) => {
        handleSelectSlot(slot);
        if (locationData) {
            setDateData(slot);
        }

        if (providerData && !Object.keys(providerData).length) {
            setProviderData(slot.employee as IEmployee);
        }
        handleNext();
        addProgress(step);
    };

    const handleSelectSlot = (slot: TimeSlot) => {
        setFieldValue('slot', moment(slot.start_at).toDate());
        setSelectedSlot(slot);
    };

    useEffect(() => {
        if (dateData && slots) {
            const targetSlot = slots.find((elem) => moment(elem.start_at).isSame(moment(dateData.start_at)));
            if (targetSlot) {
                handleSelectSlot(targetSlot);
            }
        }
    }, [dateData, slots, step]);

    const disableDate = useCallback((pickerDate) => shouldDisableDate(pickerDate, providerData, locationData, serviceData), [
        locationData,
        providerData,
        serviceData,
        shouldDisableDate
    ]);

    return (
        <Transitions type="fade" in>
            <StepTitle error={!!errors.slot} title="Select Date & Time" step={step} handleBack={handleBack} submitted={submitted} />
            {locationData && !isLoadingData && !isLoading && (
                <form onSubmit={handleSubmit} id={`widget-form-${step}`}>
                    <Grid container direction="column">
                        <Grid item xs>
                            <FormControl fullWidth error={Boolean(touched.date && errors.date)}>
                                <Box className={classes.datepicker} id="calendar-date-picker">
                                    <LocalizationProvider dateAdapter={MomentAdapter}>
                                        <StaticDatePicker<Moment>
                                            displayStaticWrapperAs="desktop"
                                            openTo="day"
                                            minDate={moment()}
                                            maxDate={getWidgetMaxBookingDate(company.settings.widget.max_advance_booking)}
                                            value={moment(values.date).tz(locationData.time_zone)}
                                            onChange={(newValue) => {
                                                if (!dateTouched) {
                                                    setDateTouched(true);
                                                }
                                                // if (isLoadingData) {
                                                //     setIsLoadingData(false);
                                                // }
                                                setFieldValue('date', moment(newValue).tz(locationData.time_zone).format(), true);
                                                setSelectedSlot(null);
                                            }}
                                            views={['day']}
                                            renderInput={(params) => <TextField {...params} />}
                                            shouldDisableDate={(pickerDate) => disableDate(pickerDate)}
                                        />
                                    </LocalizationProvider>
                                </Box>
                            </FormControl>
                        </Grid>
                        <Grid item p={1}>
                            <TimezoneSelector timezone={timezone} setTimezone={setTimezone} />
                        </Grid>
                        <Grid item>
                            {values.date && (
                                <Slots
                                    slots={slots || []}
                                    locationTimezone={locationData?.time_zone || 'UTC'}
                                    timezone={timezone}
                                    onSlotClick={chooseSlot}
                                    selectedSlot={selectedSlot}
                                />
                            )}
                        </Grid>
                    </Grid>
                </form>
            )}
            {(isLoadingData || isLoading) && (
                <Grid item xs={12}>
                    <Stack justifyContent="center" direction="row" sx={{ mx: 'auto', mt: 1, width: 200 }}>
                        <CircularProgress />
                    </Stack>
                </Grid>
            )}
            {!locationData && <Typography>Select Location first</Typography>}
        </Transitions>
    );
};

export default DateForm;
