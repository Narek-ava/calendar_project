import { useCallback, useEffect, useState } from 'react';

// material-ui
import { Grid, Typography } from '@material-ui/core';
import Transitions from '../../../../../ui-component/extended/Transitions';

// project imports
import { ServiceFormProps, WizardStates } from '../../types';
import { IService } from '../../../../../models/IService';
import StepTitle from '../../../components/StepTitle';
import ServiceButton from './ServiceButton';

// third-party
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ServiceInfoDialog from './ServiceInfoDialog';
import ServiceInfo from './ServiceInfo';

interface ServiceInitialValues {
    service: WizardStates['serviceData'];
}

const getInitialValues = ({ service }: ServiceInitialValues) => {
    const newService = {
        service: null
    };

    if (service) {
        return {
            service
        };
    }

    return newService;
};

const validationSchema = Yup.object({
    service: Yup.object().nullable().required('Service is required')
});

const ServiceForm = ({
    step,
    addProgress,
    substituteProgress,
    services,
    serviceData,
    setServiceData,
    setLocationData,
    setProviderData,
    setDateData,
    handleNext,
    handleBack,
    matchDownMd,
    setHideNav,
    submitted
}: ServiceFormProps) => {
    const [selectedService, setSelectedService] = useState<IService | null>(null);
    const [infoService, setInfoService] = useState<IService | null>(null);
    const { values, errors, handleSubmit, setErrors } = useFormik({
        initialValues: getInitialValues({
            service: serviceData
        }),
        validationSchema,
        onSubmit: (formData) => {
            if (formData.service) {
                handleSelectService(formData.service);
            }
        }
    });
    useEffect(() => {
        if (services) {
            if (!serviceData && services.length === 1) {
                setServiceData(services[0]);
                addProgress(step);
                handleNext();
            }
        }
    }, [addProgress, handleNext, serviceData, services, setServiceData, step]);

    useEffect(() => {
        if (serviceData && services) {
            setSelectedService(serviceData);
        }
    }, [serviceData, services]);

    const handleSelectService = (arg: IService) => {
        setSelectedService(arg);
        setInfoService(null);
        values.service = arg;
        setErrors({});
        if (serviceData && serviceData.id !== arg.id) {
            setLocationData(null);
            setProviderData(null);
            substituteProgress(step);
            setDateData(null);
            setServiceData(arg);
            handleNext();
        } else {
            addProgress(step);
            setServiceData(arg);
            handleNext();
        }
    };

    const showServiceInfo = useCallback(
        (index: number) => {
            setHideNav(true);
            setInfoService(services ? services[index] : null);
        },
        [setInfoService, services]
    );

    const closeInfoDialog = useCallback(() => {
        setInfoService(null);
        setHideNav(false);
    }, [setInfoService]);

    return (
        <Transitions type="fade" in>
            <StepTitle error={!!errors.service} title="Select Service" step={step} handleBack={handleBack} submitted={submitted} />
            {!!infoService && matchDownMd ? (
                <ServiceInfo service={infoService} onClose={closeInfoDialog} onChoose={() => handleSelectService(infoService)} />
            ) : (
                <form onSubmit={handleSubmit} id={`widget-form-${step}`}>
                    {services && services.length > 0 && (
                        <Grid container direction="column" spacing={3}>
                            <Grid item xs sx={{ maxWidth: '100% !important' }}>
                                {services.map((service: IService, index: number) => (
                                    <ServiceButton
                                        key={service.id}
                                        service={service}
                                        onChoose={() => handleSelectService(service)}
                                        isSelected={selectedService?.id === service.id}
                                        handleClickInfo={() => {
                                            showServiceInfo(index);
                                        }}
                                    />
                                ))}
                            </Grid>
                        </Grid>
                    )}
                    {services && services.length === 0 && <Typography>No active services for this Organization</Typography>}
                </form>
            )}
            {!!infoService && !matchDownMd && (
                <ServiceInfoDialog open onChoose={() => handleSelectService(infoService)} onClose={closeInfoDialog} service={infoService} />
            )}
        </Transitions>
    );
};

export default ServiceForm;
