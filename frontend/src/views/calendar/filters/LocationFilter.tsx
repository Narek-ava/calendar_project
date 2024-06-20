import React, { useCallback } from 'react';
import { Divider, InputAdornment, MenuItem, Stack, TextField } from '@material-ui/core';
import { IconMap2 } from '@tabler/icons';
import { LocationFilterProps } from '../types';
import EllipsisTypography from '../../../ui-component/optimized-text-fields/EllipsisTypography';
import TimeZoneView from '../../../ui-component/TimeZoneView';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { ILocation } from '../../../models/ILocation';
import { setCalendarLocationFilter } from '../../../store/slices/calendarFilterSlice';
import useFilterSettings from '../hooks/useFilterSettings';

const LocationsFilter = ({ isMobile, locations, mode, onFilter, closeFilters }: LocationFilterProps) => {
    const dispatch = useAppDispatch();
    const { selectedLocation, allEmployees, searchString } = useAppSelector((state) => state.calendarFilter);
    const { selectedEmployeeIds } = useFilterSettings();

    const handleChangeLocation = useCallback(
        (event: React.ChangeEvent<{ value: ILocation }>) => {
            closeFilters();
            dispatch(setCalendarLocationFilter(event.target.value));
            onFilter({
                mode,
                location: event.target.value,
                employees: allEmployees.filter((e) => selectedEmployeeIds.includes(e.id)),
                customerInfo: searchString
            });
        },
        [allEmployees, dispatch, mode, onFilter, searchString, selectedEmployeeIds]
    );

    return (
        <TextField
            select
            sx={{ maxWidth: isMobile ? 'unset' : '500px', width: '100%' }}
            fullWidth={isMobile}
            size="small"
            label="Location"
            value={selectedLocation}
            // @ts-ignore
            onChange={handleChangeLocation}
            // disabled={locations.length === 1}
            InputProps={{
                startAdornment: (
                    <>
                        <InputAdornment position="start">
                            <IconMap2 />
                        </InputAdornment>
                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                    </>
                )
            }}
        >
            {locations.map((loc) => (
                // @ts-ignore
                <MenuItem key={loc.id} value={loc}>
                    <Stack direction="row" alignItems="center" flexWrap="wrap">
                        <EllipsisTypography text={loc.name} ml={0} mr={1} />
                        <TimeZoneView time_zone={loc.time_zone} />
                    </Stack>
                </MenuItem>
            ))}
        </TextField>
    );
};

export default LocationsFilter;
