import { Moment } from 'moment-timezone';
import { FormikValues } from 'formik';

import { IService } from '../../../models/IService';
import { ILocation } from '../../../models/ILocation';
import { ICustomer } from '../../../models/ICustomer';
import { IEmployee } from '../../../models/IEmployee';
import { AppointmentType, IAppointmentPayload } from '../../../models/IAppointment';
import { IUser } from '../../../models/IUser';
import { CalendarProps, DateRange } from '../types';

export interface AppointmentWizardProps {
    isRescheduled: boolean;
    services: IService[];
    event: FormikValues | null;
    range: DateRange | null;
    employees: IEmployee[];
    locations: ILocation[];
    currentLocation: ILocation;
    user: IUser;
    userRole: CalendarProps['userRole'];
    handleDelete: (id: string | number, type: AppointmentType) => void;
    handleCreate: (d: IAppointmentPayload) => void;
    handleUpdate: (i: string, d: IAppointmentPayload) => void;
    onCancel: () => void;
    matchSm: boolean;
    rangeMode: boolean;
    setRangeMode: (arg: boolean) => void;
    selectedEmployeeId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

export interface NewCustomerWizardProps {
    setIsAppointmentWizardOpened: (arg: boolean) => void;
}

interface Step<I> {
    index: number;
    data: I;
    title: string;
}

export interface WizardValues {
    service: Step<IService | null>;
    location: Step<ILocation | null>;
    provider: Step<IEmployee | null>;
    customer: Step<ICustomer | null>;
    date: Step<Moment>;
    duration: Step<number | null>;
}

interface BaseStepProps {
    index: number;
    error: boolean;
    removeError: (d: number) => void;
    userRole: CalendarProps['userRole'];
}

export interface ServiceStepProps extends Omit<BaseStepProps, 'userRole'> {
    serviceData: IService | null;
    setServiceData: (d: IService | null) => void;
    setDurationData: (d: number | null) => void;
    services: IService[];
    rangeMode: AppointmentWizardProps['rangeMode'];
    setRangeMode: AppointmentWizardProps['setRangeMode'];
    range: DateRange | null;
}

export interface LocationStepProps extends BaseStepProps {
    serviceData: ServiceStepProps['serviceData'];
    locationData: ILocation | null;
    locations: ILocation[];
    setLocationData: (d: ILocation | null) => void;
    setProviderData: (d: IEmployee | null) => void;
}

export interface NoteStepProps {
    noteData: string | null;
    setNoteData: (d: string | null) => void;
}

export interface PrivateNoteStepProps {
    privateNoteData: string | null;
    setPrivateNoteData: (d: string | null) => void;
}

export interface ProviderStepProps extends BaseStepProps {
    isEdit?: boolean;
    serviceData: ServiceStepProps['serviceData'];
    locationData: ILocation | null;
    providerData: IEmployee | null;
    setProviderData: LocationStepProps['setProviderData'];
    selectedEmployeeId: number | null;
}

export interface CustomerStepProps extends BaseStepProps {
    setIsAppointmentWizardOpened: (arg: boolean) => void;
    isEdit: boolean;
    customerData: ICustomer | null;
    setCustomerData: (d: ICustomer | null) => void;
    handleOpenCustomerForm: () => void;
}

export interface DateTimeStepProps {
    dateData: Moment;
    setDateData: (d: Moment) => void;
    locationData: LocationStepProps['locationData'];
    currentLocation: ILocation;
    matchSm: AppointmentWizardProps['matchSm'];
}

export interface DurationStepProps extends BaseStepProps {
    serviceData: ServiceStepProps['serviceData'];
    durationData: number | null;
    setDurationData: ServiceStepProps['setDurationData'];
    isEdit: boolean;
    setIsEdit: (arg: boolean) => void;
    rangeMode: AppointmentWizardProps['rangeMode'];
}

export interface EmployeesByServiceLocationProps {
    location_id: ILocation['id'];
    service_id: IService['id'];
}
