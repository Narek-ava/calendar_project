import { FormikValues } from 'formik';
import { IEmployee, UserRole } from '../../models/IEmployee';
import { ILocation } from '../../models/ILocation';
import { IService } from '../../models/IService';
import { TablerIcon } from '@tabler/icons';
import { GridProps } from '@material-ui/core';
import React from 'react';

export interface CalendarProps {
    date: string;
    setDate: (d: string) => void;
    events: FormikValues[];
    setSelectedEvent: (d: FormikValues | null) => void;
    view: string;
    filters: FiltersProps;
    changeMode: (arg: CalendarModes) => void;
    userRole: UserRole;
    handleFilter: (d: FilterProps) => void;
    setIsEventOpen: (d: boolean) => void;
    setIsEditOpen: (d: boolean) => void;
    setSelectedRange: (d: DateRange | null) => void;
    setView: (d: CalendarModeValues | string) => void;
    employee: IEmployee | null;
    employees: IEmployee[];
    locations: ILocation[];
    services: IService[];
    location: ILocation;
    isMobile: boolean;
    matchSm: boolean;
    handleOpenChooseEventType: () => void;
    setIsBlockOpened: (arg: boolean) => void;
    setSelectedEmployeeId: (data: number) => void;
    isFetching: boolean;
}

export type DateRange = { start: string | Date; end: string | Date; duration: number | null };

export enum CalendarModes {
    Month = 'Month',
    Week = 'Week',
    Day = 'Day'
    // Day = 'Week'
}

export enum CalendarModeValues {
    Month = 'dayGridMonth',
    Week = 'timeGridWeek',
    ResourceDay = 'resourceTimeGridDay',
    Day = 'timeGridDay',
    Agenda = 'listWeek'
}

export interface ViewOption {
    label: CalendarModes | string;
    value: CalendarModeValues;
    icon: TablerIcon;
}

export interface ViewOptions {
    month: ViewOption;
    week: ViewOption;
    day: ViewOption;
    resourceDay: ViewOption;
    agenda: ViewOption;
}

export interface GetCalendarModeProps {
    mode: string;
    changeMode: CalendarProps['changeMode'];
}

export interface FilterProps {
    mode: string;
    employees: IEmployee[];
    location: ILocation | null;
    customerInfo: string | null;
}

// state props
export interface FiltersProps {
    mode: string;
    employee: string;
    location: string;
    customerInfo: string | null;
}

export interface ToolbarProps {
    date: string;
    view: string;
    isMobile: boolean;
    matchSm: boolean;
    locations: CalendarProps['locations'];
    services: CalendarProps['services'];
    staff: any[];
    viewOptions: ViewOptions;
    onClickToday: () => void;
    onClickNext: () => void;
    onClickPrev: () => void;
    togglePicker: () => void;
    onChangeView: (s: ViewOption) => void;
    sx?: GridProps['sx'];
    onClickNew: () => void;
    openFilters: (event: React.MouseEvent<HTMLButtonElement>) => void;
    userRole?: UserRole;
}

export interface CalendarFiltersProps {
    mode: string;
    employee: CalendarProps['employee'];
    employees: CalendarProps['employees'];
    locations: ILocation[];
    location: ILocation;
    isMobile: boolean;
    userRole: CalendarProps['userRole'];
    onFilter: (arg: FilterProps) => void;
    anchorEl: null | HTMLElement;
    close: () => void;
}

export interface MobileDatePickerProps {
    matchSm: CalendarProps['matchSm'];
    location: CalendarProps['location'];
    date: CalendarProps['date'];
    setDate: CalendarProps['setDate'];
    handleGoToDate: (arg: Date) => void;
    togglePicker: () => void;
    isDatePickerOpened: boolean;
    closePicker: () => void;
}

export interface CalendarDatePickerProps {
    location: CalendarProps['location'];
    date: CalendarProps['date'];
    setDate: CalendarProps['setDate'];
    handleGoToDate: (arg: Date) => void;
    setCurrentMonthInPicker: (date: string) => void;
    onDateChange: () => void;
}

export interface DatePickerModalProps {
    opened: boolean;
    handleClose: () => void;
    location: CalendarProps['location'];
    date: CalendarProps['date'];
    setDate: CalendarProps['setDate'];
    handleGoToDate: (arg: Date) => void;
}

export enum CancellationReason {
    Customer_canceled = 'customer_canceled',
    Customer_no_show = 'customer_no_show',
    Staff_canceled = 'staff_canceled'
}

export interface LocationFilterProps {
    isMobile: ToolbarProps['isMobile'];
    locations: ToolbarProps['locations'];
    mode: string;
    onFilter: (arg: FilterProps) => void;
    closeFilters: () => void;
}

export interface StaffFilterProps {
    locationEmployees: IEmployee[];
}

export interface FiltersMenuProps {
    locationEmployees: IEmployee[];
    userRole: CalendarProps['userRole'];
}
