import { ICompany } from './ICompany';
import { EmployeeData, IEmployeeSettings, UserRole } from './IEmployee';
import { ImageData } from './IImage';
import { ICompanyOwner } from './ICompanyOwner';
import { ICurrentCompany } from './ICurrentCompany';

interface IUserEmployee extends EmployeeData {
    role: {
        name: UserRole;
        permissions: UserPermission[];
    };
    settings: IEmployeeSettings;
}

export interface IUserEmployeeSettingsPayload {
    settings: IEmployeeSettings;
}

export interface IUser {
    id: number;
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
    password: string;
    avatar: string | ImageData | null;
    // avatar: string | null;
    employee: IUserEmployee;
    companies: ICompany[];
    companyOwner: ICompanyOwner | null;
    currentCompany: ICurrentCompany;
    stripe_billing_portal_url: string | null;
    is_impersonated?: boolean;
    impersonator?: IUser;
    select_company_required?: boolean;
    google_accounts: IUserGoogleAccount[];
}

export interface IUserGoogleAccount {
    id: number;
    name: string;
    calendars: IUserGoogleAccountCalendar[];
}

export interface IUserGoogleAccountCalendar {
    id: number;
    name: string;
    google_id: string;
    accounting_events: boolean;
}

// export interface UserAvatar {
//     id: number;
//     url: string;
// }

export interface UserPermission {
    subject: UserSubject;
    action: UserAction;
}

export type UserAction = 'create' | 'view' | 'list' | 'update' | 'delete' | 'restore' | '*';
export type UserSubject = 'company' | 'location' | 'service' | 'customer' | 'employee' | 'appointment';
