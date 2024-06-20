import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// material-ui
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    TextField,
    Typography
} from '@material-ui/core';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import useAuth from 'hooks/useAuth';
// import useScriptRef from 'hooks/useScriptRef';

// assets
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { useNavigate } from 'react-router';
import { regExps } from '../../utils/formValidators';
import config from 'config';
import { useAppSelector } from '../../hooks/redux';

const LoginForm = ({ ...others }) => {
    const location = useLocation();
    const navigate = useNavigate();
    // @ts-ignore
    const fromPage: string = location.state?.pathname || config.defaultPath;
    const { login } = useAuth();
    // const scriptedRef = useScriptRef();
    const [checked, setChecked] = React.useState(true);
    const [showPassword, setShowPassword] = React.useState(false);
    const { email } = useAppSelector((state) => state.userInvitation);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event: React.SyntheticEvent) => {
        event.preventDefault();
    };

    return (
        <Formik
            initialValues={{
                email: email || '',
                password: '',
                submit: null
            }}
            validationSchema={Yup.object().shape({
                email: Yup.string()
                    .nullable()
                    .max(255, 'Email must be at most 255 characters')
                    .email('Must be a valid email')
                    .required('Email is required'),
                password: Yup.string()
                    .nullable()
                    .min(8, 'Password must be at least 8 characters length ')
                    .max(255, 'Password must be at most 255 characters')
                    .required('Password is required')
                    .matches(regExps.password, 'Must be a valid password')
            })}
            onSubmit={async (values, { setErrors, setSubmitting }) => {
                try {
                    await login(values.email.toLowerCase(), values.password);
                    setSubmitting(false);
                    navigate(fromPage, { replace: true });
                    // dispatch(clearUserInvitationData());
                } catch (err: any) {
                    const { message, errors } = err;
                    setErrors({ submit: message, ...errors });
                    setSubmitting(false);
                }
            }}
            validateOnChange
        >
            {({ errors, handleBlur, handleSubmit, handleChange, isSubmitting, touched, values, setFieldTouched }) => (
                <form noValidate onSubmit={handleSubmit} {...others}>
                    <FormControl fullWidth error={Boolean(touched.email && errors.email)}>
                        <TextField
                            sx={{ mb: 3 }}
                            fullWidth
                            name="email"
                            label="Email"
                            value={values.email}
                            onBlur={handleBlur}
                            onChange={(event) => {
                                handleChange(event);
                                setFieldTouched('email', false);
                            }}
                            error={Boolean(touched.email && errors.email)}
                            // helperText={touched.email && errors.email}
                        />
                    </FormControl>

                    <FormControl fullWidth error={Boolean(touched.password && errors.password)}>
                        <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password-login"
                            type={showPassword ? 'text' : 'password'}
                            value={values.password}
                            name="password"
                            onBlur={handleBlur}
                            onChange={(event) => {
                                handleChange(event);
                                setFieldTouched('password', false);
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            inputProps={{}}
                            label="Password"
                        />
                        {/* {touched.password && errors.password && (
                            <FormHelperText error id="standard-weight-helper-text-password-login">
                                {' '}
                                {errors.password}{' '}
                            </FormHelperText>
                        )} */}
                    </FormControl>

                    <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checked}
                                        onChange={(event) => setChecked(event.target.checked)}
                                        name="checked"
                                        color="primary"
                                    />
                                }
                                label="Keep me logged in"
                            />
                        </Grid>
                        <Grid item>
                            <Typography
                                variant="subtitle1"
                                component={Link}
                                to="/forgot-password"
                                color="secondary"
                                sx={{ textDecoration: 'none' }}
                            >
                                Forgot Password?
                            </Typography>
                        </Grid>
                    </Grid>

                    {(errors.submit || errors.password || errors.email) && (
                        <Box
                            sx={{
                                mt: 3
                            }}
                        >
                            <FormHelperText error>
                                {errors.submit || (touched.email && errors.email) || (touched.password && errors.password)}
                            </FormHelperText>
                        </Box>
                    )}
                    <Box
                        sx={{
                            mt: 2
                        }}
                    >
                        <AnimateButton>
                            <Button color="secondary" disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
                                Sign In
                            </Button>
                        </AnimateButton>
                    </Box>
                </form>
            )}
        </Formik>
    );
};

export default LoginForm;
