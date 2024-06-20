import { useCallback, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import valid from 'card-validator';
import InputMask from 'react-input-mask';
import { Button, FormControl, Grid, TextField } from '@mui/material';
import moment from 'moment';
import { PaymentGateways } from '../../../../../../types';
import CreditCard from '@material-ui/icons/CreditCard';
import { IService } from '../../../../../../models/IService';
import { WizardStates } from '../../../types';
import { IWidgetCompany } from '../../../../../../models/ICompany';
import PaymentTitle from '../../../../components/PaymentTitle';
import usePayButtonText from '../../../../hooks/usePayButtonText';
import CBModal from '../../../../../../ui-component/CBModal';
import { Typography, useMediaQuery } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';

interface AuthorizeNetFormProps {
    service: IService;
    date: WizardStates['dateData'];
    submitBooking: (details?: object) => void;
    company: IWidgetCompany;
    location: WizardStates['locationData'];
}

const AuthorizeNetForm = ({ service, date, submitBooking, company, location }: AuthorizeNetFormProps) => {
    const matchSm = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('sm'));
    const [showModal, setShowModal] = useState<boolean>(false);

    const { payButtonTitle } = usePayButtonText({ company, paymentGateway: PaymentGateways.AuthorizeNet });

    const { handleSubmit, values, touched, errors, handleBlur, handleChange, setFieldTouched, setFieldValue, resetForm } = useFormik({
        validateOnChange: true,
        initialValues: {
            cardHolderName: '',
            cardNumber: '',
            expDate: '',
            cardCode: '',
            address: {
                city: '',
                state: '',
                postal_code: '',
                l1: '',
                country: 'USA'
            }
        },
        validationSchema: Yup.object().shape({
            cardHolderName: Yup.string().required('Card holder name is required'),
            cardNumber: Yup.string()
                .test('test-number', 'Credit card number is invalid', (value) => valid.number(value).isValid)
                .required(),
            expDate: Yup.string()
                .required('Expiry date is required')
                .test('test-valid-exp-date', 'Expiry date is invalid', (value) => {
                    const expDate = moment(value, 'MM/YY');
                    return expDate.isValid();
                })
                .test('test-exp-date', 'Expiry date cannot be in the past', (value) => {
                    const expDate = moment(value, 'MM/YY');
                    return expDate.isSameOrAfter(moment().format(), 'month');
                }),
            cardCode: Yup.string()
                .required('CVV is required')
                .matches(/^[0-9]+$/, 'Must be only digits')
                .min(3, 'Must be at least 3 digits'),
            address: Yup.object().shape({
                city: Yup.string().required('City is required'),
                state: Yup.string().required('State is required'),
                postal_code: Yup.string().required('Postal code is required'),
                l1: Yup.string().required('Address is required')
            })
        }),
        onSubmit: (formData) => {
            const expDate = formData.expDate.split('/');
            submitBooking({
                ...formData,
                gateway: PaymentGateways.AuthorizeNet,
                month: expDate[0],
                year: expDate[1],
                address: { ...formData.address, address: Object.values(formData.address).join(', ') }
            });
        }
    });

    const openModal = useCallback(() => {
        setShowModal(true);
    }, [setShowModal]);

    const closeModal = useCallback(() => {
        setShowModal(false);
        resetForm();
    }, [setShowModal, resetForm]);

    // change card number input mask in case of entering of Amex card number (starting with 34 or 37)
    const creditCardMask = useMemo(() => (/^3[47]/.test(values.cardNumber) ? '9999 9999 9999 999' : '9999 9999 9999 9999'), [
        values.cardNumber
    ]);

    return (
        <>
            <Button
                onClick={openModal}
                fullWidth
                variant="contained"
                color="primary"
                sx={{ height: '45px', mb: 1.5 }}
                startIcon={<CreditCard />}
            >
                Credit Card
            </Button>
            <CBModal
                title={<PaymentTitle service={service} date={date} location={location} />}
                open={showModal}
                onClose={closeModal}
                fullWidth
                maxWidth="sm"
                okButtonText={payButtonTitle()}
                onClickOk={handleSubmit}
                fullScreen={matchSm}
                id="authorize-modal"
            >
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={6}>
                            <TextField
                                id="card-holder-name"
                                name="cardHolderName"
                                label="Card Holder Name"
                                value={values.cardHolderName}
                                onChange={handleChange}
                                error={Boolean(touched?.cardHolderName && errors?.cardHolderName)}
                                helperText={touched?.cardHolderName && errors?.cardHolderName}
                                onBlur={handleBlur}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl fullWidth error={Boolean(touched.cardNumber && errors.cardNumber)}>
                                <InputMask
                                    mask={creditCardMask}
                                    value={values.cardNumber}
                                    onChange={(event) => {
                                        setFieldValue('cardNumber', event.target.value.replace('_', ''));
                                        setFieldTouched('cardNumber', false);
                                    }}
                                    onBlur={handleBlur}
                                >
                                    <TextField
                                        fullWidth
                                        id="cardNumber"
                                        name="cardNumber"
                                        label="Card Number"
                                        error={Boolean(touched.cardNumber && errors.cardNumber)}
                                        helperText={touched.cardNumber && errors.cardNumber}
                                    />
                                </InputMask>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <InputMask
                                mask="99/99"
                                value={values.expDate}
                                maskPlaceholder="MM/YY"
                                onChange={(event) => {
                                    setFieldValue('expDate', event.target.value);
                                    setFieldTouched('expDate', false);
                                }}
                                onBlur={handleBlur}
                            >
                                <TextField
                                    fullWidth
                                    id="exp-date"
                                    name="expDate"
                                    label="Card Expiry Date"
                                    error={Boolean(touched?.expDate && errors?.expDate)}
                                    helperText={touched?.expDate && errors?.expDate}
                                />
                            </InputMask>
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl fullWidth error={Boolean(touched.cardCode && errors.cardCode)}>
                                <TextField
                                    fullWidth
                                    id="cardCode"
                                    name="cardCode"
                                    label="CVV Code"
                                    value={values.cardCode}
                                    onBlur={handleBlur}
                                    onChange={(event) => {
                                        setFieldValue('cardCode', event.target.value.replace(/\D/g, '').slice(0, 4));
                                    }}
                                    error={Boolean(touched.cardCode && errors.cardCode)}
                                    helperText={touched.cardCode && errors.cardCode}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography align="center" variant="h5" color="primary">
                                Billing Address
                            </Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                id="address-address-line-1"
                                name="address.l1"
                                label="Address"
                                value={values.address?.l1}
                                onChange={handleChange}
                                error={Boolean(touched.address?.l1 && errors.address?.l1)}
                                helperText={touched.address?.l1 && errors.address?.l1}
                                onBlur={handleBlur}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                id="address-city"
                                name="address.city"
                                label="City"
                                value={values.address?.city}
                                onChange={handleChange}
                                error={Boolean(touched.address?.city && errors.address?.city)}
                                helperText={touched.address?.city && errors.address?.city}
                                onBlur={handleBlur}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                id="address-state"
                                name="address.state"
                                label="State"
                                value={values.address?.state}
                                onChange={handleChange}
                                error={Boolean(touched.address?.state && errors.address?.state)}
                                helperText={touched.address?.state && errors.address?.state}
                                onBlur={handleBlur}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                id="address-postal-code"
                                name="address.postal_code"
                                label="Postal Code"
                                value={values.address?.postal_code}
                                onChange={handleChange}
                                error={Boolean(touched.address?.postal_code && errors.address?.postal_code)}
                                helperText={touched.address?.postal_code && errors.address?.postal_code}
                                onBlur={handleBlur}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </form>
            </CBModal>
        </>
    );
};

export default AuthorizeNetForm;
