import { IEmployee } from './IEmployee';
import { ILocation } from './ILocation';
import { ImageData } from './IImage';

export interface IWeekDaySchedule {
    id: number;
    enable: boolean;
}

export interface IService {
    id: number;
    service_category_id: number | null;
    name: string;
    duration: number | null;
    interval: number | null;
    is_reschedule_enabled: boolean;
    rescheduling_interval: number;
    fixed_price: boolean;
    payment_type: PaymentType;
    price: number | null;
    prepay: number | null;
    locations?: ILocation[];
    employees?: IEmployee[];
    deleted_at?: string | null;
    images: ImageData[];
    description: string | null;
    schedule: IWeekDaySchedule[];
    sorting_order: number;
    is_virtual: boolean;
    is_private: boolean;
    slug: string;
    confirmation_note: string;
    isActive?: boolean;
    advance_booking_buffer?: number;
    is_waiver_enabled?: boolean;
}

export enum PaymentType {
    Free = 'free',
    Paid = 'paid',
    Prepaid = 'prepay'
}

export enum PaymentTypeNames {
    Free = 'Free',
    Paid = 'Paid',
    Prepaid = 'Deposit Required'
}

export interface ServiceOrderPayload {
    ordering: IServiceOrder[];
}

export interface IServiceOrder {
    id: number;
    sorting_order: number;
}
