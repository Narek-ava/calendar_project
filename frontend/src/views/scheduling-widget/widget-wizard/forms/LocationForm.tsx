// material-ui
import { Grid, Typography } from '@material-ui/core';
import Transitions from '../../../../ui-component/extended/Transitions';
import LocationOn from '@material-ui/icons/LocationOn';

// project imports
import { ILocation } from 'models/ILocation';
import { LocationFormProps, WizardStates } from '../types';

// third-party
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState, useMemo } from 'react';
import StepTitle from '../../components/StepTitle';
import WidgetButton from '../../components/WidgetButton';

interface GetInitialValuesProps {
    service: WizardStates['serviceData'];
    location: WizardStates['locationData'];
}

const getInitialValues = ({ service, location }: GetInitialValuesProps) => {
    const newLocation = {
        location: null
    };

    if (location && service && service.locations?.includes(location)) {
        return {
            location
        };
    }

    return newLocation;
};

const validationSchema = Yup.object({
    location: Yup.object().nullable().required('Location is required')
});

const LocationForm = ({
    step,
    addProgress,
    substituteProgress,
    locationData,
    setLocationData,
    serviceData,
    setProviderData,
    setDateData,
    handleNext,
    handleBack,
    filteredLocations,
    submitted
}: LocationFormProps) => {
    const [selectedLocation, setSelectedLocation] = useState<ILocation | null>(null);
    const { errors, setFieldValue, handleSubmit } = useFormik({
        initialValues: getInitialValues({
            location: locationData,
            service: serviceData
        }),
        validationSchema,
        onSubmit: (formData) => {
            if (formData.location) {
                if (locationData && locationData.id !== formData.location.id) {
                    setProviderData(null);
                    setDateData(null);
                }
                setLocationData(formData.location);
                handleNext();
            }
        }
    });

    useEffect(() => {
        if (locationData) {
            setSelectedLocation(locationData);
        }
    }, [locationData]);

    const locations = useMemo(() => filteredLocations || serviceData?.locations, [filteredLocations, serviceData]);

    useEffect(() => {
        if (!locationData && locations?.length === 1) {
            setLocationData(locations[0]);
            addProgress(step);
            handleNext();
        }
    }, [locations]);

    const handleSelectLocation = (location: ILocation) => {
        setSelectedLocation(location);
        setFieldValue('location', location);
        if (locationData && locationData.id !== location.id) {
            setProviderData(null);
            setDateData(null);
            substituteProgress(step);
            setLocationData(location);
            handleNext();
        } else {
            addProgress(step);
            setLocationData(location);
            handleNext();
        }
    };

    return (
        <Transitions type="fade" in>
            <StepTitle error={!!errors.location} title="Select Location" step={step} handleBack={handleBack} submitted={submitted} />
            <form onSubmit={handleSubmit} id={`widget-form-${step}`}>
                <Grid container spacing={3}>
                    <Grid item xs>
                        {locations?.length ? (
                            locations.map((location) => (
                                <WidgetButton
                                    key={`loc_btn_${location.id}`}
                                    isSelected={selectedLocation?.id === location.id}
                                    name={location.name}
                                    bottomContent={<i>{location.address.address}</i>}
                                    onChoose={() => handleSelectLocation(location)}
                                    avatarContent={<LocationOn />}
                                />
                            ))
                        ) : (
                            <Typography>No active locations for this Service</Typography>
                        )}
                    </Grid>
                </Grid>
            </form>
        </Transitions>
    );
};

export default LocationForm;
