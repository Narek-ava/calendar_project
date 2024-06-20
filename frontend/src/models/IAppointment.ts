import { IEmployee } from './IEmployee';
import { ICustomer } from './ICustomer';
import { IService, PaymentType } from './IService';
import { ILocation } from './ILocation';
import { ImageData } from './IImage';
import { CancellationReason } from '../views/calendar/types';
import { IUser } from './IUser';
import { IPayment } from './IPayment';
import { IWidgetCompany } from './ICompany';

export enum AppointmentStatuses {
    // Created = 'created',
    Active = 'active',
    Completed = 'completed',
    Canceled = 'canceled'
}

export enum AppointmentType {
    Appointment = 'appointment',
    Blocked_Time = 'blocked_time',
    BlockedInOtherCompany = 'blocked_in_other_company',
    OwnAppointmentInOtherCompany = 'own_appointmnent_in_other_company',
    OwnBlockInOtherCompany = 'own_block_in_other_company'
}

export interface IAppointment {
    id: number;
    uuid: string;
    employee: IEmployee;
    service: IService;
    location: ILocation;
    customer: ICustomer;
    status: AppointmentStatuses;
    start_at: string;
    end_at: string;
    payment_method: string;
    price: string;
    type: AppointmentType;
    note?: string;
    private_note?: string;
    images: ImageData[];
    cancel_reason?: CancellationReason;
    is_in_rescheduling_or_canceling_interval: boolean;
    tva_url?: string;
    payments: IPayment[] | null;
    company?: IWidgetCompany;
    payment_type: PaymentType;
    foreign_employee?: IEmployee;
    time_zone?: string | null;
}

export interface IAppointmentPayload {
    employee_id: IEmployee['id'];
    location_id: ILocation['id'];
    service_id: IService['id'];
    customer_id: ICustomer['id'];
    start_at: IAppointment['start_at'];
    end_at: IAppointment['end_at'];
    type: AppointmentType;
    note?: string;
    private_note?: string;
    images: string[];
    payments: IPayment[] | null;
    price: number;
    is_notifications_enabled?: boolean;
}

export interface IAppointmentPaymentsPayload {
    payments: IPayment[] | null;
}

export interface AppointmentStatusPayload {
    status: AppointmentStatuses;
    cancel_reason?: CancellationReason;
    payment_method?: string;
    price?: number;
}

export interface WidgetAppointmentPayload {
    employee_id: IEmployee['id'];
    location_id: ILocation['id'];
    service_id: IService['id'];
    start_at: IAppointment['start_at'];
    end_at: IAppointment['end_at'];
}

type IAppointmentHistoryProps = Omit<IAppointmentPayload, 'images'>;

export interface IAppointmentHistoryValues extends IAppointmentHistoryProps {
    company_id: string;
    uuid: IAppointment['uuid'];
    id: IAppointment['id'];
    status: AppointmentStatuses;
}

export interface IAppointmentHistory {
    event: 'created' | 'updated';
    old_values: IAppointmentHistoryValues;
    new_values: IAppointmentHistoryValues;
    modified_values: any;
    created_at: string;
    user: IUser | null;
    event_source: 'backoffice' | 'widget';
}
