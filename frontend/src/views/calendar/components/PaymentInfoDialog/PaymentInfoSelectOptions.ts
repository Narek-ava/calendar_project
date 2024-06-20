import { PaymentGateways } from '../../../../types';

export const methodOptions = [
    { value: PaymentGateways.Paypal, label: 'Paypal' },
    { value: PaymentGateways.Stripe, label: 'Stripe' },
    { value: PaymentGateways.AuthorizeNet, label: 'Authorize.net' },
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'venmo', label: 'Venmo' },
    { value: 'zelle', label: 'Zelle' },
    { value: 'gift_card', label: 'Gift Card' },
    { value: 'other', label: 'Other' }
];

export const reasonOptions = [
    { value: 'deposit', label: 'Deposit' },
    { value: 'service', label: 'Service' },
    { value: 'gratuity', label: 'Gratuity' },
    { value: 'other', label: 'Other' }
];
