// material-ui
import { Grid, LinearProgress, Stack } from '@material-ui/core';
import { FormControl, Typography } from '@mui/material';
import Transitions from '../../../../ui-component/extended/Transitions';

// project imports
import { IWidgetUser, IWidgetDeposit, UserFormProps, WizardStates } from '../types';
import { useAppDispatch } from '../../../../hooks/redux';

// third-party
import * as Yup from 'yup';
import { FormikValues, useFormik } from 'formik';
import React, { useState, useCallback } from 'react';
import OptimizedTextField from '../../../../ui-component/optimized-text-fields/OptimizedTextField';
import OptimizedMaskedTextField from '../../../../ui-component/optimized-text-fields/OptimizedMaskedTextField';
import AttachmentsUpload from '../../../../ui-component/file-uploader-preview/AttachmentsUpload';
import { checkFilesErrors, uploadImagesAndSubmit } from '../../../../utils/functions/uploading-images-helpers';
import ToggledTooltipWithTitle from '../../../../ui-component/tooltips/ToggledTooltipWithTitle';
import StepTitle from '../../components/StepTitle';
import { styled } from '@material-ui/core/styles';
import { axiosServices } from '../../../../utils/axios';
import { startSubmitting, stopSubmitting } from '../../../../store/slices/SubmittingSlice';
import { SnackBarTypes } from '../../../../store/snackbarReducer';
import useShowSnackbar from '../../../../hooks/useShowSnackbar';
import { setDeposit, setNoShowDeposit } from '../../../../store/slices/widgetSlice';

interface UserValuesProps {
    user: WizardStates['userData'];
}

const getInitialValues = ({ user }: UserValuesProps) => {
    const newUser: IWidgetUser = {
        email: '',
        firstname: '',
        lastname: '',
        phone: '',
        note: ''
    };

    if (user) {
        return {
            user
            // loginEmail: ''
            // modalOpened: false
        };
    }

    return {
        user: newUser
        // loginEmail: ''
        // modalOpened: false
    };
};

const userSchema = Yup.object().shape(
    {
        firstname: Yup.string().max(255).required('First Name is required'),
        lastname: Yup.string().max(255).required('Last Name is required'),
        email: Yup.string()
            .nullable()
            .max(255, 'Email must be at most 255 characters')
            .email('Must be a valid email')
            .when('phone', {
                is: (phone: string) => !phone || phone.length === 0,
                then: Yup.string().nullable().required('Email or Phone is required')
            }),
        phone: Yup.string()
            .nullable()
            .min(10, 'Phone number is not valid')
            .when('email', {
                is: (email: string) => !email || email.length === 0,
                then: Yup.string().nullable().required('Phone or Email is required')
            }),
        note: Yup.string().nullable()
    },
    [['email', 'phone']]
);

const StyledAttachmentsUpload = styled('div')(({ theme }) => ({
    '& div ': {
        borderColor: theme.palette.widget.green
    },
    '& .MuiButton-root': {
        color: theme.palette.widget.green
    }
}));

