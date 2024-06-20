import { useMemo, useEffect } from 'react';

// material-ui
import { Autocomplete, TextField } from '@material-ui/core';

// project imports
import { EmployeesByServiceLocationProps, ProviderStepProps } from './types';
import { IEmployee, UserRole } from '../../../models/IEmployee';
import appointmentAPI from '../../../services/AppointmentService';
import { Box } from '@mui/material';
import UserAvatar from '../../../ui-component/UserAvatar';
import { useAppSelector } from '../../../hooks/redux';

const ProviderStep = ({
    isEdit,
    index,
    error,
    removeError,
    serviceData,
    userRole,
    locationData,
    providerData,
    setProviderData,
    selectedEmployeeId
}: ProviderStepProps) => {
    const { allEmployees } = useAppSelector((state) => state.calendarFilter);

    const skip = useMemo(() => !(serviceData && locationData), [locationData, serviceData]);
    const apiArg = useMemo(
        () =>
            serviceData && locationData
                ? {
                      service_id: serviceData.id,
                      location_id: locationData.id
                  }
                : ({} as EmployeesByServiceLocationProps),
        [locationData, serviceData]
    );

    const { data: providers } = appointmentAPI.useGetEmployeesByServiceLocationQuery(apiArg, { skip });

    // prefill employee field
    useEffect(() => {
        if (isEdit) return;

        if (!serviceData && !providerData) {
            setProviderData(allEmployees.find((e) => e.id === selectedEmployeeId) || null);
        }
    }, []);

    // clear employee field if selected employee wasn't found in employee options
    useEffect(() => {
        if (!providers) return;

        if (providerData && providers && !providers.map((o) => o.id).includes(providerData.id)) setProviderData(null);
    }, [providerData, providers, setProviderData]);

    return (
        <Autocomplete
            id="provider-id"
            fullWidth
            value={providerData}
            disabled={providers?.length === 0 || userRole === UserRole.Provider}
            options={providers || []}
            getOptionLabel={(option: IEmployee) => `${option.user.firstname} ${option.user.lastname}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="No items match your search"
            renderInput={(params) => <TextField {...params} error={error} label="Select Provider" />}
            onChange={(e, value) => {
                if (value) {
                    setProviderData(value);
                    if (error) {
                        removeError(index);
                    }
                } else {
                    setProviderData(null);
                }
            }}
            renderOption={(props, option: IEmployee) => (
                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                    <UserAvatar employee={option} sx={{ width: '30px', height: '30px', mr: 1 }} />
                    {`${option.user.firstname} ${option.user.lastname}`}
                </Box>
            )}
        />
    );
};

export default ProviderStep;
