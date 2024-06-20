import { useMemo, useCallback } from 'react';
import { IEmployee, IEmployeeSettings } from '../../../models/IEmployee';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { calendarCellDurations, getShiftByDate } from '../../../store/constant';
import {
    setCellData,
    setLocationSettings,
    setSettingsInitialized,
    setShowCancelledAppointments,
    setShowScheduledStaffOnly
} from '../../../store/slices/calendarFilterSlice';
import moment from 'moment/moment';
import userAPI from '../../../services/AccountService';
import { useDebouncedCallback } from 'use-debounce';

const useFilterSettings = () => {
    const {
        cellData,
        locationSettings,
        selectedLocation,
        showScheduledStaffOnly,
        date,
        allEmployees,
        showCancelledAppointments,
        busyEmployeeIds
    } = useAppSelector((state) => state.calendarFilter);
    const dispatch = useAppDispatch();

    const initFilterSettings = (settings: IEmployeeSettings) => {
        if (!selectedLocation) return;

        dispatch(setCellData(calendarCellDurations[settings.calendar.cell_duration || 30]));
        dispatch(setShowScheduledStaffOnly(settings.calendar.show_scheduled_staff));
        dispatch(setShowCancelledAppointments(settings.calendar.show_canceled_appointments));

        const locationsSettings = settings.calendar.locations || [
            {
                id: selectedLocation.id,
                services: selectedLocation.services.map((s) => s.id),
                employees: selectedLocation.employees.map((e) => e.id)
            }
        ];

        dispatch(setLocationSettings(locationsSettings));
        dispatch(setSettingsInitialized(true));
    };

    const selectedServiceIds = useMemo(() => locationSettings?.find((s) => s.id === selectedLocation?.id)?.services || [], [
        locationSettings,
        selectedLocation
    ]);

    const isWorkingDay = useCallback(
        (staff: IEmployee) => {
            if (staff.is_shifts_enabled) {
                const customShift = getShiftByDate(date, staff.shifts);

                if (customShift) return customShift.opened;
            }

            const targetDaySchedule = staff.schedule.find((day) => Number(day.id) === moment(date).day());
            return targetDaySchedule && targetDaySchedule.enable;
        },
        [date]
    );

    const selectedEmployeeIds = useMemo(() => {
        if (showScheduledStaffOnly) {
            return [...busyEmployeeIds, ...allEmployees.filter((e) => isWorkingDay(e)).map((e) => e.id)];
        }

        return locationSettings?.find((s) => s.id === selectedLocation?.id)?.employees || [];
    }, [busyEmployeeIds, allEmployees, isWorkingDay, locationSettings, selectedLocation, showScheduledStaffOnly]);

    const setLocationSelectedServiceIds = useCallback(
        (serviceIds: number[]) => {
            const data = [...(locationSettings || [])];
            const index = data.findIndex((obj) => obj.id === selectedLocation?.id);
            if (index !== -1) {
                data[index] = { ...data[index], services: serviceIds };
            } else {
                data.push({ id: selectedLocation?.id || 0, services: serviceIds, employees: [] });
            }

            dispatch(setLocationSettings(data));
        },
        [dispatch, locationSettings, selectedLocation]
    );

    const setLocationSelectedEmployeeIds = useCallback(
        (employeeIds: number[]) => {
            if (!locationSettings) return;

            const data = [...(locationSettings || [])];
            const index = data.findIndex((obj) => obj.id === selectedLocation?.id);
            if (index !== -1) {
                data[index] = { ...data[index], employees: employeeIds };
            } else {
                data.push({ id: selectedLocation?.id || 0, services: [], employees: employeeIds });
            }

            dispatch(setLocationSettings(data));
        },
        [dispatch, locationSettings, selectedLocation]
    );

    const [updateEmployeeSettings] = userAPI.useUpdateEmployeeSettingsMutation();

    const storeSettings = useDebouncedCallback((data: IEmployeeSettings) => {
        updateEmployeeSettings({ settings: data });
    }, 1000);

    const saveFilterSettings = useCallback(() => {
        const data = {
            calendar: {
                cell_duration: cellData.value,
                show_scheduled_staff: showScheduledStaffOnly,
                show_canceled_appointments: showCancelledAppointments,
                selected_location_id: selectedLocation?.id || 0,
                locations: locationSettings
            }
        };

        storeSettings(data);
    }, [cellData, locationSettings, selectedLocation, showCancelledAppointments, showScheduledStaffOnly, storeSettings]);

    return {
        initFilterSettings,
        selectedServiceIds,
        selectedEmployeeIds,
        setLocationSelectedServiceIds,
        setLocationSelectedEmployeeIds,
        saveFilterSettings
    };
};

export default useFilterSettings;
