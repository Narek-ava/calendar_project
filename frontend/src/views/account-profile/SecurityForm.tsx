import React, { useEffect } from 'react';

// material-ui
import { Box, FormControl, FormHelperText, Grid, IconButton, InputAdornment, Typography } from '@material-ui/core';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports

import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { StringColorProps } from 'types';
import { regExps } from '../../utils/formValidators';
import { useAppDispatch } from '../../hooks/redux';
import SubCard from '../../ui-component/cards/SubCard';
import { gridSpacing } from '../../store/constant';
import { SnackBarTypes } from '../../store/snackbarReducer';
import { axiosServices } from '../../utils/axios';
import { SNACKBAR_OPEN } from '../../store/actions';
import { LoadingButton } from '@mui/lab';
import SaveOutlined from '@material-ui/icons/SaveOutlined';
import { TextField } from '@mui/material';

interface SecurityProps {
    setValue: (data: number) => void;
}

type PasswordFieldNames = 'password' | 'new_password' | 'new_password_confirmation';

interface PasswordFields {
    password: boolean;
    new_password: boolean;
    new_password_confirmation: boolean;
}

const SecurityForm = ({ setValue }: SecurityProps) => {
    const dispatch = useAppDispatch();
    const [passwordsState, setPasswordState] = React.useState<PasswordFields>({
        password: false,
        new_password: false,
        new_password_confirmation: false
    });

    const [strength, setStrength] = React.useState(0);
    const [level, setLevel] = React.useState<StringColorProps>();

    const handleClickShowPassword = (name: PasswordFieldNames) => {
        const newPasswordState = {
            ...passwordsState,
            [name]: !passwordsState[name]
        };
        setPasswordState(newPasswordState);
    };

    const handleMouseDownPassword = (event: React.SyntheticEvent) => {
        event.preventDefault();
    };

    const changePassword = (value: string) => {
        const temp = strengthIndicator(value);
        setStrength(temp);
        setLevel(strengthColor(temp));
    };

    useEffect(() => {
        changePassword('');
    }, []);

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

    return (
        <>
            <Formik
                initialValues={{
                    password: '',
                    new_password: '',
                    new_password_confirmation: ''
                }}
                validationSchema={Yup.object().shape({
                    password: Yup.string().required('Password is required'),
                    new_password: Yup.string()
                        .max(255, 'Password must be at most 255 characters')
                        .min(8, 'Password must be at least 8 characters length')
                        .required('Password is required')
                        .matches(regExps.password, 'Must be a valid password')
                        .when('password', {
                            is: (val: string) => val && val.length > 0,
                            then: Yup.string().notOneOf([Yup.ref('password')], 'New password could not be equal to the previous one')
                        }),
                    // new_password_confirmation: Yup.string()
                    //     .max(255, 'Password must be at most 255 characters')
                    //     .min(8, 'Password must be at least 8 characters length')
                    //     .required('Password is required')
                    //     .matches(regExps.emailPassword, 'Must be a valid password'),
                    new_password_confirmation: Yup.string()
                        .max(255, 'Password must be at most 255 characters')
                        .min(8, 'Password must be at least 8 characters length')
                        .required('Password is required')
                        .when('new_password', {
                            is: (val: string) => val && val.length > 0,
                            then: Yup.string().oneOf([Yup.ref('new_password')], "The new passwords doesn't match")
                        })
                })}
                onSubmit={async (values, { setErrors, setSubmitting }) => {
                    setSubmitting(true);
                    try {
                        const res = await axiosServices.post(`/account/password`, { ...values });
                        if (res) {
                            showSnackbar({
                                message: 'Password successfully changed',
                                alertSeverity: SnackBarTypes.Success
                            });
                            setValue(0);
                        }
                    } catch (err: any) {
                        setSubmitting(false);
                        const { message, errors } = err;
                        setErrors({ submit: message, ...errors });
                    }
                }}
            >
                {({ errors, handleBlur, handleChange, setFieldTouched, handleSubmit, isSubmitting, touched, values }) => (
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item sm={12} md={8} lg={6}>
                                <Grid container spacing={gridSpacing}>
                                    <Grid item xs={12}>
                                        <SubCard title="Change Password">
                                            <Grid container spacing={gridSpacing}>
                                                <Grid item xs={12}>
                                                    <FormControl fullWidth error={Boolean(touched.password && errors.password)}>
                                                        <TextField
                                                            id="outlined-adornment-password-register"
                                                            type={passwordsState.password ? 'text' : 'password'}
                                                            value={values.password}
                                                            name="password"
                                                            // autoFocus
                                                            label="Current Password"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                setFieldTouched('password', false);
                                                                handleChange(e);
                                                            }}
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <>
                                                                        <InputAdornment position="end">
                                                                            <IconButton
                                                                                aria-label="toggle password visibility"
                                                                                onClick={() => handleClickShowPassword('password')}
                                                                                onMouseDown={handleMouseDownPassword}
                                                                                edge="end"
                                                                            >
                                                                                {passwordsState.password ? (
                                                                                    <Visibility />
                                                                                ) : (
                                                                                    <VisibilityOff />
                                                                                )}
                                                                            </IconButton>
                                                                        </InputAdornment>
                                                                    </>
                                                                )
                                                            }}
                                                        />
                                                        {touched.password && errors.password && (
                                                            <FormHelperText error id="standard-weight-helper-text-password-register">
                                                                {' '}
                                                                {errors.password}{' '}
                                                            </FormHelperText>
                                                        )}
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <FormControl fullWidth error={Boolean(touched.password && errors.password)}>
                                                        <TextField
                                                            id="outlined-adornment-new-password"
                                                            type={passwordsState.new_password ? 'text' : 'password'}
                                                            value={values.new_password}
                                                            name="new_password"
                                                            label="New Password"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                setFieldTouched('new_password', false);
                                                                handleChange(e);
                                                                changePassword(e.target.value);
                                                            }}
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <>
                                                                        <InputAdornment position="end">
                                                                            <IconButton
                                                                                aria-label="toggle password visibility"
                                                                                onClick={() => handleClickShowPassword('new_password')}
                                                                                onMouseDown={handleMouseDownPassword}
                                                                                edge="end"
                                                                            >
                                                                                {passwordsState.new_password ? (
                                                                                    <Visibility />
                                                                                ) : (
                                                                                    <VisibilityOff />
                                                                                )}
                                                                            </IconButton>
                                                                        </InputAdornment>
                                                                    </>
                                                                )
                                                            }}
                                                        />
                                                        {touched.new_password && errors.new_password && (
                                                            <FormHelperText error id="standard-weight-helper-text-password-register">
                                                                {' '}
                                                                {errors.new_password}{' '}
                                                            </FormHelperText>
                                                        )}
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <FormControl
                                                        fullWidth
                                                        error={Boolean(
                                                            touched.new_password_confirmation && errors.new_password_confirmation
                                                        )}
                                                    >
                                                        <TextField
                                                            id="outlined-adornment-new_password_confirmation"
                                                            type={passwordsState.new_password_confirmation ? 'text' : 'password'}
                                                            value={values.new_password_confirmation}
                                                            name="new_password_confirmation"
                                                            label="Re-enter New Password"
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                                setFieldTouched('new_password_confirmation', false);
                                                                handleChange(e);
                                                            }}
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <>
                                                                        <InputAdornment position="end">
                                                                            <IconButton
                                                                                aria-label="toggle password visibility"
                                                                                onClick={() =>
                                                                                    handleClickShowPassword('new_password_confirmation')
                                                                                }
                                                                                onMouseDown={handleMouseDownPassword}
                                                                                edge="end"
                                                                            >
                                                                                {passwordsState.new_password_confirmation ? (
                                                                                    <Visibility />
                                                                                ) : (
                                                                                    <VisibilityOff />
                                                                                )}
                                                                            </IconButton>
                                                                        </InputAdornment>
                                                                    </>
                                                                )
                                                            }}
                                                        />
                                                        {touched.new_password_confirmation && errors.new_password_confirmation && (
                                                            <FormHelperText error id="standard-weight-helper-text-password-register">
                                                                {' '}
                                                                {errors.new_password_confirmation}{' '}
                                                            </FormHelperText>
                                                        )}
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    {strength !== 0 && (
                                                        <FormControl fullWidth>
                                                            <Box
                                                                sx={{
                                                                    mb: 2
                                                                }}
                                                            >
                                                                <Grid container spacing={2} alignItems="center">
                                                                    <Grid item>
                                                                        <Box
                                                                            style={{ backgroundColor: level?.color }}
                                                                            sx={{
                                                                                width: 85,
                                                                                height: 8,
                                                                                borderRadius: '7px'
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item>
                                                                        <Typography variant="subtitle1" fontSize="0.75rem">
                                                                            {level?.label}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Box>
                                                        </FormControl>
                                                    )}
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <LoadingButton
                                                        loading={isSubmitting}
                                                        loadingPosition="start"
                                                        type="submit"
                                                        color="primary"
                                                        startIcon={<SaveOutlined />}
                                                        variant="contained"
                                                    >
                                                        {isSubmitting ? 'Updating Profile...' : 'Save'}
                                                    </LoadingButton>
                                                </Grid>
                                            </Grid>
                                        </SubCard>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Formik>
        </>
    );
};

export default SecurityForm;
