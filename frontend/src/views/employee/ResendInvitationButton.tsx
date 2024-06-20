import { useState, useCallback } from 'react';
import { IEmployee } from '../../models/IEmployee';
import { SnackBarTypes } from '../../store/snackbarReducer';
import employeeAPI from '../../services/EmployeeService';
import useShowSnackbar from '../../hooks/useShowSnackbar';
import { FormControl, FormHelperText, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Send from '@material-ui/icons/Send';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import OptimizedTextField from '../../ui-component/optimized-text-fields/OptimizedTextField';
import { useNavigate } from 'react-router';
import CBModal from '../../ui-component/CBModal';

interface ResendInvitationButtonProps {
    employee: IEmployee;
}

const ResendInvitationButton = ({ employee }: ResendInvitationButtonProps) => {
    const [showModal, setShowModal] = useState<boolean>(false);

    const [resendInvite, { isLoading }] = employeeAPI.useResendInviteToEmployeeMutation();
    const { showSnackbar } = useShowSnackbar();
    const navigate = useNavigate();

    const processResendInvite = useCallback(
        (email?: string) => {
            resendInvite({
                id: employee.id,
                email
            })
                .unwrap()
                .then(() => {
                    showSnackbar({
                        message: 'Employee successfully invited',
                        alertSeverity: SnackBarTypes.Success
                    });
                    navigate('/employee', { replace: true });
                })
                .catch(() => {
                    showSnackbar({
                        message: "Employee hasn't invited",
                        alertSeverity: SnackBarTypes.Error
                    });
                });
        },
        [employee.id, navigate, resendInvite, showSnackbar]
    );

    const openModal = useCallback(() => {
        setShowModal(true);
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
    }, []);

    const { handleSubmit, values, touched, errors, handleBlur, handleChange } = useFormik({
        enableReinitialize: true,
        initialValues: {
            email: employee.user.email
        },

        validationSchema: Yup.object().shape({
            email: Yup.string().email('Must be a valid email').required('Email is required')
        }),
        onSubmit: (formData) => {
            processResendInvite(formData.email);
        }
    });

    return employee.id && !employee.is_invite_accepted ? (
        <>
            <Stack direction="row" justifyContent="center" mb={3}>
                <LoadingButton loading={isLoading} loadingPosition="start" startIcon={<Send />} variant="outlined" onClick={openModal}>
                    Resend Invitation
                </LoadingButton>
            </Stack>
            <CBModal
                title="Enter user email"
                open={showModal}
                onClose={closeModal}
                fullWidth
                maxWidth="xs"
                closeButtonText="Cancel"
                okButtonText="Resend Invitation"
                onClickOk={handleSubmit}
            >
                <form noValidate onSubmit={handleSubmit}>
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
                            <FormHelperText error id="standard-weight-helper-text--register">
                                {errors.email}
                            </FormHelperText>
                        )}
                    </FormControl>
                </form>
            </CBModal>
        </>
    ) : null;
};

export default ResendInvitationButton;
