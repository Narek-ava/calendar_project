import { IAddress } from './IAddress';
import { ImageData } from './IImage';
import { IServiceCategory } from './IServiceCategory';
import { IAppointment } from './IAppointment';
import { ILocation } from './ILocation';
import { IService } from './IService';
import { IEmployee } from './IEmployee';
import { IUser } from './IUser';

export interface IUserCompany {
    id: number;
    slug: string;
    name: string;
    time_zone: string;
    logo: ImageData | null;
    uuid: string;
    logo_rectangular: ImageData | null;
}

export interface ICompany extends IUserCompany {
    category: string | null;
    description: string | null;
    email: string | null | undefined;
    phone: string | null;
    site: string | null;
    address: IAddress;
    locations_count: number;
    employees_count: number;
    services_count: number;
    deleted_at?: string | null;
    employee_id?: number;
    is_notifications_enabled: boolean;
    settings: ICompanySettings;
    locations?: ILocation[];
    services?: IService[];
    employees?: IEmployee[];
    is_twilio_enabled: boolean;
    owner?: IUser;
}

export interface IWidgetCompany {
    name: string;
    logo: ImageData | null;
    logo_rectangular: ImageData | null;
    service_categories: IServiceCategory[];
    phone: string;
    email: string;
    customer?: WidgetCustomer;
    filteredServices?: IService[];
    filteredLocations?: ILocation[];
    filteredEmployees?: IEmployee[];
    settings: {
        widget: IWidgetSettings;
    };
    payment_gws?: PaymentGateways;
    slug: string;
}

export interface WidgetCustomer {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    appointments: IAppointment[];
}

export interface ICompanySettings {
    notifications: {
        enabled: boolean;
        immediately_sms_notify?: boolean;
    };
    appointments: {
        autocomplete: {
            enabled: boolean;
            interval: number | null;
        };
        completed_notify_customers: boolean;
        no_show_deposit: {
            enabled: boolean;
            percent: number;
        };
    };
    widget: IWidgetSettings;
    integrations: {
        reputation_management?: string;
        gradeus: {
            api_key?: string;
            profile_id?: string;
        };
        reviewshake: {
            api_key?: string;
            subdomain?: string;
            custom_domain?: string;
            campaign?: string;
            client?: string;
            location_slug?: string;
        };
        cc_processor?: string;
        paypal: {
            client_id?: string;
            client_secret?: string;
        };
        authorize_net: {
            api_login_id?: string;
            transaction_key?: string;
        };
        stripe: {
            secret_key?: string;
            publishable_key?: string;
        };
        twilio: {
            auth_token?: string;
            account_sid?: string;
        };
    };
}

export interface ICompanySettingsPayload {
    companyId: number;
    settings: ICompanySettings;
}

export interface IWidgetSettings {
    primaryColor?: string;
    textColor?: string;
    buttonColor?: string;
    bgPattern?: number;
    widgetBgPattern?: {
        start: string;
        end: string;
    };
    is_attachments_enabled: boolean;
    max_advance_booking: number;
    confirmation_note?: string;
    link_builder?: IWidgetLinkBuilder[];
    deposit_text?: string;
}

export interface IWidgetLinkBuilder {
    location_id: number;
    service_id: number;
    employee_id: number;
}

export interface PaymentGateways {
    paypal?: {
        client_id?: string;
    };
    authorize_net?: {
        is_enabled: boolean;
        service_fee_amount: number;
    };
    stripe?: {
        is_enabled: boolean;
        publishable_key: string;
    };
}

export const WidgetBgPatterns = [
    { start: '#2f2f2f', end: '#0b0b0b' },
    { start: '#f894a4', end: '#f9d1b7' },
    { start: '#7c98b3', end: '#637081' },
    { start: '#bfc7d7', end: '#e7eff9' },
    { start: '#334c94', end: '#131d38' },
    { start: '#3e2f69', end: '#10013b' }
];

export interface IStripePaymentIntent {
    result: boolean;
    client_secret: string;
}

export interface ITwilioNumber {
    phone_number: string;
    friendly_name: string;
}

export interface IWaiver {
    waiver_data?: string | null;
    companyId?: number;
}
