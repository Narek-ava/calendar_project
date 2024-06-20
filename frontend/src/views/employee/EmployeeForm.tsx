import { useCallback, useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { IEmployee, IEmployeePayload, UserRole } from '../../models/IEmployee';
import { useFormik } from 'formik';
import { colors } from '../../store/constant';
import { map, startCase, toLower } from 'lodash';
import locationAPI from '../../services/LocationService';
import { ILocation, ISchedule } from '../../models/ILocation';
import { IService } from '../../models/IService';
import ResendInvitationButton from './ResendInvitationButton';
import {
    Button,
    CardActions,
    CardContent,
    Divider,
    Grid,
    ListItemText,
    ListItemIcon,
    FormControl,
    FormHelperText,
    MenuItem,
    Select,
    Typography,
    Stack
} from '@material-ui/core';
import ImageUploader from '../../ui-component/form/ImageUploader';
import InputLabel from '../../ui-component/extended/Form/InputLabel';
import OptimizedTextField from '../../ui-component/optimized-text-fields/OptimizedTextField';
import OptimizedMaskedTextField from '../../ui-component/optimized-text-fields/OptimizedMaskedTextField';
import { isAllowChangeRole } from '../../utils/roles/functions';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import TwoColumnsSwitch from '../../ui-component/TwoColumnsSwitch';
import OptimizedSchedule from '../../ui-component/optimized-text-fields/schedule/OptimizedSchedule';
import StaffShifts from './StaffShifts';
import * as Yup from 'yup';
import Circle from '@material-ui/icons/Circle';
import ServiceSelect from '../../ui-component/ServiceSelect';
import LabelWithInfo from '../../ui-component/LabelWithInfo';
import InfoTooltip from '../../ui-component/InfoTooltip';
import { SnackBarTypes } from '../../store/snackbarReducer';
import serviceAPI from '../../services/ServiceService';
import useShowSnackbar from '../../hooks/useShowSnackbar';
import employeeAPI from '../../services/EmployeeService';
import appointmentAPI from '../../services/AppointmentService';
import { useAppDispatch } from '../../hooks/redux';
import { useNavigate } from 'react-router-dom';

interface EmployeeFormProps {
    employee: IEmployee;
    save: (employee: IEmployeePayload) => any;
    isEdit?: boolean;
    isInvite?: boolean;
}

const employeeFormSchema = Yup.object().shape({
    user: Yup.object().shape({
        firstname: Yup.string().max(255, 'First name must be at most 255 characters').required('First name is required'),
        lastname: Yup.string().max(255, 'Last name must be at most 255 characters').required('Last name is required'),
        email: Yup.string().max(255, 'Email must be at most 255 characters').required('Email is required').email('Must be a valid email'),
        phone: Yup.string()
            .nullable()
            // .required('Phone is required')
            .min(10, 'Phone number is not valid')
    }),
    role: Yup.string().required('Role is required'),
    profession_title: Yup.string().nullable().max(255, 'Profession title must be at most 255 characters'),
    self_book: Yup.boolean(),
    locations: Yup.array().when('self_book', {
        is: true,
        then: Yup.array().min(1, 'At least one Location is required'),
        otherwise: Yup.array().nullable()
    }),
    services: Yup.array().when('self_book', {
        is: true,
        then: Yup.array().min(1, 'At least one Service is required'),
        otherwise: Yup.array().nullable()
    }),
    schedule: Yup.mixed(),
    is_shifts_enabled: Yup.boolean(),
    shifts: Yup.array().when('is_shifts_enabled', {
        is: true,
        then: Yup.array()
            .of(
                Yup.object().shape({
                    opened: Yup.boolean().required(),
                    start: Yup.string().required('Start time is required'),
                    end: Yup.string().required('End time is required')
                })
            )
            .min(1, 'At least one date is required'),
        otherwise: Yup.array().nullable()
    }),
    settings: Yup.object().shape({
        widget: Yup.object().shape({
            use_location_schedule: Yup.boolean(),
            accounting_google_events: Yup.boolean()
        })
    })
});

const EmployeeForm = ({ save, employee, isEdit, isInvite }: EmployeeFormProps) => {
    const { user, checkAuthentication } = useAuth();
    const { showSnackbar } = useShowSnackbar();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [roles, setRoles] = useState([UserRole.Admin, UserRole.Manager, UserRole.Provider, UserRole.FrontDesk, UserRole.ReadOnlyLimited]);

    const invalidateQueries = useCallback(() => {
        dispatch(serviceAPI.util.invalidateTags(['Service']));
        dispatch(employeeAPI.util.invalidateTags(['Employee']));
        dispatch(locationAPI.util.invalidateTags(['Location']));
        dispatch(appointmentAPI.util.invalidateTags(['Appointment']));
    }, [dispatch]);

    const handleSuccessfullCreate = useCallback(
        (res) => {
            // @ts-ignore
            if (res.error) {
                showSnackbar({
                    message: 'This employee has already been added to this company',
                    alertSeverity: SnackBarTypes.Error
                });
            } else {
                showSnackbar({
                    message: 'Employee created',
                    alertSeverity: SnackBarTypes.Success
                });
                navigate('/employee', { replace: true });
            }
            invalidateQueries();
        },
        [invalidateQueries, navigate, showSnackbar]
    );

    const handleSuccessfullEdit = useCallback(
        (arg) => {
            showSnackbar({
                message: 'Employee updated',
                alertSeverity: SnackBarTypes.Success
            });
            invalidateQueries();
            navigate('/employee', { replace: true });
            if (user?.employee.id === arg.id) {
                checkAuthentication();
            }
        },
        [checkAuthentication, invalidateQueries, navigate, showSnackbar, user]
    );

    const { handleSubmit, values, touched, errors, handleBlur, handleChange, setFieldValue, setFieldTouched, setFieldError } = useFormik({
        enableReinitialize: true,
        initialValues: {
            ...employee,
            background_color: employee.background_color ? `#${employee.background_color}` : colors.blue.value,
            text_color: employee.text_color ? `#${employee.text_color}` : colors.white.value,
            is_shifts_enabled: employee.is_shifts_enabled || false,
            shifts: employee.shifts || []
        },
        validationSchema: employeeFormSchema,
        onSubmit: (formData) => {
            const data = {
                ...formData,
                // @ts-ignore
                locations: map(values.locations, 'id'),
                // @ts-ignore
                services: map(values.services, 'id'),
                background_color: formData.background_color.replace('#', ''),
                text_color: formData.text_color.replace('#', '')
            } as IEmployeePayload;

            save(data)
                .unwrap()
                .then((res: any) => {
                    if (isEdit) {
                        handleSuccessfullEdit(data);
                    } else {
                        handleSuccessfullCreate(res);
                    }
                })
                .catch((e: { data: any; errors: any }) => {
                    if (e.errors) {
                        Object.keys(e.errors).forEach((key) => {
                            setFieldError(key, e.errors[key]);
                        });
                    }
                    showSnackbar({
                        message: e.data || `Error: Employee wasn't ${isEdit ? 'updated' : 'created'}`,
                        alertSeverity: SnackBarTypes.Error
                    });
                });
        }
    });

    const locations = locationAPI.useFetchAllLocationsQuery({});

    const handleChangeLocation = (value: ILocation[]) => {
        setFieldValue('locations', value);
    };

    const handleChangeService = (value: IService[]) => {
        setFieldValue('services', value);
    };

    useEffect(() => {
        if (user && (user.employee.role.name === UserRole.Manager || user.employee.role.name === UserRole.Provider)) {
            setRoles([UserRole.Manager, UserRole.Provider]);
        }
    }, []);

    useEffect(() => {
        if (employee.avatar && typeof employee.avatar === 'object') {
            const imageLink = employee.avatar.url.match(/images.*$/);
            setFieldValue('avatar', imageLink ? imageLink[0] : null);
        }
    }, [employee, setFieldValue]);

    const setAvatar = useCallback(
        (field: string, value: any): any => {
            setFieldValue('avatar', value ? value[0] : null);
        },
        [setFieldValue]
    );

    const clearAvatar = useCallback(() => {
        setFieldValue('avatar', null);
    }, [setFieldValue]);

    return (
        <>
            <ResendInvitationButton employee={employee} />
            {!locations.isFetching && user && (
                <form noValidate onSubmit={handleSubmit}>
                    <CardContent sx={{ px: { xs: 0, sm: 2 }, pt: { xs: 0, sm: 2 } }}>
                        <Grid container spacing={2} alignItems="center">
                            <ImageUploader
                                initialPreview={values?.avatar}
                                setFieldValue={setAvatar}
                                name="Avatar"
                                imageFieldName="avatar"
                                clearFormImage={clearAvatar}
                            />
                            <Grid item xs={12}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={3} lg={4}>
                                        <InputLabel horizontal>First Name</InputLabel>
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.user?.firstname && errors.user?.firstname)}>
                                            <OptimizedTextField
                                                id="firstname"
                                                name="user.firstname"
                                                placeholder="First Name"
                                                disabled={isEdit || isInvite}
                                                value={values.user.firstname}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                            />
                                            {touched.user?.firstname && errors.user?.firstname && (
                                                <FormHelperText error id="error-firstname">
                                                    {errors.user?.firstname}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={3} lg={4}>
                                        <InputLabel horizontal>Last Name</InputLabel>
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.user?.lastname && errors.user?.lastname)}>
                                            <OptimizedTextField
                                                id="lastname"
                                                name="user.lastname"
                                                placeholder="Last Name"
                                                disabled={isEdit || isInvite}
                                                value={values.user.lastname}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                            />
                                            {touched.user?.lastname && errors.user?.lastname && (
                                                <FormHelperText error id="error-lastname">
                                                    {errors.user?.lastname}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={3} lg={4}>
                                        <LabelWithInfo label="Title" infoText="Title is shown below provider name in booking widget." />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.profession_title && errors.profession_title)}>
                                            <OptimizedTextField
                                                id="profession_title"
                                                name="profession_title"
                                                placeholder="Title"
                                                value={values.profession_title}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                        </FormControl>
                                        {touched.profession_title && errors.profession_title && (
                                            <FormHelperText error id="error-profession_title">
                                                {errors.profession_title}
                                            </FormHelperText>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} sm={3} lg={4}>
                                        <InputLabel horizontal>Phone</InputLabel>
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.user?.phone && errors.user?.phone)}>
                                            <OptimizedMaskedTextField
                                                id="user.phone"
                                                name="user.phone"
                                                disabled={isEdit || isInvite}
                                                value={values.user.phone}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Phone"
                                            />
                                            {touched.user?.phone && errors.user?.phone && (
                                                <FormHelperText error id="error-phone">
                                                    {errors.user?.phone}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={3} lg={4}>
                                        <InputLabel horizontal>Email</InputLabel>
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.user?.email && errors.user?.email)}>
                                            <OptimizedTextField
                                                id="email"
                                                name="user.email"
                                                placeholder="Email"
                                                disabled={isEdit || isInvite}
                                                value={values.user.email}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            {touched.user?.phone && errors.user?.phone && (
                                                <FormHelperText error id="error-email">
                                                    {errors.user?.email}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={3} lg={4}>
                                        <LabelWithInfo
                                            label="Role"
                                            infoText="Admin has access to all the available functionality and settings. Manager is responsible for operational part of each organization. Front-desk is designed to book appointments for other staff without access to other functions. Provider operates the service itself and managing his own appointment."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        {/* Owner can't change his role */}
                                        {user.employee.role.name === UserRole.Owner && employee.user.id === user.id ? (
                                            <Typography sx={{ pl: 2 }}>{startCase(toLower(user.employee.role.name))}</Typography>
                                        ) : (
                                            <FormControl fullWidth error={Boolean(touched.role && errors.role)}>
                                                <Select
                                                    id="role"
                                                    name="role"
                                                    value={values.role}
                                                    onChange={handleChange}
                                                    disabled={!isAllowChangeRole(user, employee)}
                                                >
                                                    {roles.map((role) => (
                                                        <MenuItem key={role} value={role}>
                                                            {startCase(toLower(role))}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} sm={3} lg={4}>
                                        <LabelWithInfo
                                            label="Color"
                                            infoText="The color which appointments of this provider have on the calendar view."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth>
                                            <Select
                                                id="background_color"
                                                name="background_color"
                                                value={values.background_color}
                                                onChange={handleChange}
                                                disabled={!isAllowChangeRole(user, employee)}
                                                renderValue={(value) => (
                                                    <Stack flexDirection="row" alignItems="center" gap={1}>
                                                        <Circle sx={{ color: value }} />
                                                        {Object.values(colors).find((c) => c.value === value)?.label}
                                                    </Stack>
                                                )}
                                            >
                                                {Object.values(colors)
                                                    .filter((color) => color.label !== 'White')
                                                    .map((color) => (
                                                        <MenuItem key={color.value} value={color.value}>
                                                            <ListItemIcon>
                                                                <Circle sx={{ color: color.value }} />
                                                            </ListItemIcon>
                                                            <ListItemText>{color.label}</ListItemText>
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <TwoColumnsSwitch
                                        value={values.settings.widget?.accounting_google_events}
                                        fieldName="settings.widget.accounting_google_events"
                                        setFieldValue={setFieldValue}
                                        label="Account for Google Calendar Availability"
                                    />

                                    <TwoColumnsSwitch
                                        value={values.self_book}
                                        fieldName="self_book"
                                        setFieldValue={setFieldValue}
                                        label="Allow Booking via Widget"
                                        labelDecoration={
                                            <InfoTooltip text="Enable to allow customers to see and book this specific provide in the booking widget." />
                                        }
                                    />

                                    <TwoColumnsSwitch
                                        value={values.settings.widget?.use_location_schedule}
                                        fieldName="settings.widget.use_location_schedule"
                                        setFieldValue={setFieldValue}
                                        label="Use Location Schedule"
                                        labelDecoration={
                                            <InfoTooltip text="If enabled, location settings for open hours and time are used for this provider. If provider is part of multiple locations, availability depends on which location is selected in the widget. Disable to set individual schedule for this provider. Individual schedule overrides location settings and is applied for all locations that provider is part of." />
                                        }
                                    />
                                    {!values.settings.widget?.use_location_schedule && (
                                        <>
                                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                                <LabelWithInfo
                                                    label="Schedule"
                                                    infoText="Set days and time when this provider is available for booking."
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={9} lg={8} sx={{ overflow: 'auto' }}>
                                                <OptimizedSchedule
                                                    schedules={values.schedule}
                                                    onChange={(schedules: ISchedule[]) => {
                                                        setFieldValue('schedule', schedules);
                                                    }}
                                                    errors={errors}
                                                />
                                            </Grid>
                                        </>
                                    )}

                                    <StaffShifts
                                        setFieldValue={setFieldValue}
                                        is_shifts_enabled={values.is_shifts_enabled}
                                        checkboxFieldName="is_shifts_enabled"
                                        shifts={values.shifts}
                                        setShifts={(shifts) => {
                                            setFieldValue('shifts', shifts);
                                        }}
                                        error={typeof errors.shifts === 'string' ? errors.shifts : null}
                                        errors={errors}
                                    />

                                    <Grid item xs={12} sm={3} lg={4}>
                                        <LabelWithInfo label="Locations" infoText="Select locations where staff member offers services." />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.locations && errors.locations)}>
                                            <Autocomplete
                                                multiple
                                                id="checkboxes-tags-locations"
                                                // @ts-ignore
                                                options={locations.data.data}
                                                value={values.locations}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                disableCloseOnSelect
                                                getOptionLabel={(option: ILocation) => option.name}
                                                onBlur={(e) => {
                                                    setFieldTouched('locations');
                                                    handleBlur(e);
                                                }}
                                                onChange={(e, value) => handleChangeLocation(value)}
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
                                                <FormHelperText error id="errors-locations">
                                                    {errors.locations}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={3} lg={4}>
                                        <LabelWithInfo
                                            label="Services"
                                            infoText="Select services that provider offers. This setting does not override location services setting, so if a specific service is not added to a location, it will not be available for booking there, even though the provider has this service selected."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <ServiceSelect
                                            onChange={handleChangeService}
                                            value={values.services}
                                            touched={touched}
                                            errors={errors}
                                            setFieldTouched={setFieldTouched}
                                            handleBlur={handleBlur}
                                        />
                                    </Grid>
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

export default EmployeeForm;
