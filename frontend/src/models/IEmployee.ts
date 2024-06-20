import { IUser } from './IUser';
import { ILocation, ISchedule } from './ILocation';
import { IService } from './IService';
import { ImageData } from './IImage';

export interface EmployeeData {
    id: number;
    profession_title?: string | null;
    locations: ILocation[];
    services: IService[];
    background_color: string;
    text_color: string;
    self_book?: boolean;
    schedule: ISchedule[];
    status: EmployeeStatus;
    is_shifts_enabled: boolean;
    shifts: CustomShift[];
    slug: string;
    avatar: ImageData | null;
    settings: IEmployeeSettings;
}

export interface IEmployee extends EmployeeData {
    locations_count?: number;
    user: IUser;
    deleted_at: string;
    role: UserRole;
    isActive?: boolean;
    isWorking?: boolean;
    is_invite_accepted?: boolean;
}

export enum EmployeeStatus {
    Active = 'active',
    Pending = 'pending'
}

export enum UserRole {
    Owner = 'owner',
    Admin = 'admin',
    Manager = 'manager',
    Provider = 'provider',
    FrontDesk = 'frontdesk',
    ReadOnlyLimited = 'read_only_limited'
}

export interface IEmployeePayload {
    id?: IEmployee['id'];
    user: {
        firstname: string;
        lastname: string;
        email: string;
        phone: string;
    };
    role: IEmployee['role'];
    profession_title: string;
    locations: number[];
    services: number[];
    schedule: ISchedule[];
    background_color: string;
    text_color: string;
}

export interface IEmployeeResendInvitationPayload {
    id: IEmployee['id'];
    email?: IEmployee['user']['email'];
}

export interface CustomShift {
    opened: boolean;
    start: string;
    end: string;
}

export interface IEmployeeSettings {
    widget?: {
        use_location_schedule: boolean;
        accounting_google_events: boolean;
    };
    calendar: {
        cell_duration: number;
        show_scheduled_staff: boolean;
        show_canceled_appointments: boolean;
        selected_location_id: number;
        locations: IEmployeeLocationSettings[] | null;
    };
}

export interface IEmployeeLocationSettings {
    id: number;
    services: number[];
    employees: number[];
}
