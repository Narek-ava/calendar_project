/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { Button, CardActions, CardContent, Divider, FormControl, FormHelperText, Grid, Typography } from '@material-ui/core';
import InputLabel from 'ui-component/extended/Form/InputLabel';

// project imports
import { ILocation, ILocationPayload, ISchedule } from '../../models/ILocation';
import serviceAPI from '../../services/ServiceService';
import employeeAPI from '../../services/EmployeeService';

import OptimizedTextField from '../../ui-component/optimized-text-fields/OptimizedTextField';
import OptimizedMaskedTextField from '../../ui-component/optimized-text-fields/OptimizedMaskedTextField';
import OptimizedSchedule from '../../ui-component/optimized-text-fields/schedule/OptimizedSchedule';
import { addressScheme } from '../company/CompanyForm';
import useAuth from '../../hooks/useAuth';
import { isAllowEditLocation } from '../../utils/roles/functions';
import { default_time_zone } from '../../utils/functions/time-zones-helpers';
import TimeZoneSelect from '../../ui-component/time-zone-select/TimeZoneSelect';
import MapboxAddress from '../../ui-component/MapboxAddress';
import LabelWithInfo from '../../ui-component/LabelWithInfo';
import InfoTooltip from '../../ui-component/InfoTooltip';
import TwilioPhone from './TwilioPhone';
import locationAPI from '../../services/LocationService';
import useShowSnackbar from '../../hooks/useShowSnackbar';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '../../hooks/redux';
import { SnackBarTypes } from '../../store/snackbarReducer';

interface LocationFormProps {
    location: ILocation;
    save: (location: ILocationPayload) => any;
    isCreate?: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({ location, save, isCreate }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { showSnackbar } = useShowSnackbar();

    const { handleSubmit, values, touched, errors, setFieldError, handleBlur, handleChange, setFieldValue, setFieldTouched } = useFormik({
        enableReinitialize: true,
        initialValues: {
            ...location,
            phone: location.phone || '',
            isModeChangeHidden: !isCreate,
            address: {
                ...location.address,
                l1: !isCreate && !location.address.l1 && location.address.address ? location.address.address : location.address.l1 || '',
                l2: location.address.l2 || ''
            },
            time_zone: location.time_zone || default_time_zone
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().max(255, 'The limit is 255 symbols').required('Name is required'),
            phone: Yup.string().required('Phone is required').min(10, 'Phone number is not valid'),
            time_zone: Yup.string(),
            address: addressScheme,
            schedule: Yup.mixed()
        }),
        onSubmit: (formData) => {
            save(formData)
                .unwrap()
                .then(() => {
                    showSnackbar({
                        alertSeverity: SnackBarTypes.Success,
                        message: `Location ${isCreate ? 'created' : 'updated'}`
                    });
                    navigate('/location', { replace: true });
                    dispatch(locationAPI.util.invalidateTags(['Location']));
                    dispatch(employeeAPI.util.invalidateTags(['Employee']));
                    dispatch(serviceAPI.util.invalidateTags(['Service']));
                })
                .catch((e: { data: string; errors: any }) => {
                    if (e.errors) {
                        Object.keys(e.errors).forEach((key) => {
                            setFieldError(key, e.errors[key]);
                        });
                    }

                    showSnackbar({
                        alertSeverity: SnackBarTypes.Error,
                        message: e.data || `Location wasn't ${isCreate ? 'created' : 'updated'}`
                    });
                });
        }
    });

    const services = serviceAPI.useFetchAllServicesQuery({});
    const employees = employeeAPI.useFetchAllEmployeesQuery({});

    return (
        <>
            {!services.isFetching && !employees.isFetching && (
                <form noValidate onSubmit={handleSubmit}>
                    <CardContent sx={{ px: { xs: 0, sm: 2 }, pt: { xs: 0, sm: 2 } }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                        <InputLabel horizontal>Name</InputLabel>
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.name && errors.name)}>
                                            <OptimizedTextField
                                                placeholder="Name"
                                                id="name"
                                                name="name"
                                                value={values.name}
                                                onChange={(event) => {
                                                    handleChange(event);
                                                    setFieldTouched('name', false);
                                                }}
                                                onBlur={handleBlur}
                                            />
                                            {touched.name && errors.name && (
                                                <FormHelperText error id="standard-weight-helper-text--register">
                                                    {' '}
                                                    {errors.name}{' '}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                        <InputLabel horizontal>Phone</InputLabel>
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.phone && errors.phone)}>
                                            <OptimizedMaskedTextField
                                                id="phone"
                                                name="phone"
                                                value={values.phone}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    setFieldValue('phone', e.target.value);
                                                    setFieldTouched('phone', false);
                                                }}
                                                onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                                    handleBlur(e);
                                                    if (!e.target.value) {
                                                        setFieldTouched('phone', false);
                                                    }
                                                }}
                                                placeholder="Phone"
                                            />
                                            {touched.phone && errors.phone && (
                                                <FormHelperText error id="standard-weight-helper-text--register">
                                                    {' '}
                                                    {errors.phone}{' '}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                        <LabelWithInfo
                                            label="Time Zone"
                                            infoText="Appointments will be created and managed in location time zone."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.time_zone && errors.time_zone)}>
                                            <TimeZoneSelect
                                                selectValue={values.time_zone}
                                                onChange={(zone) => {
                                                    setFieldValue('time_zone', zone);
                                                }}
                                                showTimezoneOffset
                                            />
                                            {touched?.time_zone && errors?.time_zone && (
                                                <FormHelperText error id="-helper-text--advance-time">
                                                    {' '}
                                                    {errors.time_zone}{' '}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {user?.currentCompany.is_twilio_enabled && (
                                <>
                                    <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                        <LabelWithInfo
                                            label="Twilio Phone"
                                            infoText="This number is used to send SMS notifications through your Twillio account. Fill in Twillio details in the Integrations section of the settings page for SMS notifications to work."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <TwilioPhone location={location} value={values.twilio_phone} setFieldValue={setFieldValue} />
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <Typography sx={{ mt: 2 }} color="secondary" fontSize="medium" fontWeight="bold">
                                    Address Details:
                                </Typography>
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <Divider />
                            </Grid>

                            <MapboxAddress
                                touched={touched}
                                errors={errors}
                                values={values}
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                setFieldValue={setFieldValue}
                            />

                            <Grid item xs={12} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <Typography
                                    sx={{ mt: 2 }}
                                    color="secondary"
                                    fontSize="medium"
                                    fontWeight="bold"
                                    alignItems="center"
                                    display="flex"
                                >
                                    Schedule:
                                    <InfoTooltip text="Customers will not be able to book outside of location open hours, but you can override that for individual staff members." />
                                </Typography>
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }} />
                            <Grid item xs={12} sm={9} lg={8} sx={{ overflow: 'auto' }}>
                                <OptimizedSchedule
                                    schedules={values.schedule}
                                    onChange={(schedules: ISchedule[]) => {
                                        setFieldValue('schedule', schedules);
                                    }}
                                    errors={errors}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <Divider />
                    {user && isAllowEditLocation(user, location) && (
                        <CardActions sx={{ px: { xs: 0, sm: 2 } }}>
                            <Grid container spacing={1}>
                                <Grid item>
                                    <Button type="submit" variant="contained" color="primary">
                                        Save
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardActions>
                    )}
                </form>
            )}
        </>
    );
};

export default LocationForm;
