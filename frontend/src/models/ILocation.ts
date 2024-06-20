import { IAddress } from './IAddress';
import { IEmployee } from './IEmployee';
import { IService } from './IService';

interface ILocationBase {
    id: number;
    name: string;
    phone: string;
    schedule: ISchedule[];
    time_zone: string;
    time_zone_name: string;
    address: IAddress;
    in_advance: number;
    deleted_at?: string | null;
    immediately_sms_notify: boolean;
    calendar_cell_duration: number;
    kioskUrlShort: string;
    twilio_phone?: string;
}

export interface ILocation extends ILocationBase {
    services: IService[];
    employees: IEmployee[];
    is_primary?: boolean;
    slug?: string;
    isActive?: boolean;
}

export interface ISchedule {
    id: number;
    label: string;
    enable: boolean;
    start: string;
    end: string;
}

export interface ILocationPayload extends ILocationBase {}
