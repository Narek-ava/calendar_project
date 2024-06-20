import React, { useState, useMemo, useCallback } from 'react';
import { Button, Step, Stepper, StepLabel, Stack, Typography } from '@material-ui/core';
import MainCard from 'ui-component/cards/MainCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import PersonalInfoForm from './PersonalInfoForm';
import { ICompanyInfo, IPersonalInfo } from './types';
import CompanyInfoForm from './CompanyInfoForm';
import PlanSelection from './PlanSelection';
import InitAPI from '../../../services/InitService';
import moment from 'moment-timezone';
import useAuth from '../../../hooks/useAuth';
import useShowSnackbar from '../../../hooks/useShowSnackbar';
import { SnackBarTypes } from '../../../store/snackbarReducer';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { startSubmitting, stopSubmitting } from '../../../store/slices/SubmittingSlice';
import useSignupScript from 'hooks/useSignupScript';

const steps = ['Personal Info', 'Organization Info', 'Plan Selection'];

const personalInfoInit = {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
};

const companyInfoInit = {
    companyName: '',
    address: {
        address: '',
        state: '',
        city: '',
        postal_code: '',
        country: 'USA'
    }
};

interface RegisterWizardProps {
    isTrial?: boolean;
}

const RegisterWizard = ({ isTrial }: RegisterWizardProps) => {
    const { register } = useAuth();
    const { showSnackbar } = useShowSnackbar();
    const { isSubmitting } = useAppSelector((state) => state.submitting);
    const dispatch = useAppDispatch();
    useSignupScript();

    const [activeStep, setActiveStep] = useState(0);
    const [personalInfo, setPersonalInfo] = useState<IPersonalInfo>(personalInfoInit);
    const [companyInfo, setCompanyInfo] = useState<ICompanyInfo>(companyInfoInit);
    const [errorIndex, setErrorIndex] = useState<number | null>(null);
    const [stripePriceId, setStripePriceId] = useState<string>('');
    const [subscriptionType, setSubscriptionType] = useState<string>('');
    const [errors, setErrors] = useState<{ [key: string]: any }>({});

    const { data: initData } = InitAPI.useInitQuery(null, {
        refetchOnMountOrArgChange: true
    });

    const handleErrors = (responseErrors: { [key: string]: any }) => {
        // Determine which step of the wizard is related to the first error from the response
        const firstErrorKey = Object.keys(responseErrors)[0];
        let errorStepIndex = 0;

        if (firstErrorKey === 'company' || firstErrorKey === 'address') errorStepIndex = 1;

        if (firstErrorKey === 'stripe_price_id') errorStepIndex = 2;

        setErrorIndex(errorStepIndex);
        setActiveStep(errorStepIndex);
        setErrors(responseErrors);
    };

    const handleSubmit = useCallback(() => {
        dispatch(startSubmitting());

        const data = {
            stripe_price_id: stripePriceId,
            email: personalInfo.email,
            firstname: personalInfo.firstname,
            lastname: personalInfo.lastname,
            phone: personalInfo.phone,
            company: {
                name: companyInfo.companyName,
                subscription_type: subscriptionType,
                time_zone: moment.tz.guess(true)
            },
            address: {
                address: companyInfo.address.address,
                city: companyInfo.address.city,
                state: companyInfo.address.state,
                postal_code: companyInfo.address.postal_code,
                l1: companyInfo.address?.l1,
                l2: companyInfo.address?.l2,
                country: 'USA'
            },
            password: personalInfo.password,
            submit: null,
            with_trial: !!isTrial
        };

        register(data)
            .then(() => {
                dispatch(stopSubmitting());
            })
            .catch((err) => {
                dispatch(stopSubmitting());
                showSnackbar({
                    message: err.message || 'Error occurred, please check your data and try again',
                    alertSeverity: SnackBarTypes.Error
                });

                if (err.errors) handleErrors(err.errors);
            });
    }, [companyInfo, personalInfo, register, showSnackbar, stripePriceId, subscriptionType, dispatch]);

    const handleNext = useCallback(() => {
        if (activeStep === steps.length - 1) {
            handleSubmit();
        } else {
            setActiveStep(activeStep + 1);
            setErrorIndex(null);
        }
    }, [activeStep, handleSubmit]);

    const handleBack = useCallback(() => {
        setActiveStep(activeStep - 1);
    }, [activeStep]);

    const reset = () => {
        setPersonalInfo(personalInfoInit);
        setCompanyInfo(companyInfoInit);
        setStripePriceId('');
        setSubscriptionType('');
        setActiveStep(0);
    };

    const stepContent = useMemo(() => {
        switch (activeStep) {
            case 0:
                return (
                    <PersonalInfoForm
                        personalInfo={personalInfo}
                        setPersonalInfo={setPersonalInfo}
                        handleNext={handleNext}
                        setErrorIndex={setErrorIndex}
                        errors={errors}
                        setErrors={setErrors}
                    />
                );
            case 1:
                return (
                    <CompanyInfoForm
                        companyInfo={companyInfo}
                        setCompanyInfo={setCompanyInfo}
                        handleBack={handleBack}
                        handleNext={handleNext}
                        setErrorIndex={setErrorIndex}
                        errors={errors}
                        setErrors={setErrors}
                    />
                );
            case 2:
                return initData ? (
                    <PlanSelection
                        initData={initData}
                        setStripePriceId={setStripePriceId}
                        subscriptionType={subscriptionType}
                        setSubscriptionType={setSubscriptionType}
                    />
                ) : null;
            default:
                throw new Error('Unknown step');
        }
    }, [activeStep, companyInfo, errors, handleBack, handleNext, initData, personalInfo, stripePriceId, subscriptionType]);

    return (
        <MainCard>
            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                {steps.map((label, index) => {
                    const labelProps: { error?: boolean; optional?: React.ReactNode } = {};

                    if (index === errorIndex) {
                        labelProps.optional = (
                            <Typography variant="caption" color="error">
                                Error
                            </Typography>
                        );

                        labelProps.error = true;
                    }

                    return (
                        <Step key={label}>
                            <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            <>
                {activeStep === steps.length ? (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Thank you for your order.
                        </Typography>
                        <Typography variant="subtitle1">
                            Your order number is #2001539. We have emailed your order confirmation, and will send you an update when your
                            order has shipped.
                        </Typography>
                        <Stack direction="row" justifyContent="flex-end">
                            <AnimateButton>
                                <Button variant="contained" color="error" onClick={reset} sx={{ my: 3, ml: 1 }}>
                                    Reset
                                </Button>
                            </AnimateButton>
                        </Stack>
                    </>
                ) : (
                    <>
                        {stepContent}
                        {activeStep === steps.length - 1 && (
                            <Stack direction="row" justifyContent={activeStep !== 0 ? 'space-between' : 'flex-end'}>
                                {activeStep !== 0 && (
                                    <Button onClick={handleBack} sx={{ my: 3, ml: 1 }}>
                                        Back
                                    </Button>
                                )}
                                <AnimateButton>
                                    <Button disabled={isSubmitting} variant="contained" onClick={handleNext} sx={{ my: 3, ml: 1 }}>
                                        {activeStep === steps.length - 1 ? 'Sign Up' : 'Next'}
                                    </Button>
                                </AnimateButton>
                            </Stack>
                        )}
                    </>
                )}
            </>
        </MainCard>
    );
};

export default RegisterWizard;
