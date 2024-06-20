import { useEffect, useState, useCallback, useMemo } from 'react';

// material-ui
import { Grid, Typography, CircularProgress, Button, Stack } from '@material-ui/core';
import Transitions from '../../../../ui-component/extended/Transitions';

// project imports
import { IEmployee } from '../../../../models/IEmployee';
import { GetEmployeeParams, ProviderFormProps, WizardStates } from '../types';
import appointmentWidgetAPI from '../../../../services/WidgetService';
import { useAppDispatch } from '../../../../hooks/redux';

// third-party
import { useFormik } from 'formik';
import * as Yup from 'yup';
import StepTitle from '../../components/StepTitle';
import { replaceMinioToLocalhost } from '../../../../utils/functions/uploading-images-helpers';
import WidgetButton from '../../components/WidgetButton';
import { styled } from '@material-ui/core/styles';

interface GetInitialValuesProps {
    provider: WizardStates['providerData'];
}
const getInitialValues = ({ provider }: GetInitialValuesProps) => {
    const newProvider = {
        provider: null
    };
    if (provider) {
        return {
            provider
        };
    }

    return newProvider;
};

const validationSchema = Yup.object({
    provider: Yup.object().nullable().required('Provider is required')
});

const StyledAnyButton = styled(Button)(({ theme }) => ({
    width: '100%',
    mx: 'auto',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2, 0),
    color: theme.palette.widget.green,
    borderColor: theme.palette.widget.green,

    '&:hover': {
        borderColor: theme.palette.widget.green,
        background: 'none'
    }
}));

const ProviderForm = ({
    company_slug,
    step,
    addProgress,
    substituteProgress,
    serviceData,
    locationData,
    setProviderData,
    providerData,
    setDateData,
    handleNext,
    isAnyProvider,
    setIsAnyProvider,
    handleBack,
    filteredEmployees,
    submitted
}: ProviderFormProps) => {
    const dispatch = useAppDispatch();
    const [providerParams, setProviderParams] = useState({} as GetEmployeeParams);
    const [skip, setSkip] = useState(true);
    const { data: loadedProviders, isLoading } = appointmentWidgetAPI.useGetEmployeesQuery(providerParams, { skip });
    const [selectedProvider, setSelectedProvider] = useState<WizardStates['providerData']>(null);

    const providers = useMemo(() => filteredEmployees || loadedProviders, [filteredEmployees, loadedProviders]);

    useEffect(() => {
        if (serviceData && locationData) {
            const params: GetEmployeeParams = {
                slug: company_slug,
                service: serviceData.id,
                location: locationData.id
            };
            setProviderParams(params);
            setSkip(false);
        }
    }, [serviceData, locationData]);

    const { errors, setFieldValue, handleSubmit } = useFormik({
        initialValues: getInitialValues({
            provider: providerData
        }),
        validationSchema,
        onSubmit: (formData) => {
            if (formData.provider) {
                if (providerData && providerData.id !== formData.provider.id) {
                    setDateData(null);
                }
                setProviderData(formData.provider);
                handleNext();
            }
        }
    });

    const handleSelectProvider = (provider: IEmployee) => {
        setSelectedProvider(provider);
        setFieldValue('provider', provider);
        if (providerData && providerData.id !== provider.id) {
            setProviderData(null);
            setDateData(null);
            substituteProgress(step);
            dispatch(appointmentWidgetAPI.util.invalidateTags(['Widget Slots']));
            setProviderData(provider);
            handleNext();
        } else {
            addProgress(step);
            setProviderData(provider);
            handleNext();
        }
    };

    useEffect(() => {
        if (providerData) {
            setSelectedProvider(providerData);
        }
    }, [providerData]);

    useEffect(() => {
        if (!providerData && providers && providers.length === 1) {
            setProviderData(providers[0]);
            addProgress(step);
            handleNext();
        }
    }, [providers]);

    const getLogo = useCallback((logo) => replaceMinioToLocalhost(logo ? logo?.url : ''), []);

    return (
        <Transitions type="fade" in>
            <StepTitle error={!!errors.provider} title="Select Provider" step={step} handleBack={handleBack} submitted={submitted} />
            <form onSubmit={handleSubmit} id={`widget-form-${step}`}>
                <Grid container spacing={3}>
                    <Grid item xs>
                        {!isLoading &&
                            providers &&
                            providers.length > 0 &&
                            [...providers]
                                .sort(() => Math.random() - 0.5)
                                .map((provider) => (
                                    <WidgetButton
                                        key={`provider_btn_${provider.id}`}
                                        isSelected={selectedProvider?.id === provider.id}
                                        imageUrl={getLogo(provider.avatar || provider.user.avatar)}
                                        name={`${provider.user.firstname} ${provider.user.lastname}`}
                                        bottomContent={provider.profession_title ? <i>{provider.profession_title}</i> : null}
                                        onChoose={() => {
                                            handleSelectProvider(provider);
                                            if (isAnyProvider) {
                                                setIsAnyProvider(false);
                                            }
                                        }}
                                    />
                                ))}
                        {!isLoading && providers && providers.length > 1 && (
                            <StyledAnyButton
                                onClick={() => {
                                    handleSelectProvider({} as IEmployee);
                                    setIsAnyProvider(true);
                                }}
                                variant={selectedProvider && Object.keys(selectedProvider).length === 0 ? 'contained' : 'outlined'}
                            >
                                Any Provider
                            </StyledAnyButton>
                        )}
                        {!isLoading && providers && providers.length === 0 && (
                            <Typography>No providers available for this location</Typography>
                        )}
                        {isLoading && (
                            <Grid item xs={12}>
                                <Stack direction="row" justifyContent="center" sx={{ width: '100%' }}>
                                    <CircularProgress />
                                </Stack>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </form>
        </Transitions>
    );
};

export default ProviderForm;
