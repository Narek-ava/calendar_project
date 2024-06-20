import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { IService } from '../../../../../../models/IService';
import { WizardStates } from '../../../types';
import moment from 'moment';
import useShowSnackbar from '../../../../../../hooks/useShowSnackbar';
import { SnackBarTypes } from '../../../../../../store/snackbarReducer';
import { Typography } from '@material-ui/core';
import { PaymentGateways } from '../../../../../../types';
import useDepositFunctions from '../../../../hooks/useDepositFunctions';

const PayPalLoadingError = () => {
    const [{ isRejected }] = usePayPalScriptReducer();

    return isRejected ? <Typography>Invalid paypal gateway configuration, please contact support.</Typography> : null;
};

interface PaypalFormProps {
    clientId: string;
    service: IService;
    date: WizardStates['dateData'];
    submitBooking: (details?: object) => void;
}

const PaypalForm = ({ clientId, service, date, submitBooking }: PaypalFormProps) => {
    const { showSnackbar } = useShowSnackbar();
    const { servicePrice } = useDepositFunctions();

    return (
        <PayPalScriptProvider options={{ 'client-id': clientId, intent: 'authorize' }}>
            <PayPalButtons
                style={{ layout: 'horizontal', tagline: false, height: 45 }}
                createOrder={(data, actions) =>
                    actions.order.create({
                        purchase_units: [
                            {
                                amount: {
                                    value: `${servicePrice}`,
                                    breakdown: {
                                        item_total: {
                                            currency_code: 'USD',
                                            value: `${servicePrice}`
                                        }
                                    }
                                },
                                items: [
                                    {
                                        name: `Prepaid booking for ${service.name} ${
                                            date ? moment(date.start_at).format('MMMM Do YYYY, hh:mm A') : ''
                                        }`,
                                        quantity: '1',
                                        unit_amount: {
                                            value: `${servicePrice}`,
                                            currency_code: 'USD'
                                        }
                                    }
                                ]
                            }
                        ]
                    })
                }
                onApprove={(data, actions) =>
                    // @ts-ignore
                    actions.order.authorize().then((details) => {
                        submitBooking({ ...details, gateway: PaymentGateways.Paypal });
                    })
                }
                onError={(err) => {
                    showSnackbar({
                        message: 'Error occurred. Please try again or select another payment option.',
                        alertSeverity: SnackBarTypes.Error
                    });
                }}
            />
            <PayPalLoadingError />
        </PayPalScriptProvider>
    );
};

export default PaypalForm;