const UserForm = ({
    step,
    userData,
    setUserData,
    handleNext,
    attachments,
    setAttachments,
    attachmentsIdsToDelete,
    setAttachmentsIdsToDelete,
    isMobile,
    handleBack,
    addProgress,
    submitted,
    company,
    service,
    submitBooking
}: UserFormProps) => {
    const dispatch = useAppDispatch();
    const { showSnackbar } = useShowSnackbar();
    const [error, setError] = useState('');

    const { handleSubmit, values, touched, errors, handleBlur, handleChange, setFieldTouched, setFieldError } = useFormik({
        validateOnChange: true,
        initialValues: getInitialValues({ user: userData }),
        validationSchema: Yup.object().shape({
            user: userSchema
        }),
        onSubmit: (formData) => {
            if (checkFilesErrors(attachments) && !error) {
                dispatch(startSubmitting());

                uploadImagesAndSubmit({
                    attachments,
                    submitCb: (urls) => {
                        validateUserData(urls, formData);
                    },
                    updateAttachmentsCb: (files) => setAttachments(files),
                    imagesToDelete: attachmentsIdsToDelete,
                    uploadingErrorCb: (e) => {
                        showSnackbar({
                            message: e.message,
                            alertSeverity: SnackBarTypes.Error
                        });
                        dispatch(stopSubmitting());
                    },
                    deletingImagesErrorCb: (e) => {
                        showSnackbar({
                            message: e.message,
                            alertSeverity: SnackBarTypes.Error
                        });
                        dispatch(stopSubmitting());
                    }
                });
            }
        }
    });

    const validateUserData = useCallback(
        (urls: string[], formData: FormikValues) => {
            axiosServices
                .post(`/public/company/${company.slug}/appointment/validate-customer-info`, {
                    user: formData.user,
                    images: urls,
                    service_id: service?.id
                })
                .then((response: { data: { deposit: IWidgetDeposit; no_show_deposit: IWidgetDeposit } }) => {
                    const user = { ...formData.user, email: formData.user.email?.toLowerCase() };
                    setUserData(user);
                    dispatch(setDeposit(response.data.deposit));
                    dispatch(setNoShowDeposit(response.data.no_show_deposit));
                    dispatch(stopSubmitting());
                    if (response.data.deposit.required || response.data.no_show_deposit.required) {
                        addProgress(step);
                        handleNext();
                    } else {
                        submitBooking(null, user);
                    }
                })
                .catch((err) => {
                    if (err.errors) {
                        Object.entries(err.errors).forEach((entry) => {
                            const [field, fieldErrors] = entry;
                            if (Array.isArray(fieldErrors)) setFieldError(field, fieldErrors.join('; '));
                        });
                    }

                    if (err.exception) {
                        showSnackbar({ message: err.message, alertSeverity: SnackBarTypes.Error });
                    }

                    dispatch(stopSubmitting());
                });
        },
        [company, dispatch, setFieldError]
    );

    return (
        <Transitions type="fade" in>
            <StepTitle error={!!errors.user} title="Client Info" step={step} handleBack={handleBack} submitted={submitted} />
            <form noValidate onSubmit={handleSubmit} id={`widget-form-${step}`}>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12}>
                        <Grid container spacing={2} direction="row">
                            <Grid item xs={isMobile ? 12 : 6}>
                                <FormControl fullWidth error={Boolean(touched.user?.firstname && errors.user?.firstname)}>
                                    <OptimizedTextField
                                        fullWidth
                                        id="user.firstname"
                                        name="user.firstname"
                                        label="First Name"
                                        value={values.user.firstname}
                                        onBlur={handleBlur}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            handleChange(e);
                                            setFieldTouched('user.firstname', false);
                                        }}
                                        error={Boolean(touched.user?.firstname && errors.user?.firstname)}
                                        helperText={touched.user?.firstname && errors.user?.firstname}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={isMobile ? 12 : 6}>
                                <FormControl fullWidth error={Boolean(touched.user?.lastname && errors.user?.lastname)}>
                                    <OptimizedTextField
                                        fullWidth
                                        id="user.lastname"
                                        name="user.lastname"
                                        label="Last Name"
                                        value={values.user.lastname}
                                        onBlur={handleBlur}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            handleChange(e);
                                            setFieldTouched('user.lastname', false);
                                        }}
                                        error={Boolean(touched.user?.lastname && errors.user?.lastname)}
                                        helperText={touched.user?.lastname && errors.user?.lastname}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={isMobile ? 12 : 6}>
                                <FormControl fullWidth error={Boolean(touched.user?.email && errors.user?.email)}>
                                    <OptimizedTextField
                                        fullWidth
                                        id="user.email"
                                        name="user.email"
                                        label="Email"
                                        value={values.user.email}
                                        onBlur={handleBlur}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            handleChange(e);
                                            setFieldTouched('user.email', false);
                                        }}
                                        error={Boolean(touched.user?.email && errors.user?.email)}
                                        helperText={touched.user?.email && errors.user?.email}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={isMobile ? 12 : 6}>
                                <FormControl fullWidth error={Boolean(touched.user?.phone && errors.user?.phone)}>
                                    <OptimizedMaskedTextField
                                        fullWidth
                                        id="user.phone"
                                        name="user.phone"
                                        label="Phone"
                                        value={values.user.phone}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            handleChange(e);
                                            setFieldTouched('user.phone', false);
                                        }}
                                        onBlur={handleBlur}
                                        error={Boolean(touched.user?.phone && errors.user?.phone)}
                                        helperText={touched.user?.phone && errors.user?.phone}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth error={Boolean(touched.user?.note && errors.user?.note)}>
                                            <OptimizedTextField
                                                fullWidth
                                                id="user.note"
                                                name="user.note"
                                                rows={2}
                                                multiline
                                                label="Note"
                                                value={values.user.note}
                                                onBlur={handleBlur}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    handleChange(e);
                                                    setFieldTouched('user.note', false);
                                                }}
                                                error={Boolean(touched.user?.note && errors.user?.note)}
                                                helperText={touched.user?.note && errors.user?.note}
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid>
                            {company.settings.widget.is_attachments_enabled && (
                                <Grid item xs={12}>
                                    <ToggledTooltipWithTitle
                                        title="Attachments:"
                                        tooltipText={
                                            <Stack>
                                                <Typography>Max image size: 20mb</Typography>
                                                <Typography>Limit of images to upload : 5</Typography>
                                                <Typography>Accepted formats: jpg, jpeg, png, bmp, gif</Typography>
                                            </Stack>
                                        }
                                    />
                                    <StyledAttachmentsUpload>
                                        <AttachmentsUpload
                                            disableFileEdit
                                            matchSm={isMobile}
                                            attachments={attachments}
                                            setAttachments={setAttachments}
                                            error={error}
                                            setError={setError}
                                            attachmentsIdsToDelete={attachmentsIdsToDelete}
                                            setAttachmentsIdsToDelete={setAttachmentsIdsToDelete}
                                        />
                                    </StyledAttachmentsUpload>
                                    {error && (
                                        <div>
                                            <LinearProgress color="error" variant="determinate" value={100} />
                                            <Typography color="error">{error}</Typography>
                                        </div>
                                    )}
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </Transitions>
    );
};

export default UserForm;
