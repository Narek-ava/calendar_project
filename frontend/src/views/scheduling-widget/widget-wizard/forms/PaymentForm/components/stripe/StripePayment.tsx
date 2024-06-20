import { useCallback, useState, useEffect } from 'react';
import { Grid, Skeleton, useMediaQuery } from '@material-ui/core';
import { Button } from '@mui/material';
import { IService } from '../../../../../../../models/IService';
import { WizardStates } from '../../../../types';
import { IWidgetCompany } from '../../../../../../../models/ICompany';
import appointmentWidgetAPI from '../../../../../../../services/WidgetService';
import { skipToken } from '@reduxjs/toolkit/dist/query/react';
import { useParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';
import StripeIcon from '../../../../../../../assets/images/icons/stripe.svg';
import { styled, Theme, useTheme } from '@material-ui/core/styles';
import CBModal from '../../../../../../../ui-component/CBModal';
import PaymentTitle from '../../../../../components/PaymentTitle';
import usePayButtonText from '../../../../../hooks/usePayButtonText';
import { PaymentGateways } from '../../../../../../../types';

interface StripeFormProps {
    service: IService;
    date: WizardStates['dateData'];
    submitBooking: (details?: object) => void;
    company: IWidgetCompany;
    stripePublicKey: string;
    location: WizardStates['locationData'];
}

const StyledButton = styled(Button)(({ theme }) => ({
    '& .MuiButton-startIcon img': {
        width: '20px'
    }
}));

const StripePayment = ({ service, date, submitBooking, company, stripePublicKey, location }: StripeFormProps) => {
    const matchSm = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('sm'));
    const theme = useTheme();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    const { company_slug } = useParams();
    const { payButtonTitle } = usePayButtonText({ company, paymentGateway: PaymentGateways.Stripe });

    const { data, isLoading, refetch } = appointmentWidgetAPI.useGetStripePaymentIntentQuery(
        company_slug ? { slug: company_slug, service_id: service.id } : skipToken
    );

    const openModal = useCallback(() => {
        setShowModal(true);
    }, [setShowModal]);

    const closeModal = useCallback(() => {
        setShowModal(false);
    }, [setShowModal]);

    useEffect(() => {
        if (!stripePromise && stripePublicKey) setStripePromise(loadStripe(stripePublicKey));
    }, [stripePromise, stripePublicKey]);

    useEffect(() => {
        refetch();
    }, [refetch, service]);

    const appearance = {
        variables: {
            colorPrimary: theme.palette.widget.text || '#32325d',
            fontSizeBase: '16px',
            colorText: theme.palette.widget.text || '#32325d',
            colorDanger: theme.palette.error.main || '#ff0000',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif'
        }
    };

    return (
        <>
            <StyledButton
                onClick={openModal}
                fullWidth
                variant="contained"
                color="secondary"
                sx={{ height: '45px', mb: 1.5 }}
                startIcon={<img src={StripeIcon} alt="" />}
            >
                Stripe
            </StyledButton>
            <CBModal
                title={<PaymentTitle service={service} date={date} location={location} />}
                open={showModal}
                onClose={closeModal}
                okButtonText={payButtonTitle()}
                okButtonFormId="widget-stripe-checkout-form"
                fullWidth
                maxWidth="sm"
                fullScreen={matchSm}
            >
                {data?.result && data.client_secret && !isLoading ? (
                    <Elements stripe={stripePromise} options={{ clientSecret: data.client_secret, appearance }}>
                        <StripeCheckoutForm submitBooking={submitBooking} company={company} date={date} service={service} />
                    </Elements>
                ) : (
                    <>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Skeleton animation="wave" height={30} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Skeleton animation="wave" height={30} />
                                <Skeleton animation="wave" height={30} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Skeleton animation="wave" height={30} />
                                <Skeleton animation="wave" height={30} />
                            </Grid>
                            <Grid item xs={12}>
                                <Skeleton animation="wave" height={50} />
                            </Grid>
                        </Grid>
                    </>
                )}
            </CBModal>
        </>
    );
};

export default StripePayment;
