// material-ui
import { makeStyles } from '@material-ui/styles';
import { Box, Button, FormControl, FormHelperText, InputLabel, OutlinedInput, Theme } from '@material-ui/core';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import useScriptRef from 'hooks/useScriptRef';
import { axiosServices } from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    loginInput: {
        ...theme.typography.customInput
    }
}));

const ForgotPasswordForm = ({ ...others }) => {
    const navigate = useNavigate();
    const classes = useStyles();
    const scriptedRef = useScriptRef();

    return (
        <Formik
            initialValues={{
                email: '',
                submit: null
            }}
            validationSchema={Yup.object().shape({
                email: Yup.string()
                    .nullable()
                    .max(255, 'Email must be at most 255 characters')
                    .email('Must be a valid email')
                    .required('Email is required')
            })}
            onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                try {
                    await axiosServices.post('/forgot-password', { ...values, email: values.email.toLowerCase() });

                    if (scriptedRef.current) {
                        setStatus({ success: true });
                        setSubmitting(false);
                    }

                    navigate('/check-mail', { replace: true });
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
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldTouched }) => (
                <form noValidate onSubmit={handleSubmit} {...others}>
                    <FormControl fullWidth error={Boolean(touched.email && errors.email)} className={classes.loginInput}>
                        <InputLabel htmlFor="outlined-adornment-email-forgot">Email Address</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-email-forgot"
                            type="email"
                            value={values.email}
                            name="email"
                            onBlur={handleBlur}
                            onChange={(event) => {
                                handleChange(event);
                                setFieldTouched('email', false);
                            }}
                            label="Email Address / Username"
                            inputProps={{}}
                        />
                        {/*
                        {touched.email && errors.email && (
                            <FormHelperText error id="standard-weight-helper-text-email-forgot">
                                {' '}
                                {errors.email}{' '}
                            </FormHelperText>
                        )}
                        */}
                    </FormControl>

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
                            mt: 2
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
                                Send Mail
                            </Button>
                        </AnimateButton>
                    </Box>
                </form>
            )}
        </Formik>
    );
};

export default ForgotPasswordForm;
