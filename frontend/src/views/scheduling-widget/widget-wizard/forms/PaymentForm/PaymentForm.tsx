import StepTitle from '../../../components/StepTitle';
import { PaymentFormProps } from '../../types';
import Transitions from '../../../../../ui-component/extended/Transitions';
import PaypalForm from './components/PaypalForm';
import { Typography } from '@mui/material';
import AuthorizeNetForm from './components/AuthorizeNetForm';
import StripePayment from './components/stripe/StripePayment';
import useDepositFunctions from '../../../hooks/useDepositFunctions';
import * as DOMPurify from 'dompurify';

const PaymentForm = ({ service, submitted, step, handleBack, company, date, submitBooking, location }: PaymentFormProps) => {
    const { servicePrice } = useDepositFunctions();

    return (
        <Transitions type="fade" in>
            <StepTitle title="Appointment Deposit" error={false} step={step} handleBack={handleBack} submitted={submitted} />
            {servicePrice && service ? (
                <>
                    {!company?.payment_gws?.paypal?.client_id &&
                        !company?.payment_gws?.authorize_net?.is_enabled &&
                        !company?.payment_gws?.stripe?.is_enabled && (
                            <Typography>Invalid payment gateway configuration, please contact support.</Typography>
                        )}

                    {company?.payment_gws?.authorize_net?.is_enabled && (
                        <AuthorizeNetForm
                            company={company}
                            service={service}
                            date={date}
                            submitBooking={submitBooking}
                            location={location}
                        />
                    )}

                    {company?.payment_gws?.stripe?.is_enabled && company?.payment_gws?.stripe?.publishable_key && (
                        <StripePayment
                            company={company}
                            service={service}
                            date={date}
                            submitBooking={submitBooking}
                            stripePublicKey={company.payment_gws.stripe.publishable_key}
                            location={location}
                        />
                    )}

                    {company?.payment_gws?.paypal?.client_id && service && (
                        <PaypalForm
                            clientId={company.payment_gws.paypal.client_id}
                            service={service}
                            date={date}
                            submitBooking={submitBooking}
                        />
                    )}

                    {!!company.settings.widget?.deposit_text && (
                        <Typography dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(company.settings.widget?.deposit_text) }} />
                    )}
                </>
            ) : (
                <Typography>Invalid service configuration.</Typography>
            )}
        </Transitions>
    );
};

export default PaymentForm;
