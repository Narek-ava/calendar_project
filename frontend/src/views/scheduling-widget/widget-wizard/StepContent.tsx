import { StepContentProps } from './types';
import DateForm from './forms/DateForm';
import UserForm from './forms/UserForm';
import ErrorStep from './forms/ErrorStep';
import ProviderForm from './forms/ProviderForm';
import LocationForm from './forms/LocationForm';
import ServiceForm from './forms/service-step/ServiceForm';
import WizardFinal from './WizardFinal';
import PaymentForm from './forms/PaymentForm/PaymentForm';
import useSteps from './hooks/useSteps';

const StepContent = ({
    company_slug,
    step,
    addProgress,
    substituteProgress,
    errorIndex,
    handleNext,
    handleBack,
    setErrorIndex,
    services,
    serviceData,
    setServiceData,
    locationData,
    setLocationData,
    providerData,
    setProviderData,
    dateData,
    setDateData,
    userData,
    setUserData,
    attachments,
    setAttachments,
    attachmentsIdsToDelete,
    setAttachmentsIdsToDelete,
    isAnyProvider,
    setIsAnyProvider,
    isMobile,
    submitBooking,
    resetWidget,
    rawResetWidget,
    submitted,
    data,
    matchDownMd,
    setHideNav,
    timezone,
    setTimezone
}: StepContentProps) => {
    const { steps } = useSteps();

    switch (step) {
        case steps.service.index:
            return (
                <ServiceForm
                    step={step}
                    handleBack={handleBack}
                    addProgress={addProgress}
                    substituteProgress={substituteProgress}
                    handleNext={handleNext}
                    services={services}
                    serviceData={serviceData}
                    setServiceData={setServiceData}
                    setLocationData={setLocationData}
                    setProviderData={setProviderData}
                    setDateData={setDateData}
                    matchDownMd={matchDownMd}
                    setHideNav={setHideNav}
                    submitted={submitted}
                />
            );
        case steps.location.index:
            return (
                <LocationForm
                    step={step}
                    handleBack={handleBack}
                    addProgress={addProgress}
                    substituteProgress={substituteProgress}
                    handleNext={handleNext}
                    setErrorIndex={setErrorIndex}
                    serviceData={serviceData}
                    locationData={locationData}
                    setLocationData={setLocationData}
                    setProviderData={setProviderData}
                    setDateData={setDateData}
                    filteredLocations={data?.filteredLocations}
                    submitted={submitted}
                />
            );
        case steps.provider.index:
            return (
                <ProviderForm
                    step={step}
                    handleBack={handleBack}
                    addProgress={addProgress}
                    substituteProgress={substituteProgress}
                    company_slug={company_slug}
                    serviceData={serviceData}
                    locationData={locationData}
                    providerData={providerData}
                    setProviderData={setProviderData}
                    setDateData={setDateData}
                    setErrorIndex={setErrorIndex}
                    handleNext={handleNext}
                    isAnyProvider={isAnyProvider}
                    setIsAnyProvider={setIsAnyProvider}
                    filteredEmployees={data?.filteredEmployees}
                    submitted={submitted}
                />
            );
        case steps.date.index:
            return (
                <DateForm
                    step={step}
                    handleBack={handleBack}
                    addProgress={addProgress}
                    substituteProgress={substituteProgress}
                    company={data}
                    serviceData={serviceData}
                    locationData={locationData}
                    providerData={providerData}
                    setProviderData={setProviderData}
                    dateData={dateData}
                    setDateData={setDateData}
                    errorIndex={errorIndex}
                    handleNext={handleNext}
                    isAnyProvider={isAnyProvider}
                    setIsAnyProvider={setIsAnyProvider}
                    submitted={submitted}
                    timezone={timezone}
                    setTimezone={setTimezone}
                />
            );
        case steps.user.index:
            return (
                <UserForm
                    step={step}
                    handleBack={handleBack}
                    addProgress={addProgress}
                    substituteProgress={substituteProgress}
                    handleNext={handleNext}
                    userData={userData}
                    setUserData={setUserData}
                    attachments={attachments}
                    setAttachments={setAttachments}
                    attachmentsIdsToDelete={attachmentsIdsToDelete}
                    setAttachmentsIdsToDelete={setAttachmentsIdsToDelete}
                    isMobile={isMobile}
                    submitted={submitted}
                    company={data}
                    service={serviceData}
                    submitBooking={submitBooking}
                />
            );
        case steps?.payment?.index:
            return (
                <PaymentForm
                    service={serviceData}
                    submitted={submitted}
                    handleBack={handleBack}
                    step={step}
                    addProgress={addProgress}
                    substituteProgress={substituteProgress}
                    handleNext={handleNext}
                    company={data}
                    date={dateData}
                    submitBooking={submitBooking}
                    location={locationData}
                />
            );
        case steps.final.index:
            return (
                <WizardFinal
                    step={step}
                    handleBack={handleBack}
                    submitBooking={submitBooking}
                    resetWidget={resetWidget}
                    rawResetWidget={rawResetWidget}
                    submitted={submitted}
                />
            );
        default:
            return <ErrorStep />;
    }
};

export default StepContent;
