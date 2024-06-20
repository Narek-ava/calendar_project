/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment, { Moment } from 'moment-timezone';

// material-ui
import { FormControl, FormHelperText, Button, CardActions, CardContent, Divider, Grid, Typography, TextField } from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// project imports
import InputLabel from 'ui-component/extended/Form/InputLabel';
import { regExps } from 'utils/formValidators';
import { ICustomer } from 'models/ICustomer';
import OptimizedTextField from '../../ui-component/optimized-text-fields/OptimizedTextField';
import OptimizedMaskedTextField from '../../ui-component/optimized-text-fields/OptimizedMaskedTextField';

interface CustomerFormProps {
    customer: ICustomer;
    update: (customer: ICustomer) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, update }) => {
    moment.tz.setDefault(moment.tz.guess());
    const { handleSubmit, values, touched, errors, handleBlur, handleChange, setFieldValue, setFieldTouched } = useFormik({
        enableReinitialize: true,
        initialValues: {
            ...customer,
            birth_date: customer.birth_date ? moment(customer.birth_date) : null
        },
        validationSchema: Yup.object().shape(
            {
                firstname: Yup.string().max(255, 'First name must be at most 255 characters').required('First name is required'),
                lastname: Yup.string().max(255, 'Last name must be at most 255 characters').required('Last name is required'),
                email: Yup.string()
                    .nullable()
                    .max(255, 'Email must be at most 255 characters')
                    .email('Must be a valid email')
                    .when('phone', {
                        is: (phone: string) => !phone || phone.length === 0,
                        then: Yup.string().nullable().required('Email or phone is required')
                    }),
                phone: Yup.string()
                    .nullable()
                    .min(10, 'Phone number is not valid')
                    .when('email', {
                        is: (email: string) => !email || email.length === 0,
                        then: Yup.string().nullable().required('Phone or email is required')
                    }),
                birth_date: Yup.date()
                    .nullable()
                    // .required('Birth date is required')
                    .typeError('Invalid Date')
                    .min(moment('01-01-1900', 'MM-DD-YYYY').toDate(), 'Minimum date is 01.01.1900')
                    .max(moment().add(1, 'hour').toDate(), `Maximum date is ${moment().format('MM/DD/YYYY')}`),
                address: Yup.object().shape({
                    address: Yup.string()
                        .nullable()
                        .max(255, 'The limit is 255 symbols')
                        .matches(regExps.address, 'Must be a valid address'),
                    city: Yup.string().nullable().max(255, 'The limit is 255 symbols'),
                    state: Yup.string().nullable().max(255, 'The limit is 255 symbols'),
                    postal_code: Yup.string()
                        .nullable()
                        .max(255, 'The limit is 255 symbols')
                        .matches(regExps.postal_code, 'Must be a valid postal code')
                }),
                note: Yup.string().nullable()
            },
            [['email', 'phone']]
        ),
        onSubmit: (formData) => {
            update({
                ...formData,
                birth_date: formData.birth_date ? formData.birth_date.toISOString() : null
            });
        }
    });

    return (
        <form noValidate onSubmit={handleSubmit}>
            <CardContent sx={{ px: { xs: 0, sm: 2 }, pt: { xs: 0, sm: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>First Name</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OptimizedTextField
                                        id="firstname"
                                        name="firstname"
                                        placeholder="First Name"
                                        value={values.firstname}
                                        onBlur={handleBlur}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            handleChange(e);
                                            setFieldTouched('firstname', false);
                                        }}
                                    />
                                    {touched.firstname && errors.firstname && (
                                        <FormHelperText error id="standard-weight-helper-text--register">
                                            {' '}
                                            {errors.firstname}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>Last Name</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OptimizedTextField
                                        id="lastname"
                                        name="lastname"
                                        placeholder="Last Name"
                                        value={values.lastname}
                                        onBlur={handleBlur}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            handleChange(e);
                                            setFieldTouched('lastname', false);
                                        }}
                                    />
                                    {touched.lastname && errors.lastname && (
                                        <FormHelperText error id="standard-weight-helper-text--register">
                                            {' '}
                                            {errors.lastname}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>Birthday</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                    <FormControl fullWidth>
                                        <MobileDatePicker<Moment>
                                            closeOnSelect
                                            value={values.birth_date}
                                            disableFuture
                                            showToolbar={false}
                                            minDate={moment('01-01-1900')}
                                            onChange={(date) => {
                                                if (date) {
                                                    setFieldValue('birth_date', date);
                                                } else {
                                                    setFieldValue('birth_date', null);
                                                }
                                            }}
                                            renderInput={(params) => <TextField {...params} />}
                                        />
                                        {touched.birth_date && errors.birth_date && (
                                            <FormHelperText error id="standard-weight-helper-text--register">
                                                {' '}
                                                {errors.birth_date}{' '}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <Typography sx={{ mt: 2 }} color="secondary" fontSize="medium" fontWeight="bold">
                                    Primary Contact Details:
                                </Typography>
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>Email</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OptimizedTextField
                                        id="email"
                                        name="email"
                                        placeholder="Email"
                                        value={values.email}
                                        onBlur={handleBlur}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            handleChange(e);
                                            setFieldTouched('email', false);
                                        }}
                                    />
                                    {touched.email && errors.email && (
                                        <FormHelperText error id="standard-weight-helper-text--register">
                                            {' '}
                                            {errors.email}{' '}
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
                                        placeholder="Phone"
                                        value={values.phone}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            handleChange(e);
                                            setFieldTouched('phone', false);
                                        }}
                                        onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                            handleBlur(e);
                                            if (!e.target.value) {
                                                setFieldTouched('phone', false);
                                            }
                                        }}
                                    />
                                    {touched.phone && errors.phone && (
                                        <FormHelperText error id="standard-weight-helper-text--register">
                                            {' '}
                                            {errors.phone}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <Typography sx={{ mt: 2 }} color="secondary" fontSize="medium" fontWeight="bold">
                                    Address Details:
                                </Typography>
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                        <InputLabel horizontal>Address</InputLabel>
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.address?.address && errors.address?.address)}>
                                            <OptimizedTextField
                                                id="address.address"
                                                name="address.address"
                                                placeholder="Address"
                                                value={values.address.address || ''}
                                                onBlur={handleBlur}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    handleChange(e);
                                                    setFieldTouched('address.address', false);
                                                }}
                                            />
                                            {touched.address?.address && errors.address?.address && (
                                                <FormHelperText error id="standard-weight-helper-text--register">
                                                    {' '}
                                                    {errors.address.address}{' '}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                        <InputLabel horizontal>State</InputLabel>
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.address?.state && errors.address?.state)}>
                                            <OptimizedTextField
                                                id="address.state"
                                                name="address.state"
                                                placeholder="State"
                                                value={values.address.state || ''}
                                                onBlur={handleBlur}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    handleChange(e);
                                                    setFieldTouched('address.state', false);
                                                }}
                                            />
                                            {touched.address?.state && errors.address?.state && (
                                                <FormHelperText error id="standard-weight-helper-text--register">
                                                    {' '}
                                                    {errors.address.state}{' '}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                        <InputLabel horizontal>City</InputLabel>
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.address?.city && errors.address?.city)}>
                                            <OptimizedTextField
                                                id="address.city"
                                                name="address.city"
                                                placeholder="City"
                                                value={values.address.city || ''}
                                                onBlur={handleBlur}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    handleChange(e);
                                                    setFieldTouched('address.city', false);
                                                }}
                                            />
                                            {touched.address?.city && errors.address?.city && (
                                                <FormHelperText error id="standard-weight-helper-text--register">
                                                    {' '}
                                                    {errors.address.city}{' '}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    {/*
                                    <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                        <InputLabel horizontal>Country</InputLabel>
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.address?.country && errors.address?.country)}>
                                            <OptimizedTextField
                                                id="address.country"
                                                name="address.country"
                                                placeholder="Country"
                                                value={values.address.country || ''}
                                                onBlur={handleBlur}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    handleChange(e);
                                                    setFieldTouched('address.country', false);
                                                }}
                                            />
                                            {touched.address?.country && errors.address?.country && (
                                                <FormHelperText error id="standard-weight-helper-text--register">
                                                    {' '}
                                                    {errors.address.country}{' '}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    */}
                                    <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                        <InputLabel horizontal>Postal code</InputLabel>
                                    </Grid>
                                    <Grid item xs={12} sm={9} lg={6}>
                                        <FormControl fullWidth error={Boolean(touched.address?.postal_code && errors.address?.postal_code)}>
                                            <OptimizedTextField
                                                id="address.postal_code"
                                                name="address.postal_code"
                                                placeholder="Postal code"
                                                value={values.address.postal_code || ''}
                                                onBlur={handleBlur}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    handleChange(e);
                                                    setFieldTouched('address.postal_code', false);
                                                }}
                                            />
                                            {touched.address?.postal_code && errors.address?.postal_code && (
                                                <FormHelperText error id="standard-weight-helper-text--register">
                                                    {' '}
                                                    {errors.address.postal_code}{' '}
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>Note</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OptimizedTextField
                                        multiline
                                        rows={4}
                                        id="note"
                                        name="note"
                                        placeholder="Note"
                                        value={values.note || ''}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                    />
                                    {touched.note && errors.note && (
                                        <FormHelperText error id="standard-weight-helper-text--register">
                                            {' '}
                                            {errors.note}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
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
    );
};

export default CustomerForm;
