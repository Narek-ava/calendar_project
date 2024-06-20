import { IService } from './IService';

export interface IServiceCategory {
    id: number;
    name: string;
    services?: IService[];
}
