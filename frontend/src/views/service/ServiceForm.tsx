import React, { useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { map } from 'lodash';
import { IconCurrencyDollar } from '@tabler/icons';

// material-ui
import { Button, CardActions, CardContent, Divider, FormHelperText, Grid, InputAdornment } from '@material-ui/core';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { FormControl, MenuItem, Select, useMediaQuery } from '@mui/material';

// project imports
import InputLabel from 'ui-component/extended/Form/InputLabel';
import { IService, PaymentType, PaymentTypeNames } from 'models/IService';
import serviceCategoryAPI from 'services/ServiceCategoryService';
import locationAPI from 'services/LocationService';
import { ILocation } from 'models/ILocation';
import employeeAPI from 'services/EmployeeService';
import { IEmployee, UserRole } from 'models/IEmployee';
import DurationAutocomplete from './duration_autocomplete/DurationAutocomplete';
import OptimizedTextField from '../../ui-component/optimized-text-fields/OptimizedTextField';
import { useAppDispatch } from '../../hooks/redux';
import ImageUploader from 'ui-component/form/ImageUploader';
import WeekDaysSchedule from '../../ui-component/WeekDaysSchedule';
import { initServiceSchedule, min_service_reschedule_interval } from '../../store/constant';
import TwoColumnsSwitch from '../../ui-component/TwoColumnsSwitch';
import EmployeeSelect from '../../ui-component/EmployeeSelect';
import LabelWithInfo from '../../ui-component/LabelWithInfo';
import InfoTooltip from '../../ui-component/InfoTooltip';

interface ServiceFormProps {
    service: IService;
    update: (service: IService) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, update }) => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const schedule = service.schedule || initServiceSchedule;
    const dispatch = useAppDispatch();
    // get the last one of service images
    const initialPreview = service.images.length > 0 ? service.images[service.images.length - 1] : null;
    const { handleSubmit, values, touched, errors, handleBlur, handleChange, setFieldValue, setFieldTouched } = useFormik({
        enableReinitialize: true,
        validateOnBlur: true,
        initialValues: {
            ...service,
            schedule: [...schedule].sort((a, b) => (a.id === 0 && b.id === 0 ? 0 : a.id - b.id)),
            is_reschedule_enabled: service.is_reschedule_enabled ?? true,
            is_waiver_enabled: service.is_waiver_enabled ?? false,
            rescheduling_interval: service.rescheduling_interval ?? min_service_reschedule_interval,
            is_virtual: service.is_virtual ?? false,
            is_private: service.is_private ?? false
        },
        validationSchema: Yup.object().shape({
            // service_category_id: Yup.number().required('Category is required'),
            name: Yup.string().max(255).required('Name is required'),
            duration: Yup.number()
                .required('Duration is required')
                .min(10, 'Duration must be greater than or equal to 10')
                .max(600, 'Duration must be less than or equal to 600')
                .typeError('Must be a number type'),
            interval: Yup.number()
                .required('Post-Appointment Buffer is required')
                .max(120, 'Post-Appointment Buffer must be less than or equal to 120')
                .typeError('Must be a number type'),
            payment_type: Yup.string().required('Payment type is required'),
            price: Yup.number().when('payment_type', {
                is: (payment_type: string) => payment_type === PaymentType.Paid || payment_type === PaymentType.Prepaid,
                then: Yup.number()
                    .required('Service price is required')
                    .max(9999, 'Maximum Service price is 9999')
                    .typeError('Service price is required'),
                otherwise: Yup.number().nullable()
            }),
            prepay: Yup.number().when('payment_type', {
                is: (payment_type: string) => payment_type === PaymentType.Prepaid,
                then: Yup.number()
                    .required('Deposit amount is required')
                    .max(9999, 'Maximum deposit amount is 9999')
                    .typeError('Deposit amount is required'),
                otherwise: Yup.number().nullable()
            }),
            is_reschedule_enabled: Yup.boolean(),
            rescheduling_interval: Yup.number().when('is_reschedule_enabled', {
                is: true,
                then: Yup.number()
                    .required('Service reschedule buffer is required')
                    .typeError('Must be a number type')
                    .min(min_service_reschedule_interval, `Min service reschedule buffer is ${min_service_reschedule_interval} minutes`)
                    .max(2880, 'Max service reschedule buffer is 2880 minutes'),
                otherwise: Yup.number().nullable()
            }),
            advance_booking_buffer: Yup.number()
                .typeError('Must be a number type')
                .min(0, 'Minimum advance booking buffer is 0')
                .required('Advance booking buffer is required'),
            locations: Yup.array().nullable(),
            employees: Yup.array().nullable(),
            images: Yup.array().nullable(),
            description: Yup.string().nullable(),
            schedule: Yup.mixed(),
            confirmation_note: Yup.string().nullable(),
            is_waiver_enabled: Yup.boolean()
        }),
        onSubmit: (formData) => {
            update({
                ...formData,
                // @ts-ignore
                locations: map(values.locations, 'id'),
                // @ts-ignore
                employees: map(values.employees, 'id')
            });
            dispatch(locationAPI.util.invalidateTags(['Location']));
            dispatch(employeeAPI.util.invalidateTags(['Employee']));
        }
    });

    const locations = locationAPI.useFetchAllLocationsQuery({});
    const categories = serviceCategoryAPI.useFetchAllServiceCategoriesQuery(null);
    const employees = employeeAPI.useFetchAllEmployeesQuery({});

    useEffect(() => {
        if (!employees.isFetching && !locations.isFetching && employees.data && locations.data && categories.data) {
            if (!service.id) {
                const employeesToFill = employees.data.data.filter(
                    (employee: IEmployee) => employee.role !== UserRole.Owner && employee.role !== UserRole.Admin
                );
                setFieldValue('employees', employeesToFill);
                setFieldValue('locations', locations.data.data);
            }
            setFieldValue('service_category_id', categories.data[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employees.isFetching, locations.isFetching, categories.isFetching]);

    const handleChangeLocation = (value: ILocation[]) => {
        setFieldValue('locations', value);
    };

    const handleChangeEmployee = (value: IEmployee[]) => {
        setFieldValue('employees', value);
    };

    const clearFormImage = () => {
        setFieldValue('images', []);
    };

    const handlePriceFieldChange = useCallback(
        (fieldName: string, value: string) => {
            setFieldTouched(fieldName, false);
            value = value
                .replace(/^\./, '')
                .replace(/[^\d.]/g, '')
                .replace(/(?:\.)\./, '')
                .replace(/(^\d*.\d{2})(\d*)/, '$1')
                .split('.')
                .filter((_, idx) => idx < 2)
                .join('.');
            setFieldValue(fieldName, value);
        },
        [setFieldTouched, setFieldValue]
    );

    return (
        <>
            {!locations.isFetching && (
                <form noValidate onSubmit={handleSubmit}>
                    <CardContent sx={{ px: { xs: 0, sm: 2 }, pt: { xs: 0, sm: 2 } }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12}>
                                <Grid container spacing={2} alignItems="center">
                                    <ImageUploader
                                        initialPreview={initialPreview}
                                        setFieldValue={setFieldValue}
                                        name="Service Image"
                                        imageFieldName="images"
                                        clearFormImage={clearFormImage}
                                    />
                                    <Grid item xs={12} sm={3} lg={4}>
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
                                                    {errors.name}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={3} lg={4}>
                                        <InputLabel horizontal>Description</InputLabel>
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.description && errors.description)}>
                                            <OptimizedTextField
                                                fullWidth
                                                id="description"
                                                name="description"
                                                rows={2}
                                                multiline
                                                placeholder="Description"
                                                value={values.description || ''}
                                                onBlur={handleBlur}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    handleChange(e);
                                                    setFieldTouched('description', false);
                                                }}
                                                error={Boolean(touched.description && errors.description)}
                                                helperText={touched.description && errors.description}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={3} lg={4}>
                                        <LabelWithInfo label="Duration" infoText="This is how long the actual service takes." />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.duration && errors.duration)}>
                                            <DurationAutocomplete
                                                // label="Duration"
                                                name="service-duration"
                                                min={10}
                                                value={String(values.duration)}
                                                onBlur={(e) => {
                                                    setFieldTouched('duration');
                                                    handleBlur(e);
                                                }}
                                                setDuration={(newValue) => {
                                                    // setFieldTouched('duration', false);
                                                    setFieldValue('duration', newValue);
                                                }}
                                            />
                                            {touched.duration && errors.duration && (
                                                <FormHelperText error id="standard-weight-helper-text--register">
                                                    {errors.duration}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={3} lg={4}>
                                        <LabelWithInfo
                                            label="Post-Appointment Buffer"
                                            infoText="The amount of time required for cleanup, or other preparations before a staff member can serve another client. All bookings for this service will have the post-appointment buffer added to the total duration of the booking."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.interval && errors.interval)}>
                                            <DurationAutocomplete
                                                name="service-interval"
                                                value={String(values.interval)}
                                                onBlur={(e) => {
                                                    handleBlur(e);
                                                    setFieldTouched('interval');
                                                }}
                                                setDuration={(newValue) => {
                                                    // setFieldTouched('interval', false);
                                                    setFieldValue('interval', newValue);
                                                }}
                                            />
                                            <FormHelperText>
                                                Time buffer before next service can be booked with the same provider
                                            </FormHelperText>
                                            {touched.interval && errors.interval && (
                                                <FormHelperText error id="standard-weight-helper-text--register">
                                                    {errors.interval}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={3} lg={4}>
                                        <LabelWithInfo
                                            label="Payment Type"
                                            infoText="Deposit required - select if you want to make it mandatory for customers to pay a deposit at the time of booking via widget. Needs at least one payment gateway correctly setup in the settings to work."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.payment_type && errors.payment_type)}>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="payment_type"
                                                value={values.payment_type}
                                                name="payment_type"
                                                onChange={(event) => {
                                                    if (event.target.value === PaymentType.Free) {
                                                        setFieldValue('price', null);
                                                        setFieldValue('prepay', null);
                                                    }
                                                    if (event.target.value === PaymentType.Paid) {
                                                        setFieldValue('prepay', null);
                                                    }
                                                    handleChange(event);
                                                    setFieldTouched('price', false);
                                                    setFieldTouched('prepay', false);
                                                    setFieldTouched('payment_type', false);
                                                }}
                                            >
                                                {Object.entries(PaymentType).map((entry, index) => {
                                                    const [key, value] = entry;
                                                    return (
                                                        <MenuItem key={`${value}-${value}`} value={value}>
                                                            {PaymentTypeNames[key as keyof typeof PaymentTypeNames]}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                            {touched.payment_type && errors.payment_type && (
                                                <FormHelperText error id="standard-weight-helper-text--register">
                                                    {errors.payment_type}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    {values.payment_type === PaymentType.Prepaid && (
                                        <>
                                            <Grid item xs={12} sm={3} lg={4}>
                                                <LabelWithInfo
                                                    label="Deposit Amount, $"
                                                    infoText="The amount of deposit a customer has to pay upon booking."
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={9} lg={6}>
                                                <FormControl fullWidth error={Boolean(touched.prepay && errors.prepay)}>
                                                    <TextField
                                                        id="prepay"
                                                        placeholder="Deposit Amount"
                                                        type="string"
                                                        value={values.prepay || ''}
                                                        name="prepay"
                                                        autoComplete="off"
                                                        onBlur={handleBlur}
                                                        onChange={(event) => {
                                                            handlePriceFieldChange('prepay', event.target.value);
                                                        }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <>
                                                                    <InputAdornment position="start">
                                                                        <IconCurrencyDollar size="20px" />
                                                                    </InputAdornment>
                                                                    <Divider sx={{ height: 28, m: 0.5, mr: 1.5 }} orientation="vertical" />
                                                                </>
                                                            )
                                                        }}
                                                    />
                                                    {touched.price && errors.price && (
                                                        <FormHelperText error id="standard-weight-helper-text--register">
                                                            {' '}
                                                            {errors.prepay}{' '}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                        </>
                                    )}
                                    {(values.payment_type === PaymentType.Paid || values.payment_type === PaymentType.Prepaid) && (
                                        <>
                                            <Grid item xs={12} sm={3} lg={4}>
                                                <LabelWithInfo
                                                    label="Service Price, $"
                                                    infoText="Total service price, including deposit."
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={9} lg={6}>
                                                <FormControl fullWidth error={Boolean(touched.price && errors.price)}>
                                                    <TextField
                                                        id="price"
                                                        placeholder="Service Price"
                                                        type="string"
                                                        value={values.price || ''}
                                                        name="price"
                                                        autoComplete="off"
                                                        onBlur={handleBlur}
                                                        onChange={(event) => {
                                                            handlePriceFieldChange('price', event.target.value);
                                                        }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <>
                                                                    <InputAdornment position="start">
                                                                        <IconCurrencyDollar size="20px" />
                                                                    </InputAdornment>
                                                                    <Divider sx={{ height: 28, m: 0.5, mr: 1.5 }} orientation="vertical" />
                                                                </>
                                                            )
                                                        }}
                                                    />
                                                    {touched.price && errors.price && (
                                                        <FormHelperText error id="standard-weight-helper-text--register">
                                                            {' '}
                                                            {errors.price}{' '}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                        </>
                                    )}

                                    <TwoColumnsSwitch
                                        value={values.is_virtual}
                                        fieldName="is_virtual"
                                        setFieldValue={setFieldValue}
                                        label="Virtual Service"
                                        labelDecoration={
                                            <InfoTooltip text="Enable if this service is provided as a virtual consultation. All bookings will automatically get a one-on-one video call room reserved and attached to the booking. The link to the video call can be found in email confirmations or in booking details." />
                                        }
                                    />

                                    <TwoColumnsSwitch
                                        value={values.is_private}
                                        fieldName="is_private"
                                        setFieldValue={setFieldValue}
                                        label="Private Service"
                                        labelDecoration={
                                            <InfoTooltip text="Enable if you want the service to only be available for booking via direct link that you provide to select customers. The service will not be available for booking via regular widget. You can setup direct link on the widget settings screen." />
                                        }
                                    />

                                    <Grid item xs={12}>
                                        <Grid container>
                                            <Grid item xs={12} sm={3} lg={4}>
                                                <LabelWithInfo
                                                    label="Service Weekly Availability"
                                                    infoText="If specific location is not working on selected day, the service will not be available for booking via widget at this location, even if it is enabled here. Make sure to keep your scheduling consistent between locations, services, and staff. Keep in mind, that scheduling only has effect on the booking widget. You can create appointments regardless of scheduling settings from the back office."
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={9} lg={6} pl={{ xs: 0, sm: 1 }}>
                                                <WeekDaysSchedule
                                                    schedule={values.schedule}
                                                    onChange={(updatedSchedule) => setFieldValue('schedule', updatedSchedule)}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <TwoColumnsSwitch
                                        value={values.is_reschedule_enabled}
                                        fieldName="is_reschedule_enabled"
                                        setFieldValue={setFieldValue}
                                        label="Service Reschedule"
                                        labelDecoration={
                                            <InfoTooltip text="Allow customers edit time and date of already scheduled appointments via widget." />
                                        }
                                    />

                                    {values.is_reschedule_enabled && (
                                        <>
                                            <Grid item xs={12} sm={3} lg={4}>
                                                <LabelWithInfo
                                                    label="Service Reschedule Buffer"
                                                    infoText="The minimum amount of time remaining until appointment, when customer can reschedule."
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={9} lg={6}>
                                                <FormControl
                                                    fullWidth
                                                    error={Boolean(touched.rescheduling_interval && errors.rescheduling_interval)}
                                                >
                                                    <OptimizedTextField
                                                        type="number"
                                                        id="rescheduling_interval"
                                                        name="rescheduling_interval"
                                                        value={values.rescheduling_interval}
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                const value = parseInt(e.target.value, 10);
                                                                setFieldValue('rescheduling_interval', value);
                                                                return;
                                                            }
                                                            handleChange(e);
                                                        }}
                                                        onBlur={handleBlur}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <>
                                                                    <InputAdornment position="start">Minutes</InputAdornment>
                                                                    <Divider sx={{ height: 28, m: 0.5, mr: 1.5 }} orientation="vertical" />
                                                                </>
                                                            ),
                                                            endAdornment: !isMobile ? (
                                                                <>
                                                                    <InputAdornment position="end">
                                                                        Use &quot;0&quot; for no buffer
                                                                    </InputAdornment>
                                                                </>
                                                            ) : null
                                                        }}
                                                    />
                                                    {touched.rescheduling_interval && errors.rescheduling_interval && (
                                                        <FormHelperText error id="standard-weight-helper-text--register">
                                                            {' '}
                                                            {errors.rescheduling_interval}{' '}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                        </>
                                    )}
                                    <Grid item xs={12} sm={3} lg={4}>
                                        <LabelWithInfo
                                            label="Service Advance Booking Buffer"
                                            infoText="The minimum amount of time remaining until desired appointment time that customer can book."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl
                                            fullWidth
                                            error={Boolean(touched.advance_booking_buffer && errors.advance_booking_buffer)}
                                        >
                                            <OptimizedTextField
                                                id="advance_booking_buffer"
                                                type="number"
                                                name="advance_booking_buffer"
                                                value={values.advance_booking_buffer}
                                                onBlur={(e) => {
                                                    handleBlur(e);
                                                    setFieldTouched('advance_booking_buffer');
                                                }}
                                                onChange={handleChange}
                                                InputProps={{
                                                    startAdornment: (
                                                        <>
                                                            <InputAdornment position="start" sx={{ pl: '3px', pr: 0 }}>
                                                                Minutes
                                                            </InputAdornment>
                                                            <Divider sx={{ height: 28, m: 0.5, mr: 1.5 }} orientation="vertical" />
                                                        </>
                                                    ),
                                                    endAdornment: !isMobile ? (
                                                        <>
                                                            <InputAdornment position="end">Use &quot;0&quot; for no buffer</InputAdornment>
                                                        </>
                                                    ) : null
                                                }}
                                            />
                                            {touched.advance_booking_buffer && errors.advance_booking_buffer && (
                                                <FormHelperText error id="standard-weight-helper-text--register">
                                                    {' '}
                                                    {errors.advance_booking_buffer}{' '}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={3} lg={4}>
                                        <LabelWithInfo label="Locations" infoText="Locations where the service is offered." />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.locations && errors.locations)}>
                                            {locations.data && (
                                                <>
                                                    <Autocomplete
                                                        multiple
                                                        id="checkboxes-tags-locations"
                                                        options={locations.data.data}
                                                        value={values.locations}
                                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                                        disableCloseOnSelect
                                                        getOptionLabel={(option) => option.name}
                                                        onBlur={(e) => {
                                                            setFieldTouched('locations');
                                                            handleBlur(e);
                                                        }}
                                                        onChange={(e, value) => {
                                                            setFieldTouched('locations');
                                                            handleChangeLocation(value);
                                                        }}
                                                        renderOption={(props, option, { selected }) => (
                                                            <li {...props}>
                                                                <Checkbox style={{ marginRight: 8 }} checked={selected} />
                                                                {option.name}
                                                            </li>
                                                        )}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                placeholder={values.locations?.length ? undefined : 'Locations'}
                                                            />
                                                        )}
                                                    />
                                                    {touched.locations && errors.locations && (
                                                        <FormHelperText error id="standard-weight-helper-text--register">
                                                            {' '}
                                                            {errors.locations}{' '}
                                                        </FormHelperText>
                                                    )}
                                                </>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={3} lg={4}>
                                        <LabelWithInfo
                                            label="Staff"
                                            infoText="Staff members who offer this service. Remember to add them to desired locations, otherwise customers will not see them in the booking widget."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.employees && errors.employees)}>
                                            <EmployeeSelect
                                                employees={employees?.data?.data || []}
                                                onChange={handleChangeEmployee}
                                                value={values.employees}
                                                touched={touched}
                                                errors={errors}
                                                setFieldTouched={setFieldTouched}
                                                handleBlur={handleBlur}
                                            />
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={3} lg={4}>
                                        <LabelWithInfo
                                            label="Confirmation Note"
                                            infoText="This message is included in confirmation email sent to customer. This overrides the global confirmation note that is defined on the settings screen."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.confirmation_note && errors.confirmation_note)}>
                                            <OptimizedTextField
                                                fullWidth
                                                id="confirmation_note"
                                                name="confirmation_note"
                                                rows={2}
                                                multiline
                                                placeholder="Confirmation Note"
                                                value={values.confirmation_note || ''}
                                                onBlur={handleBlur}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    handleChange(e);
                                                    setFieldTouched('confirmation_note', false);
                                                }}
                                                error={Boolean(touched.confirmation_note && errors.confirmation_note)}
                                                helperText={touched.confirmation_note && errors.confirmation_note}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <TwoColumnsSwitch
                                        value={values.is_waiver_enabled}
                                        fieldName="is_waiver_enabled"
                                        setFieldValue={setFieldValue}
                                        label="Waiver"
                                        labelDecoration={<InfoTooltip text="Enable to use the organization's waiver for this service." />}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ px: { xs: 0, sm: 2 } }}>
                        <Grid container spacing={1}>
                            <Grid item>
                                <Button type="submit" variant="contained" color="primary">
                                    Save
                                </Button>
                            </Grid>
                        </Grid>
                    </CardActions>
                </form>
            )}
        </>
    );
};

export default ServiceForm;
