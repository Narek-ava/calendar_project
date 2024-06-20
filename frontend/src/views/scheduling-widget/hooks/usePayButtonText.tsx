import { IWidgetCompany } from '../../../models/ICompany';
import { useMemo } from 'react';
import { PaymentGateways } from '../../../types';
import useDepositFunctions from './useDepositFunctions';

interface PayButtonTextProps {
    company: IWidgetCompany;
    paymentGateway: PaymentGateways;
}

const usePayButtonText = ({ company, paymentGateway }: PayButtonTextProps) => {
    const { servicePrice } = useDepositFunctions();

    const serviceFee = useMemo(() => {
        const fee = company?.payment_gws?.authorize_net?.service_fee_amount || 0;
        return typeof fee === 'string' ? parseFloat(fee) : fee;
    }, [company]);

    const payButtonTitle = () =>
        `Pay $${servicePrice + (paymentGateway === PaymentGateways.AuthorizeNet ? serviceFee : 0)} ${
            paymentGateway === PaymentGateways.AuthorizeNet && serviceFee ? `(includes $${serviceFee} service fee)` : ''
        }`;

    return { payButtonTitle };
};

export default usePayButtonText;
