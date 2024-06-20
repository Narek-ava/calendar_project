import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

// material-ui
import { Grid } from '@material-ui/core';
import { FormControl, FormHelperText, Stack, TextField } from '@mui/material';

// project imports
import { IUser } from '../../../models/IUser';
import OptimizedTextField from '../../../ui-component/optimized-text-fields/OptimizedTextField';
import { gridSpacing } from '../../../store/constant';
import { LoadingButton } from '@mui/lab';
import SaveOutlined from '@material-ui/icons/SaveOutlined';
import { NumberFormatCustom } from '../../../ui-component/optimized-text-fields/OptimizedMaskedTextField';

interface DetailsFormProps {
    user: IUser;
    onUpdate: (user: IUser) => void;
    isSubmitting: boolean;
}

const ProfileForm: React.FC<DetailsFormProps> = ({ user, onUpdate, isSubmitting }) => {
    const { handleSubmit, values, touched, errors, handleBlur, handleChange, setFieldTouched } = useFormik({
        enableReinitialize: true,
        initialValues: {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone
        },
        validationSchema: Yup.object().shape({
            firstname: Yup.string().max(255, 'First name must be at most 255 characters').required('First name is required'),
            lastname: Yup.string().max(255, 'Last name must be at most 255 characters').required('Last name is required'),
            email: Yup.string()
                .nullable()
                .max(255, 'Email must be at most 255 characters')
                .email('Must be a valid email')
                .required('Email or phone is required'),
            phone: Yup.string().nullable().min(10, 'Phone number is not valid')
        }),
        onSubmit: (formData) => {
            onUpdate({ ...formData, email: formData.email.toLowerCase() } as IUser);
        }
    });

    return (
        <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <OptimizedTextField
                            id="firstname"
                            name="firstname"
                            label="First Name"
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
                    {/* <TextField fullWidth label="Firstname" defaultValue={user?.firstname} helperText="Helper text" /> */}
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <OptimizedTextField
                            id="lastname"
                            name="lastname"
                            label="Last Name"
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
                    {/*  <TextField fullWidth label="Lastname" defaultValue={user?.lastname} helperText="Helper text" /> */}
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <OptimizedTextField
                            id="email"
                            name="email"
                            label="Email"
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
                    {/* <TextField fullWidth label="Email address" defaultValue={user?.email} /> */}
                </Grid>
                <Grid item md={6} xs={12}>
                    <FormControl fullWidth error={Boolean(touched.phone && errors.phone)}>
                        <TextField
                            id="phone"
                            name="phone"
                            label="Phone"
                            value={values.phone || ''}
                            onChange={(e) => {
                                handleChange(e);
                                setFieldTouched('phone', false);
                            }}
                            onBlur={handleBlur}
                            InputProps={{
                                inputComponent: NumberFormatCustom as any
                            }}
                        />
                        {touched.phone && errors.phone && (
                            <FormHelperText error id="standard-weight-helper-text--register">
                                {' '}
                                {errors.phone}{' '}
                            </FormHelperText>
                        )}
                    </FormControl>
                    {/* <TextField fullWidth label="Phone number" defaultValue={user?.phone} /> */}
                </Grid>
                <Grid item xs={12}>
                    <Stack direction="row">
                        <LoadingButton
                            loading={isSubmitting}
                            loadingPosition="start"
                            type="submit"
                            color="primary"
                            startIcon={<SaveOutlined />}
                            variant="contained"
                        >
                            {isSubmitting ? 'Updating Profile...' : 'Save Changes'}
                        </LoadingButton>
                    </Stack>
                </Grid>
            </Grid>
        </form>
    );
};

export default ProfileForm;
