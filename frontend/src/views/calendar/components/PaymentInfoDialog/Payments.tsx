import { useState, useCallback, useMemo } from 'react';
import { Grid, Button, Typography } from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import PaymentsTable from './PaymentsTable';
import PaymentInfoDialog from './PaymentInfoDialog';
import { IAppointment } from '../../../../models/IAppointment';
import { IPayment } from '../../../../models/IPayment';
import appointmentAPI from '../../../../services/AppointmentService';
import { startSubmitting, stopSubmitting } from '../../../../store/slices/SubmittingSlice';
import { SnackBarTypes } from '../../../../store/snackbarReducer';
import { useAppDispatch } from '../../../../hooks/redux';
import useShowSnackbar from '../../../../hooks/useShowSnackbar';
import { openConfirmPopup } from '../../../../store/confirmPopupSlice';

interface PaymentsProps {
    appointment: IAppointment;
}

const Payments = ({ appointment }: PaymentsProps) => {
    const [openFormModal, setOpenFormModal] = useState<boolean>(false);
    const [paymentForEdit, setPaymentForEdit] = useState<IPayment | null>(null);
    const [editedPaymentIndex, setEditedPaymentIndex] = useState<number | null>(null);
    const dispatch = useAppDispatch();
    const { showSnackbar } = useShowSnackbar();

    const openModal = useCallback(() => {
        setOpenFormModal(true);
    }, [setOpenFormModal]);

    const closeModal = useCallback(() => {
        setOpenFormModal(false);
        setPaymentForEdit(null);
        setEditedPaymentIndex(null);
    }, [setOpenFormModal, setPaymentForEdit, setEditedPaymentIndex]);

    const [updateAppointmentPayments] = appointmentAPI.useUpdateAppointmentPaymentsMutation();

    const savePayments = useCallback(
        (data: IPayment[]) => {
            dispatch(startSubmitting());
            updateAppointmentPayments({ appointmentId: appointment.id.toString(), data: { payments: data } })
                .unwrap()
                .then(() => {
                    dispatch(stopSubmitting());
                })
                .catch((e) => {
                    dispatch(stopSubmitting());
                    showSnackbar({
                        message: e.data || "Payment hasn't been Updated",
                        alertSeverity: SnackBarTypes.Error
                    });
                });
        },
        [appointment.id, dispatch, showSnackbar, updateAppointmentPayments]
    );

    // make new immutable copy of appointment.payments
    const mutablePayments = useMemo(() => (appointment.payments ? appointment.payments.concat() : []), [appointment.payments]);

    const updatePayments = useCallback(
        (payment: IPayment) => {
            if (editedPaymentIndex !== null) {
                const paymentsData = mutablePayments;
                paymentsData.splice(editedPaymentIndex, 1, payment);
                savePayments(paymentsData);
            } else {
                savePayments(appointment.payments ? [...appointment.payments, payment] : [payment]);
            }
        },
        [appointment, editedPaymentIndex, mutablePayments, savePayments]
    );

    const onEdit = useCallback(
        (payment: IPayment, index: number) => {
            setPaymentForEdit(payment);
            setEditedPaymentIndex(index);
            setOpenFormModal(true);
        },
        [setPaymentForEdit, setEditedPaymentIndex, setOpenFormModal]
    );

    const deletePayment = useCallback(
        (index: number) => {
            dispatch(
                openConfirmPopup({
                    onConfirm: () => {
                        const paymentsData = mutablePayments;
                        paymentsData.splice(index, 1);
                        savePayments(paymentsData);
                    },
                    confirmText: `Delete`,
                    text: `Are you sure you want to delete this payment?`
                })
            );
        },
        [dispatch, mutablePayments, savePayments]
    );

    return (
        <>
            <Grid container justifyContent="space-between" mb={1}>
                <Typography variant="h4" my={1}>
                    Payments
                </Typography>
                <Button variant="outlined" startIcon={<Add />} onClick={openModal}>
                    Payment
                </Button>
            </Grid>
            <PaymentsTable
                payments={appointment.payments}
                timezone={appointment.location.time_zone}
                onClickRow={onEdit}
                onDelete={deletePayment}
            />
            <PaymentInfoDialog
                open={openFormModal}
                onClose={closeModal}
                onSubmit={updatePayments}
                locationTimezone={appointment.location.time_zone}
                payment={paymentForEdit}
            />
        </>
    );
};

export default Payments;
