import { useEffect, useState, useCallback, useMemo } from 'react';

// material-ui
import { Stack, Box, useMediaQuery, Theme } from '@material-ui/core';
import Transitions from '../../../ui-component/extended/Transitions';
import { Grid } from '@mui/material';

// project imports
import StepContent from './StepContent';
import { useAppDispatch } from '../../../hooks/redux';
import { BookingData, WizardStates } from './types';
import appointmentWidgetAPI from '../../../services/WidgetService';
import { SnackBarTypes } from '../../../store/snackbarReducer';
import { SNACKBAR_OPEN } from '../../../store/actions';
import BookingSummary from './BookingSummary';
import { IServiceCategory } from '../../../models/IServiceCategory';
import appointmentAPI from '../../../services/AppointmentService';
import { axiosServices } from '../../../utils/axios';
import { IService } from '../../../models/IService';
import { UploadableFile } from '../../../ui-component/file-uploader-preview/AttachmentsUpload';
import { startSubmitting, stopSubmitting } from 'store/slices/SubmittingSlice';
import { IEmployee } from '../../../models/IEmployee';
import _ from 'lodash';
import WidgetStepper from '../components/WidgetStepper';
import { IWidgetCompany } from '../../../models/ICompany';
import useSteps from './hooks/useSteps';
import { setNoShowDeposit } from '../../../store/slices/widgetSlice';
import CBModal from '../../../ui-component/CBModal';
import moment from 'moment-timezone';

interface WidgetWizardProps {
    company_slug: string;
    categories: IServiceCategory[];
    matchDownMd: boolean;
    scrollToTop: () => void;
    data: IWidgetCompany;
}

