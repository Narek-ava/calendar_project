import { useMemo } from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { useTheme } from '@material-ui/core/styles';

const StripeCard = () => {
    const theme = useTheme();

    const options = useMemo(
        () => ({
            style: {
                base: {
                    color: theme.palette.widget.text || '#32325d',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                        color: theme.palette.grey[700] || '#aab7c4'
                    }
                },
                invalid: {
                    color: theme.palette.error.main || '#ff0000',
                    iconColor: theme.palette.error.main || '#ff0000'
                }
            },
            hidePostalCode: true
        }),
        [theme]
    );

    return <CardElement options={options} />;
};

export default StripeCard;
