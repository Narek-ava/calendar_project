import { IUserCompany } from './ICompany';

export interface ICurrentCompany extends IUserCompany {
    subscription_type: string | null;
    limits: {
        counts: {
            employees: number;
            locations: number;
            services: number;
        };
        max: {
            employees: number | null;
            locations: number | null;
            services: number | null;
        } | null;
    };
    is_twilio_enabled: boolean;
    waiver_data?: string | null;
}
