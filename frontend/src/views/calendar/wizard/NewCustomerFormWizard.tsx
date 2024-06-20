/* eslint-disable react/no-unused-prop-types */

// material-ui
import { Grid } from '@material-ui/core';

// project imports
import InputLabel from 'ui-component/extended/Form/InputLabel';
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { FormControl, FormHelperText } from '@mui/material';

import { ICustomer } from 'models/ICustomer';
import OptimizedTextField from '../../../ui-component/optimized-text-fields/OptimizedTextField';
import OptimizedMaskedTextField from '../../../ui-component/optimized-text-fields/OptimizedMaskedTextField';

interface NewCustomerFormWizardProps {
    customer: ICustomer;
    update: (customer: ICustomer) => void;
}

const NewCustomerFormWizard: React.FC<NewCustomerFormWizardProps> = ({ customer, update }) => {
    const { values, touched, errors, handleBlur, handleChange, setFieldTouched, handleSubmit } = useFormik({
        enableReinitialize: true,
        initialValues: customer,
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
                    })
            },
            [['email', 'phone']]
        ),
        onSubmit: (formData) => {
            update({ ...formData, email: formData.email.toLowerCase() });
        }
    });

    return (
        <>
            <form id="new-customer-wizard-form" noValidate onSubmit={handleSubmit}>
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
                                            {errors.phone}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </>
    );
};

export default NewCustomerFormWizard;
