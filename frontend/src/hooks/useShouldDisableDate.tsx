import { Moment } from 'moment-timezone';
import { IEmployee } from '../models/IEmployee';
import { ILocation } from '../models/ILocation';
import { IService } from '../models/IService';
import { getShiftByDate } from '../store/constant';
import { union } from 'lodash';

const useShouldDisableDate = () => {
    const shouldDisableDate = (pickerDate: Moment, employee: IEmployee | null, location: ILocation | null, service: IService | null) => {
        let employeeHolidaysIDs: number[] = [];
        let serviceHolidaysIDs: number[] = [];

        if (employee?.is_shifts_enabled) {
            const customShift = getShiftByDate(pickerDate, employee.shifts);

            if (customShift) return !customShift.opened;
        }

        if (employee && employee.schedule) {
            const employeeHolidays = employee.settings.widget?.use_location_schedule
                ? location?.schedule.filter((day) => !day.enable)
                : employee.schedule.filter((day) => !day.enable);

            employeeHolidaysIDs = employeeHolidays ? employeeHolidays.map((schedule) => Number(schedule.id)) : [];
        }

        if (service && service.schedule) {
            const serviceHolidays = service.schedule.filter((day) => !day.enable);
            serviceHolidaysIDs = serviceHolidays.map((schedule) => Number(schedule.id));
        }
        return union(employeeHolidaysIDs, serviceHolidaysIDs).includes(pickerDate.day());
    };

    return { shouldDisableDate };
};

export default useShouldDisableDate;