const WidgetWizard = ({ company_slug, categories, matchDownMd, scrollToTop, data }: WidgetWizardProps) => {
    const dispatch = useAppDispatch();

    const [activeStep, setActiveStep] = useState(0);
    const [errorIndex, setErrorIndex] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [stepsProgress, setStepsProgress] = useState<number[]>([]);
    // data states
    const [services, setServices] = useState<IService[] | null>(null);
    const [serviceData, setServiceData] = useState<WizardStates['serviceData']>(null);
    const [locationData, setLocationData] = useState<WizardStates['locationData']>(null);
    const [providerData, setProviderData] = useState<WizardStates['providerData']>(null);
    const [isAnyProvider, setIsAnyProvider] = useState(false);
    const [dateData, setDateData] = useState<WizardStates['dateData']>(null);
    const [userData, setUserData] = useState<WizardStates['userData']>(null);
    const [attachments, setAttachments] = useState<UploadableFile[]>([]);
    // store for deleted attachments ID's - they will be deleted on-submit
    const [attachmentsIdsToDelete, setAttachmentsIdsToDelete] = useState<(number | string)[]>([]);
    const isMobile = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('sm'));
    const [openResetPopup, setOpenResetPopup] = useState<boolean>(false);
    const [prepopulatedLocation, setPrepopulatedLocation] = useState<WizardStates['locationData']>(null);
    const [prepopulatedProvider, setPrepopulatedProvider] = useState<WizardStates['providerData']>(null);
    const [hideNav, setHideNav] = useState<boolean>(false);
    const [timezone, setTimezone] = useState<string>('UTC');
    const { steps, stepsLength } = useSteps();

    const setService = useCallback(
        (service: WizardStates['serviceData']) => {
            setServiceData(service);
            dispatch(setNoShowDeposit({ required: false, amount: 0 }));
        },
        [dispatch]
    );

    const showSnackbar = ({ alertSeverity, message }: { alertSeverity: SnackBarTypes; message: string }) => {
        dispatch({
            type: SNACKBAR_OPEN,
            open: true,
            message,
            variant: 'alert',
            alertSeverity,
            anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
    };

    const locations = useMemo(() => data.filteredLocations || serviceData?.locations, [data.filteredLocations, serviceData]);

    useEffect(() => {
        let tz = locationData?.time_zone || 'UTC';

        if (serviceData?.is_virtual) {
            tz = moment.tz.guess();
        }

        setTimezone(tz);
    }, [locationData, serviceData]);

    useEffect(() => {
        if (!locationData && locations?.length === 1) {
            setPrepopulatedLocation(locations[0]);
        }
    }, [locationData, locations, setLocationData]);

    useEffect(() => {
        if (!providerData && data.filteredEmployees?.length === 1) {
            setPrepopulatedProvider(data.filteredEmployees[0]);
        }
    }, [data.filteredEmployees, providerData]);

    useEffect(() => {
        if (data.filteredServices) {
            setServices(data.filteredServices);
        } else if (categories) {
            const allServices = [] as IService[];
            categories.forEach((category) => {
                if (category.services) {
                    allServices.push(...category.services);
                }
            });
            const sorted = _.sortBy(allServices, ['sorting_order', 'id']);
            setServices(sorted);
        }
    }, [categories, data.filteredServices]);

    useEffect(() => {
        scrollToTop();
    }, [activeStep, scrollToTop]);

    const closeResetPopup = useCallback(() => {
        setOpenResetPopup(false);
    }, [setOpenResetPopup]);

    const substituteProgress = (step: WizardStates['step']) => {
        const index = stepsProgress.findIndex((progress) => progress === step);
        setStepsProgress(stepsProgress.slice(0, index + 1));
    };

    const addProgress = (step: WizardStates['step']) => {
        setStepsProgress([...stepsProgress, step]);
    };

    const handleNext = () => {
        setActiveStep(activeStep + 1);
        setErrorIndex(null);
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
        if (isAnyProvider && activeStep - 1 === steps.date.index) {
            setProviderData({} as IEmployee);
        }
    };

    const handleSetActiveStep = (stepIndex: number) => {
        setActiveStep(stepIndex);
        if (isAnyProvider && stepIndex === steps.date.index) {
            setProviderData({} as IEmployee);
        }
    };

    const rawResetWidget = () => {
        setOpenResetPopup(false);
        setStepsProgress([]);
        setServiceData(null);
        setLocationData(null);
        setProviderData(null);
        setDateData(null);
        setUserData(null);
        setAttachments([]);
        setActiveStep(0);
        setErrorIndex(null);
        setSubmitted(false);
        dispatch(appointmentWidgetAPI.util.invalidateTags(['Widget Slots']));
    };

    const resetWidget = () => {
        setOpenResetPopup(true);
    };

    const submitBooking = async (paymentDetails?: object | null, user?: WizardStates['userData']) => {
        const userObj = user || userData;

        if (!dateData || !serviceData || !providerData || !locationData || !userObj) return;

        dispatch(startSubmitting());

        const bookingData: BookingData = {
            user: userObj,
            service_id: serviceData.id,
            location_id: locationData.id,
            employee_id: providerData.id,
            start_at: dateData.start_at,
            end_at: dateData.end_at,
            note: userObj.note,
            images: attachments.map((file) => file.url || ''),
            time_zone: timezone
        };

        if (paymentDetails) bookingData.payment_details = paymentDetails;

        try {
            const res = await axiosServices.post(`/public/company/${company_slug}/appointment`, bookingData);
            if (res) {
                if (activeStep + 1 < stepsLength) handleNext();

                showSnackbar({
                    message: 'Appointment created',
                    alertSeverity: SnackBarTypes.Success
                });
                dispatch(stopSubmitting());
                setSubmitted(true);
                dispatch(appointmentAPI.util.invalidateTags(['Appointment']));
            }
        } catch (e) {
            if (e.errors && e.errors['customer.email']) {
                showSnackbar({
                    message: 'Invalid email address',
                    alertSeverity: SnackBarTypes.Error
                });
            } else if (e.errors && e.errors['customer.phone']) {
                showSnackbar({
                    message: 'Invalid phone number',
                    alertSeverity: SnackBarTypes.Error
                });
            } else {
                showSnackbar({
                    message: e.message,
                    alertSeverity: SnackBarTypes.Error
                });
            }
            dispatch(stopSubmitting());
        }
    };

    return (
        <>
            <Grid
                container
                sx={{ flexDirection: matchDownMd ? 'column' : 'row' }}
                spacing={isMobile ? 1 : 3}
                px={isMobile ? 1 : 0}
                py={isMobile ? 1 : 0}
            >
                <Grid item xs={matchDownMd ? 12 : 6}>
                    <Stack sx={{ width: '100%' }}>
                        <WidgetStepper
                            step={activeStep}
                            handleSetActiveStep={handleSetActiveStep}
                            stepsProgress={stepsProgress}
                            submitted={submitted}
                        />
                        <Box sx={{ overflow: 'hidden', pt: 1 }}>
                            <StepContent
                                data={data}
                                company_slug={company_slug}
                                step={activeStep}
                                addProgress={addProgress}
                                substituteProgress={substituteProgress}
                                errorIndex={errorIndex}
                                handleNext={handleNext}
                                handleBack={handleBack}
                                setErrorIndex={setErrorIndex}
                                services={services}
                                serviceData={serviceData}
                                setServiceData={setService}
                                locationData={locationData}
                                setLocationData={setLocationData}
                                providerData={providerData}
                                setProviderData={setProviderData}
                                isAnyProvider={isAnyProvider}
                                setIsAnyProvider={setIsAnyProvider}
                                dateData={dateData}
                                setDateData={setDateData}
                                userData={userData}
                                setUserData={setUserData}
                                attachments={attachments}
                                setAttachments={setAttachments}
                                // store for deleted attachments ID's - they will be deleted on-submit
                                attachmentsIdsToDelete={attachmentsIdsToDelete}
                                setAttachmentsIdsToDelete={setAttachmentsIdsToDelete}
                                isMobile={isMobile}
                                submitBooking={submitBooking}
                                resetWidget={resetWidget}
                                rawResetWidget={rawResetWidget}
                                submitted={submitted}
                                matchDownMd={matchDownMd}
                                setHideNav={setHideNav}
                                timezone={timezone}
                                setTimezone={setTimezone}
                            />
                        </Box>
                    </Stack>
                </Grid>
                <Grid item xs={matchDownMd ? 12 : 6}>
                    <Transitions type="slide" direction="left" in>
                        <BookingSummary
                            isInProgress
                            step={activeStep}
                            stepsProgress={stepsProgress}
                            setActiveStep={handleSetActiveStep}
                            serviceData={serviceData}
                            locationData={locationData}
                            providerData={providerData}
                            dateData={dateData}
                            userData={userData}
                            attachments={attachments}
                            setAttachments={setAttachments}
                            resetWidget={resetWidget}
                            rawResetWidget={rawResetWidget}
                            submitBooking={submitBooking}
                            submitted={submitted}
                            handleBack={handleBack}
                            attachmentsIdsToDelete={attachmentsIdsToDelete}
                            isAnyProvider={isAnyProvider}
                            matchDownMd={matchDownMd}
                            prepopulatedLocation={prepopulatedLocation}
                            prepopulatedProvider={prepopulatedProvider}
                            hideNav={hideNav}
                            company={data}
                            timezone={timezone}
                        />
                    </Transitions>
                </Grid>
            </Grid>
            <CBModal
                title="Are you sure you want to reset widget?"
                open={openResetPopup}
                onClose={closeResetPopup}
                okButtonText="Reset"
                onClickOk={rawResetWidget}
                closeButtonText="Cancel"
                maxWidth="md"
            />
        </>
    );
};

export default WidgetWizard;
