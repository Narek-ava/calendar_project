import { IUser } from '../../models/IUser';
import { IEmployee, UserRole } from '../../models/IEmployee';
import { ILocation } from '../../models/ILocation';

export const isAllowDeleteEmployee = (user: IUser, employee: IEmployee) => {
    if (user.id === employee.user.id) {
        return false;
    }

    if (user.employee.role.name !== UserRole.Owner) {
        if (employee.role === UserRole.Owner || employee.role === UserRole.Admin) {
            return false;
        }
    }

    // if (user.role === UserRole.Manager) {
    //     if (employee.role === UserRole.Admin) {
    //         return false;
    //     }
    // }
    return true;
};

export const isAllowEditEmployee = (user: IUser, employee: IEmployee) => {
    if (user.id !== employee.user.id && employee.role === UserRole.Owner) {
        return false;
    }
    if (user.employee.role.name === UserRole.Manager) {
        if (employee.role === UserRole.Admin || employee.role === UserRole.Owner) {
            return false;
        }
    }
    return true;
};

export const isAllowChangeRole = (user: IUser, employee: IEmployee) => {
    if (user.id === employee.user.id && employee.role === UserRole.Admin) {
        return false;
    }
    if (user.employee.role.name === UserRole.Manager) {
        if (employee.user.id === user.id) {
            return false;
        }
    }
    return true;
};

export const isAllowEditLocation = (user: IUser, location: ILocation) => {
    if (user.employee.role.name === UserRole.Manager) {
        if (location.is_primary) {
            return false;
        }
    }
    return true;
};
