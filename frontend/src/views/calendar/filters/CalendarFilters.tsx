import { useEffect, useMemo } from 'react';
import { clearCalendarFilter, setSettingsInitialized } from 'store/slices/calendarFilterSlice';
import { CalendarFiltersProps } from '../types';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { UserRole } from '../../../models/IEmployee';
import LocationsFilter from './LocationFilter';
import { openConfirmPopup } from '../../../store/confirmPopupSlice';
import StaffFilter from './StaffFilter';
import { useNavigate } from 'react-router-dom';
import useFilterSettings from '../hooks/useFilterSettings';
import { Box, Divider, List, ListItem, Menu } from '@material-ui/core';
import CellDurationFilter from './CellDurationFilter';
import ScheduledStaffFilter from './ScheduledStaffFilter';
import CancelledAppointmentsFilter from './CancelledAppointmentsFilter';
import ServicesFilter from './ServicesFilter';
import userAPI from '../../../services/AccountService';

const CalendarFilters = ({
    mode,
    isMobile,
    employee,
    employees,
    locations,
    location,
    userRole,
    onFilter,
    anchorEl,
    close
}: CalendarFiltersProps) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { initFilterSettings, saveFilterSettings } = useFilterSettings();
    const {
        cellData,
        showScheduledStaffOnly,
        showCancelledAppointments,
        selectedLocation,
        locationSettings,
        settingsInitialized
    } = useAppSelector((state) => state.calendarFilter);

    const { data: employeeSettings, isFetching } = userAPI.useGetEmployeeSettingsQuery(null, {
        refetchOnMountOrArgChange: true
    });

    useEffect(
        () => () => {
            dispatch(userAPI.util.resetApiState());
            dispatch(setSettingsInitialized(false));
        },
        []
    );

    useEffect(() => {
        if (!settingsInitialized) return;

        saveFilterSettings();
    }, [
        cellData,
        showScheduledStaffOnly,
        showCancelledAppointments,
        selectedLocation,
        locationSettings,
        saveFilterSettings,
        settingsInitialized
    ]);

    // show only staff with services attached
    const locationEmployees = useMemo(
        () =>
            employees.filter((employeeElem) => {
                if (employeeElem.services.length > 0 && location.employees.some((employeeUser) => employeeUser.id === employeeElem.id)) {
                    return employeeElem;
                }
                return undefined;
            }),
        [employees, location.employees]
    );

    // run this only 1 time to apply saved settings
    useEffect(() => {
        if (isFetching || !employeeSettings || settingsInitialized) return;

        initFilterSettings(employeeSettings);
    }, [employeeSettings, initFilterSettings, isFetching, settingsInitialized]);

    useEffect(() => {
        if (employee) {
            // case with direct link from staff tab
            if (employee.services.length === 0) {
                dispatch(
                    openConfirmPopup({
                        onConfirm: () => {
                            navigate(`/employee/${employee.id}`);
                            dispatch(clearCalendarFilter());
                        },
                        confirmText: `Edit Staff`,
                        cancelText: 'Ok',
                        text: 'The selected Staff has no Services attached and will not be shown.'
                    })
                );
            }
        }
    }, [employee, location, userRole, locationEmployees]);

    return (
        <Menu
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={close}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <List dense>
                {locations.length > 1 && (
                    <Box m={1}>
                        <LocationsFilter isMobile={isMobile} locations={locations} mode={mode} onFilter={onFilter} closeFilters={close} />
                    </Box>
                )}

                {userRole !== UserRole.Provider && locationEmployees.length > 0 && (
                    <Box m={1}>
                        <StaffFilter locationEmployees={locationEmployees} />
                    </Box>
                )}

                <CellDurationFilter />
                <Divider />

                <ListItem>Show:</ListItem>
                {userRole !== UserRole.Provider && locationEmployees.length > 0 && <ScheduledStaffFilter />}
                <CancelledAppointmentsFilter />
                <Divider />

                <ServicesFilter />
            </List>
        </Menu>
    );
};

export default CalendarFilters;
