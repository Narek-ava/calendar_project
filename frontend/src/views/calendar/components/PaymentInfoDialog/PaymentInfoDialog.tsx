import { useMemo } from 'react';
import { Grid, TextField, FormControl } from '@mui/material';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { MobileDatePicker, LocalizationProvider } from '@mui/lab';
import PaymentInfoSelect from './components/PaymentInfoSelect';
import { IPayment } from '../../../../models/IPayment';
import { methodOptions, reasonOptions } from './PaymentInfoSelectOptions';
import MomentAdapter from '@mui/lab/AdapterMoment';
import momentTimezone from 'moment-timezone';
import CBModal from '../../../../ui-component/CBModal';

interface PaymentInfoDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payment: IPayment) => void;
    locationTimezone: string;
    payment?: IPayment | null;
}

const PaymentInfoDialog = ({ open, onClose, onSubmit, locationTimezone, payment }: PaymentInfoDialogProps) => {
    const { moment } = new MomentAdapter({ instance: momentTimezone });

    const formInitialValues = useMemo(
        () =>
            payment
                ? { ...payment } // clone object to make props mutable
                : {
                      datetime: moment().tz(locationTimezone).toString(),
                      method: '',
                      reason: '',
                      amount: 0
                  },
        [locationTimezone, moment, payment]
    );

    const validationSchema = Yup.object().shape({
        datetime: Yup.string().required('Date field is required'),
        method: Yup.string().required('Payment method is required'),
        reason: Yup.string().required('Payment reason is required'),
        amount: Yup.number().required('Payment amount is required').min(0.01)
    });

    const { handleSubmit, values, touched, errors, handleChange, setFieldTouched, setFieldValue, resetForm } = useFormik({
        initialValues: formInitialValues,
        enableReinitialize: true,
        validateOnChange: true,
        validationSchema,
        onSubmit: (formData) => {
            formData.datetime = moment(formData.datetime).tz('UTC').toString();
            onSubmit(formData);
            resetForm();
            onClose();
        }
    });

    return (
        <CBModal open={open} onClose={onClose} fullWidth maxWidth="sm" title="Add payment" onClickOk={handleSubmit} okButtonText="Save">
            <form noValidate onSubmit={handleSubmit} id="payment-info-form">
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl fullWidth error={Boolean(touched.datetime && errors.datetime)}>
                            <LocalizationProvider dateAdapter={MomentAdapter}>
                                <MobileDatePicker
                                    label="Date"
                                    inputFormat="MM/DD/YY"
                                    mask="MM/DD/YY"
                                    value={values.datetime}
                                    onChange={(value) => {
                                        if (value) {
                                            setFieldValue('datetime', value);
                                        }
                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                    disableCloseOnSelect={false}
                                />
                            </LocalizationProvider>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <PaymentInfoSelect
                            touched={touched}
                            errors={errors}
                            values={values}
                            handleChange={handleChange}
                            setFieldTouched={setFieldTouched}
                            fieldName="method"
                            label="Method"
                            options={methodOptions}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <PaymentInfoSelect
                            touched={touched}
                            errors={errors}
                            values={values}
                            handleChange={handleChange}
                            setFieldTouched={setFieldTouched}
                            fieldName="reason"
                            label="Type"
                            options={reasonOptions}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <TextField
                                error={Boolean(touched.amount && errors.amount)}
                                name="amount"
                                value={values.amount}
                                label="Amount"
                                type="number"
                                inputProps={{ step: '0.01', min: '0.01' }}
                                onChange={(event) => {
                                    handleChange(event);
                                    setFieldTouched('amount', false);
                                }}
                            />
                        </FormControl>
                    </Grid>
                </Grid>
            </form>
        </CBModal>
    );
};

export default PaymentInfoDialog;
