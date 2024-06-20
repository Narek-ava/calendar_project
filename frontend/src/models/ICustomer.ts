import { IAddress } from './IAddress';
import { IAppointment } from './IAppointment';

export interface ICustomer {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    birth_date?: string | null;
    note?: string | null;
    address: IAddress;
    deleted_at?: string | null;
    appointments?: IAppointment[];
}
