import { Button, Grid, Stack, TextField } from '@material-ui/core';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import InputMask from 'react-input-mask';
import { IPersonalInfo } from './types';

interface PersonalInfoFormProps {
    personalInfo: IPersonalInfo;
    setPersonalInfo: (d: IPersonalInfo) => void;
    handleNext: () => void;
    setErrorIndex: (i: number | null) => void;
    errors: { [key: string]: any };
    setErrors: (errors: { [key: string]: any }) => void;
}

const PersonalInfoForm = ({ personalInfo, setPersonalInfo, handleNext, setErrorIndex, errors, setErrors }: PersonalInfoFormProps) => {
    const phoneRegExp = /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/;

    const validationSchema = Yup.object({
        firstname: Yup.string().max(255, 'firstname must be at most 255 characters').required('First name is required'),
        lastname: Yup.string().max(255, 'lastname must be at most 255 characters').required('Last name is required'),
        phone: Yup.string().required('Phone number is required').matches(phoneRegExp, 'Phone number is not valid'),
        email: Yup.string()
            .email('Must be a valid email')
            .max(255, 'Email must be at most 255 characters')
            .email('Must be a valid email')
            .required('Email is required'),
        password: Yup.string()
            .max(255, 'Password must be at most 255 characters')
            .min(8, 'Password must be at least 8 characters length')
            .required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Password confirmation is required')
    });

    const formik = useFormik({
        initialValues: {
            firstname: personalInfo.firstname,
            lastname: personalInfo.lastname,
            phone: personalInfo.phone,
            email: personalInfo.email,
            password: personalInfo.password,
            confirmPassword: personalInfo.confirmPassword
        },
        initialErrors: errors,
        initialTouched: errors,
        validationSchema,
        onSubmit: (values) => {
            setPersonalInfo(values);
            setErrors({});
            handleNext();
        }
    });

    return (
        <>
            <form onSubmit={formik.handleSubmit} id="personal-info-form">
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="firstname"
                            name="firstname"
                            label="First Name"
                            defaultValue={formik.values.firstname}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.firstname && formik.errors.firstname)}
                            helperText={formik.touched.firstname && formik.errors.firstname}
                            onBlur={formik.handleBlur}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="lastname"
                            name="lastname"
                            label="Last Name"
                            defaultValue={formik.values.lastname}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.lastname && formik.errors.lastname)}
                            helperText={formik.touched.lastname && formik.errors.lastname}
                            onBlur={formik.handleBlur}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <InputMask
                            mask="(999) 999-9999"
                            defaultValue={formik.values.phone}
                            onChange={(event) => {
                                formik.handleChange(event);
                                formik.setFieldTouched('phone', false);
                            }}
                            onBlur={formik.handleBlur}
                        >
                            <TextField
                                id="phone"
                                name="phone"
                                label="Phone *"
                                error={Boolean(formik.touched.phone && formik.errors.phone)}
                                helperText={formik.touched.phone && formik.errors.phone}
                                fullWidth
                            />
                        </InputMask>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="email"
                            name="email"
                            label="Email"
                            defaultValue={formik.values.email}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.email && formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            onBlur={formik.handleBlur}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            type="password"
                            id="password"
                            name="password"
                            label="Password"
                            defaultValue={formik.values.password}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.password && formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            onBlur={formik.handleBlur}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            label="Confirm Password"
                            defaultValue={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            onBlur={formik.handleBlur}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Stack direction="row" justifyContent="flex-end">
                            <AnimateButton>
                                <Button variant="contained" sx={{ my: 3, ml: 1 }} type="submit" onClick={() => setErrorIndex(0)}>
                                    Next
                                </Button>
                            </AnimateButton>
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </>
    );
};

export default PersonalInfoForm;
