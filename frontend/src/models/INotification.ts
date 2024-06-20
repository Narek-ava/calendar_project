import { IAddress } from './IAddress';

export interface INotification {
    created_at: string;
    data: INotificationData;
    id: string;
    notifiable_id?: number;
    notifiable_type?: string;
    read_at?: string | null;
    type: NotificationType;
    updated_at?: string;
}

export interface INotificationData {
    company: INotificationCompany;
    customer: INotificationCustomer;
    end_at: string;
    id: number;
    location: INotificationLocation;
    service: INotificationService;
    start_at: string;
    read_at: string;
}

export interface INotificationCustomer {
    firstname: string;
    id: number;
    lastname: string;
}

export interface INotificationLocation {
    address: IAddress;
    id: number;
    name: string;
    time_zone_name: string;
    time_zone: string;
}

export interface INotificationService {
    id: number;
    name: string;
    is_virtual?: boolean;
}

export interface INotificationCompany {
    id: number;
}

export enum NotificationType {
    appointmentCreated = `App\\Notifications\\Employee\\AppointmentCreatedNotification`,
    appointmentCanceled = `App\\Notifications\\Employee\\AppointmentStatusCanceledNotification`,
    appointmentCompleted = `App\\Notifications\\Employee\\AppointmentStatusCompletedNotification`,
    appointmentDateUpdated = `App\\Notifications\\Employee\\AppointmentDateUpdatedNotification`,
    appointmentCheckedIn = `App\\Notifications\\Employee\\AppointmentCheckedInNotification`
}
