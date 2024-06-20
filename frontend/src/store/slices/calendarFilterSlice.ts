import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ILocation } from '../../models/ILocation';
import { IEmployee } from '../../models/IEmployee';
import { calendarCellDurations, CellData } from '../constant';
import moment from 'moment-timezone';

interface LocationSettings {
    id: number;
    services: number[];
    employees: number[];
}

interface CalendarFilterProps {
    selectedLocation: ILocation | null;
    selectedEmployee: IEmployee | null;
    cellData: CellData;
    showScheduledStaffOnly: boolean;
    showCancelledAppointments: boolean;
    locationSettings: LocationSettings[] | null;
    allEmployees: IEmployee[];
    date: string;
    searchString: string;
    settingsInitialized: boolean;
    showSearch: boolean;
    busyEmployeeIds: number[];
}

const initialState: CalendarFilterProps = {
    selectedLocation: null,
    selectedEmployee: null,
    cellData: calendarCellDurations[60],
    showScheduledStaffOnly: false,
    showCancelledAppointments: true,
    locationSettings: [],
    allEmployees: [],
    date: moment().format(),
    searchString: '',
    settingsInitialized: false,
    showSearch: false,
    busyEmployeeIds: []
};

export const calendarFilterSlice = createSlice({
    name: 'calendarFilter',
    initialState,
    reducers: {
        setCalendarLocationFilter: (state, action: PayloadAction<ILocation | null>) => {
            state.selectedLocation = action.payload;
        },
        setCalendarEmployeeFilter: (state, action: PayloadAction<IEmployee | null>) => {
            state.selectedEmployee = action.payload;
        },
        clearCalendarFilter: () => initialState,
        setCellData: (state, action: PayloadAction<CellData>) => {
            state.cellData = action.payload;
        },
        setShowScheduledStaffOnly: (state, action: PayloadAction<boolean>) => {
            state.showScheduledStaffOnly = action.payload;
        },
        setShowCancelledAppointments: (state, action: PayloadAction<boolean>) => {
            state.showCancelledAppointments = action.payload;
        },
        setLocationSettings: (state, action: PayloadAction<LocationSettings[] | null>) => {
            state.locationSettings = action.payload;
        },
        setAllEmployees: (state, action: PayloadAction<IEmployee[]>) => {
            state.allEmployees = action.payload;
        },
        setCalendarDate: (state, action: PayloadAction<string>) => {
            state.date = action.payload;
        },
        setSearchString: (state, action: PayloadAction<string>) => {
            state.searchString = action.payload;
        },
        setSettingsInitialized: (state, action: PayloadAction<boolean>) => {
            state.settingsInitialized = action.payload;
        },
        setShowSearch: (state, action: PayloadAction<boolean>) => {
            state.showSearch = action.payload;
        },
        setBusyEmployeeIds: (state, action: PayloadAction<number[]>) => {
            state.busyEmployeeIds = action.payload;
        }
    }
});

export const {
    setCalendarLocationFilter,
    setCalendarEmployeeFilter,
    clearCalendarFilter,
    setCellData,
    setShowScheduledStaffOnly,
    setShowCancelledAppointments,
    setLocationSettings,
    setAllEmployees,
    setCalendarDate,
    setSearchString,
    setSettingsInitialized,
    setShowSearch,
    setBusyEmployeeIds
} = calendarFilterSlice.actions;
