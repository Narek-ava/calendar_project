import React, { useEffect } from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Theme,
    Typography
} from '@material-ui/core';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import useScriptRef from 'hooks/useScriptRef';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { strengthColor, strengthIndicator } from 'utils/password-strength';
import { axiosServices } from '../../utils/axios';

// assets
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { StringColorProps } from 'types';
import { useNavigate } from 'react-router-dom';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    loginInput: {
        ...theme.typography.customInput
    }
}));

type PasswordFieldNames = 'password' | 'confirmPassword';

interface PasswordFields {
    password: boolean;
    confirmPassword: boolean;
}

const ResetPasswordForm = ({ ...others }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const scriptedRef = useScriptRef();
    // const [showPassword, setShowPassword] = React.useState(false);
    const [passwordsState, setPasswordState] = React.useState<PasswordFields>({
        password: false,
        confirmPassword: false
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

    return (
        <Formik
            initialValues={{
                password: '',
                confirmPassword: '',
                submit: null
            }}
            validationSchema={Yup.object().shape({
                password: Yup.string().max(255).required('Password is required'),
                confirmPassword: Yup.string().when('password', {
                    is: (val: string) => !!(val && val.length > 0),
                    then: Yup.string().oneOf([Yup.ref('password')], 'Both Password must be match!')
                })
            })}
            onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                try {
                    // @ts-ignore
                    const params = new URL(window.location).searchParams;
                    const token = params.get('token');
                    const email = params.get('email');
                    await axiosServices.post('/reset-password', {
                        email,
                        password: values.password,
                        password_confirmation: values.confirmPassword,
                        token
                    });

                    if (scriptedRef.current) {
                        setStatus({ success: true });
                        setSubmitting(false);
                    }

                    navigate('/login', { replace: true });
                } catch (err: any) {
                    if (scriptedRef.current) {
                        setStatus({ success: false });
                        const { message, errors } = err;
                        setErrors({ submit: message, ...errors });
                        setSubmitting(false);
                    }
                }
            }}
        >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                <form noValidate onSubmit={handleSubmit} {...others}>
                    <FormControl fullWidth error={Boolean(touched.password && errors.password)} className={classes.loginInput}>
                        <InputLabel htmlFor="outlined-adornment-password-reset">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password-reset"
                            type={passwordsState.password ? 'text' : 'password'}
                            value={values.password}
                            name="password"
                            onBlur={handleBlur}
                            // autoComplete="off"
                            onChange={(e) => {
                                handleChange(e);
                                changePassword(e.target.value);
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => handleClickShowPassword('password')}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {passwordsState.password ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            inputProps={{}}
                        />
                    </FormControl>
                    {touched.password && errors.password && (
                        <FormControl fullWidth>
                            <FormHelperText error id="standard-weight-helper-text-reset">
                                {' '}
                                {errors.password}{' '}
                            </FormHelperText>
                        </FormControl>
                    )}
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

                    <FormControl
                        fullWidth
                        error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                        className={classes.loginInput}
                    >
                        <InputLabel htmlFor="outlined-adornment-confirm-password">Confirm Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-confirm-password"
                            type={passwordsState.confirmPassword ? 'text' : 'password'}
                            value={values.confirmPassword}
                            name="confirmPassword"
                            label="Confirm Password"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle confirm-password visibility"
                                        onClick={() => handleClickShowPassword('confirmPassword')}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {passwordsState.confirmPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            inputProps={{}}
                        />
                    </FormControl>

                    {touched.confirmPassword && errors.confirmPassword && (
                        <FormControl fullWidth>
                            <FormHelperText error id="standard-weight-helper-text-confirm-password">
                                {' '}
                                {errors.confirmPassword}{' '}
                            </FormHelperText>
                        </FormControl>
                    )}

                    {errors.submit && (
                        <Box
                            sx={{
                                mt: 3
                            }}
                        >
                            <FormHelperText error>{errors.submit}</FormHelperText>
                        </Box>
                    )}
                    <Box
                        sx={{
                            mt: 1
                        }}
                    >
                        <AnimateButton>
                            <Button
                                disableElevation
                                disabled={isSubmitting}
                                fullWidth
                                size="large"
                                type="submit"
                                variant="contained"
                                color="secondary"
                            >
                                Reset Password
                            </Button>
                        </AnimateButton>
                    </Box>
                </form>
            )}
        </Formik>
    );
};

export default ResetPasswordForm;
