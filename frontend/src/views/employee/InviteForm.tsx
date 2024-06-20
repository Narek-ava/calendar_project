import { useCallback, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { Typography } from '@material-ui/core';
import OptimizedTextField from '../../ui-component/optimized-text-fields/OptimizedTextField';
import { axiosServices } from '../../utils/axios';
import { SnackBarTypes } from '../../store/snackbarReducer';
import { useNavigate } from 'react-router';
import useShowSnackbar from '../../hooks/useShowSnackbar';
import { UserRole } from '../../models/IEmployee';
import { startCase, toLower } from 'lodash';
import employeeAPI from '../../services/EmployeeService';
import CBModal from '../../ui-component/CBModal';

interface InviteFormProps {
    open: boolean;
    onClose: () => void;
}

const InviteForm = ({ open, onClose }: InviteFormProps) => {
    const navigate = useNavigate();
    const { showSnackbar } = useShowSnackbar();

    const [isResend, setIsResend] = useState<boolean>(false);
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const [employeeId, setEmployeeId] = useState<number | null>(null);
    const [isExisting, setIsExisting] = useState<boolean>(false);
    const [existingMessage, setExistingMessage] = useState<string | null>(null);

    const [resendInvite] = employeeAPI.useResendInviteToEmployeeMutation();

    const setDefaults = useCallback(() => {
        setIsResend(false);
        setResendMessage(null);
        setIsExisting(false);
        setExistingMessage(null);
        setEmployeeId(null);
    }, []);

    const close = useCallback(() => {
        setDefaults();
        setSubmitting(false);
        onClose();
        resetForm();
    }, []);

    const checkEmail = useCallback(
        async (email: string) => {
            setDefaults();

            try {
                const checkUserResponse = await axiosServices.post('/employees/check-email', { email });

                if (!checkUserResponse.data.action) {
                    setSubmitting(false);

                    showSnackbar({
                        message: checkUserResponse.data.message || 'Error occurred',
                        alertSeverity: SnackBarTypes.Warning
                    });

                    return;
                }

                switch (checkUserResponse.data.action) {
                    case 'invite_new_user':
                        navigate(`/employee/invite/${email}/false/`, { replace: true });
                        break;
                    case 'invite_existing_user':
                        setIsExisting(true);
                        setExistingMessage(checkUserResponse.data.message);
                        break;
                    case 'resend_invite':
                        setIsResend(true);
                        setEmployeeId(checkUserResponse.data.employee_id);
                        setResendMessage(checkUserResponse.data.message);
                        break;
                    default:
                        setDefaults();
                        break;
                }

                setSubmitting(false);
            } catch (err) {
                showSnackbar({ message: err.message, alertSeverity: SnackBarTypes.Warning });
                setSubmitting(false);
                setDefaults();
            }
        },
        [navigate, showSnackbar]
    );

    const resend = useCallback(
        (email: string) => {
            if (!employeeId) return;

            console.log(employeeId);

            resendInvite({
                id: employeeId,
                email
            })
                .unwrap()
                .then(() => {
                    showSnackbar({ message: 'Employee successfully invited', alertSeverity: SnackBarTypes.Success });
                    close();
                })
                .catch((err) => {
                    showSnackbar({
                        message: err.data || 'Error occurred',
                        alertSeverity: SnackBarTypes.Error
                    });
                    setSubmitting(false);
                });
        },
        [employeeId]
    );

    const inviteExisting = useCallback(async (email: string, role: string) => {
        try {
            const response = await await axiosServices.post('/employees/invite-existing-user', { email, role });
            if (response.data) {
                showSnackbar({ message: 'Employee successfully invited', alertSeverity: SnackBarTypes.Success });
                close();
            }
        } catch (err) {
            showSnackbar({ message: err.message, alertSeverity: SnackBarTypes.Warning });
            setSubmitting(false);
        }
    }, []);

    const { errors, handleBlur, handleSubmit, isSubmitting, touched, values, handleChange, setSubmitting, resetForm } = useFormik({
        enableReinitialize: true,
        validateOnChange: true,
        initialValues: {
            email: '',
            role: UserRole.Manager
        },
        validationSchema: Yup.object().shape({
            email: Yup.string()
                .nullable()
                .max(255, 'Email must be at most 255 characters')
                .email('Must be a valid email')
                .required('Email is required')
        }),
        onSubmit: (formData) => {
            if (isResend) return resend(formData.email);

            if (isExisting) return inviteExisting(formData.email, formData.role);

            return checkEmail(formData.email);
        }
    });

    return (
        <CBModal
            open={open}
            onClose={close}
            fullWidth
            maxWidth="xs"
            title="Invite user"
            onClickOk={handleSubmit}
            okButtonText={isResend ? 'Resend Invitation' : 'Invite'}
            okButtonDisabled={isSubmitting}
        >
            <form noValidate onSubmit={handleSubmit}>
                {!isExisting && (
                    <>
                        <Typography variant="h3" color="primary" mb={2}>
                            Enter User Email
                        </Typography>
                        {resendMessage && <Typography mb={2}>{resendMessage}</Typography>}
                        <FormControl fullWidth>
                            <OptimizedTextField
                                id="email"
                                name="email"
                                placeholder="Email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            {touched.email && errors.email && (
                                <FormHelperText error id="error-email">
                                    {errors.email}
                                </FormHelperText>
                            )}
                        </FormControl>
                    </>
                )}
                {isExisting && (
                    <>
                        <Typography mb={2}>{existingMessage}</Typography>
                        <FormControl fullWidth>
                            <InputLabel id="user-role-label">Role</InputLabel>
                            <Select name="role" value={values.role} label="Role" labelId="user-role-label" onChange={handleChange}>
                                {Object.values(UserRole).map((role) =>
                                    role !== UserRole.Owner ? (
                                        <MenuItem key={`role-${role}`} value={role}>
                                            {startCase(toLower(role))}
                                        </MenuItem>
                                    ) : null
                                )}
                            </Select>
                        </FormControl>
                    </>
                )}
            </form>
        </CBModal>
    );
};

export default InviteForm;
