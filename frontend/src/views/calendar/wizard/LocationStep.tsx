import { useEffect, useMemo } from 'react';

// material-ui
import { Autocomplete, TextField } from '@material-ui/core';

// project imports
import { LocationStepProps } from './types';
import { ILocation } from '../../../models/ILocation';
import { UserRole } from '../../../models/IEmployee';
import { useAppSelector } from '../../../hooks/redux';

const LocationStep = ({
    index,
    error,
    removeError,
    serviceData,
    userRole,
    locationData,
    locations,
    setLocationData,
    setProviderData
}: LocationStepProps) => {
    const { selectedLocation } = useAppSelector((state) => state.calendarFilter);

    const options = useMemo(() => {
        if (userRole === UserRole.Provider) return locations;

        if (serviceData && serviceData.locations) return serviceData.locations;

        return locations || [];
    }, [locations, serviceData, userRole]);

    useEffect(() => {
        if (!selectedLocation) return;

        const serviceHasLocation = options.map((o) => o.id).includes(locationData?.id || selectedLocation.id);

        if (!serviceHasLocation) {
            setLocationData(null);
            return;
        }

        if (serviceHasLocation && !locationData) {
            setLocationData(selectedLocation);
        }
    }, [options, selectedLocation, serviceData, setLocationData]);

    return (
        <>
            <Autocomplete
                id="location-id"
                // size="small"
                fullWidth
                value={locationData}
                // disabled={options.length < 2}
                disableClearable={options.length === 1}
                options={options}
                getOptionLabel={(option: ILocation) => `${option.name} (${option.time_zone})`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="No items match your search"
                renderInput={(params) => <TextField {...params} error={error} label="Select Location" />}
                onChange={(e, value) => {
                    if (value) {
                        if (locationData && locationData.id !== value.id && userRole !== UserRole.Provider) {
                            setProviderData(null);
                        }
                        setLocationData(value);
                        if (error) {
                            removeError(index);
                        }
                        return;
                    }
                    setLocationData(null);
                    if (userRole !== UserRole.Provider) {
                        setProviderData(null);
                    }
                }}
            />
        </>
    );
};

export default LocationStep;
