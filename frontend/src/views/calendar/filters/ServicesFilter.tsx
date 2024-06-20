import { useCallback } from 'react';
import { Box, ListItem, Typography } from '@material-ui/core';
import Check from '@material-ui/icons/Check';
import ListItemFilter from './components/ListItemFilter';
import useFilterSettings from '../hooks/useFilterSettings';
import CreateServiceSimpleButton from '../../../ui-component/CreateServiceSimpleButton';
import { useAppSelector } from '../../../hooks/redux';

const ServicesFilter = () => {
    const { selectedLocation } = useAppSelector((state) => state.calendarFilter);
    const { selectedServiceIds, setLocationSelectedServiceIds } = useFilterSettings();

    const toggleService = useCallback(
        (serviceId: number) => {
            setLocationSelectedServiceIds(
                selectedServiceIds.includes(serviceId)
                    ? selectedServiceIds.filter((s) => s !== serviceId)
                    : [...selectedServiceIds, serviceId]
            );
        },
        [selectedServiceIds, setLocationSelectedServiceIds]
    );

    return (
        <>
            <ListItem>Services:</ListItem>
            {selectedLocation && selectedLocation.services.length > 0 ? (
                selectedLocation.services.map((service) => (
                    <ListItemFilter
                        key={`filter_service_${service.id}`}
                        label={service.name}
                        onClick={() => {
                            toggleService(service.id);
                        }}
                        isActive={selectedServiceIds.includes(service.id)}
                        activeIcon={<Check />}
                    />
                ))
            ) : (
                <Box mt={1} display="flex" flexDirection="column" alignItems="center">
                    <Typography mb={1}>There are no services</Typography>
                    <CreateServiceSimpleButton />
                </Box>
            )}
        </>
    );
};

export default ServicesFilter;
