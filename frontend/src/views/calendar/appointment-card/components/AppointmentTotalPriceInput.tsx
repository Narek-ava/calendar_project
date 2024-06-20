import { useState, useCallback } from 'react';
import { IAppointment } from '../../../../models/IAppointment';
import { Box, Typography, IconButton, TextField } from '@material-ui/core';
import Edit from '@material-ui/icons/Edit';
import Save from '@material-ui/icons/Save';
import Cancel from '@material-ui/icons/Cancel';
import { useAppDispatch } from '../../../../hooks/redux';
import { startSubmitting, stopSubmitting } from '../../../../store/slices/SubmittingSlice';
import useAppointmentFunctions from '../../components/hooks/useAppointmentFunctions';
import appointmentAPI from '../../../../services/AppointmentService';
import { PaymentType } from '../../../../models/IService';
import useShowSnackbar from '../../../../hooks/useShowSnackbar';
import { SnackBarTypes } from '../../../../store/snackbarReducer';
import { styled } from '@material-ui/core/styles';

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: '16px',
    flexShrink: 0
}));

interface AppointmentTotalPriceInputProps {
    appointment: IAppointment;
}

const AppointmentTotalPriceInput = ({ appointment }: AppointmentTotalPriceInputProps) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [total, setTotal] = useState<number>(appointment.price ? parseFloat(appointment.price) : 0);
    const dispatch = useAppDispatch();
    const { formatAppointmentPayload } = useAppointmentFunctions();
    const { showSnackbar } = useShowSnackbar();
    const [updateAppointment] = appointmentAPI.useUpdateAppointmentMutation();

    const toggleIsEditing = useCallback(() => {
        setIsEditing(!isEditing);
    }, [isEditing, setIsEditing]);

    const saveAppointment = useCallback(() => {
        dispatch(startSubmitting());
        const data = formatAppointmentPayload(appointment);
        data.price = total;

        updateAppointment({ appointmentId: appointment.id.toString(), data })
            .unwrap()
            .then(() => {
                setIsEditing(false);
                dispatch(stopSubmitting());
            })
            .catch((e) => {
                dispatch(stopSubmitting());
                showSnackbar({
                    message: e.data || "Appointment hasn't been Updated",
                    alertSeverity: SnackBarTypes.Error
                });
            });
    }, [appointment, dispatch, formatAppointmentPayload, showSnackbar, total, updateAppointment]);

    return appointment.payment_type !== PaymentType.Free ? (
        <>
            {isEditing ? (
                <Box display="flex" alignItems="center">
                    <IconButton onClick={saveAppointment} size="small" color="success" title="Save">
                        <Save />
                    </IconButton>
                    <IconButton onClick={toggleIsEditing} size="small" color="error" title="Cancel">
                        <Cancel />
                    </IconButton>
                    <Box ml={1} display="flex" alignItems="center">
                        <strong>$</strong>
                        <TextField
                            sx={{ width: '100px' }}
                            type="number"
                            variant="standard"
                            inputProps={{
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                                step: '0.01',
                                min: '0.00'
                            }}
                            value={total}
                            onChange={(e) => {
                                setTotal(parseFloat(e.target.value));
                            }}
                        />
                    </Box>
                </Box>
            ) : (
                <Box display="flex" alignItems="center">
                    <IconButton onClick={toggleIsEditing} size="small" color="primary" title="Edit">
                        <Edit />
                    </IconButton>
                    <StyledTypography variant="h4">${appointment.price}</StyledTypography>
                </Box>
            )}
        </>
    ) : (
        <StyledTypography variant="h4">FREE</StyledTypography>
    );
};

export default AppointmentTotalPriceInput;
