import { useState, FormEvent } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { Typography } from '@material-ui/core';
import { PaymentGateways } from '../../../../../../../types';
import { useAppDispatch } from '../../../../../../../hooks/redux';
import { startSubmitting, stopSubmitting } from 'store/slices/SubmittingSlice';
import { IService } from '../../../../../../../models/IService';
import { WizardStates } from '../../../../types';
import { IWidgetCompany } from '../../../../../../../models/ICompany';

interface StripeCheckoutFormProps {
    submitBooking: (details?: object) => void;
    service: IService;
    company: IWidgetCompany;
    date: WizardStates['dateData'];
}

const StripeCheckoutForm = ({ submitBooking, service, date, company }: StripeCheckoutFormProps) => {
    const [error, setError] = useState<string | null>(null);

    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useAppDispatch();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setError(null);
        dispatch(startSubmitting());

        const result = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
            confirmParams: undefined
        });

        if (result.error?.message) {
            dispatch(stopSubmitting());
            setError(result.error.message);
            return;
        }

        if (result?.paymentIntent?.status === 'requires_capture') {
            submitBooking({ ...result.paymentIntent, gateway: PaymentGateways.Stripe });
        }
    };

    return (
        <form onSubmit={handleSubmit} id="widget-stripe-checkout-form">
            <PaymentElement id="payment-element" />
            <AddressElement
                options={{
                    mode: 'billing',
                    defaultValues: {
                        address: {
                            country: 'US'
                        }
                    }
                }}
            />
            {error && (
                <Typography ml={2} color="error">
                    {error}
                </Typography>
            )}
        </form>
    );
};

export default StripeCheckoutForm;
