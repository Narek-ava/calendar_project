import moment, { Moment } from 'moment-timezone';
import business from 'moment-business';
import { ColorPaletteProps } from '../types';
import { ILocation, ISchedule } from '../models/ILocation';
import { IWeekDaySchedule } from '../models/IService';
import { CustomShift, IEmployee } from '../models/IEmployee';
import { FormikValues } from 'formik';
import { CalendarModeValues, CancellationReason } from '../views/calendar/types';

export const APP_PHONE_FORMAT = '(###) ###-####';

interface PaymentMethods {
    card: string;
    cash: string;
    other: string;
}

export interface WorkingHours {
    start: string;
    startMoment?: Moment;
    end: string;
    endMoment?: Moment;
    businessHours?: {
        startTime: string;
        endTime: string;
    };
    // isActive: boolean;
    // isDefault: boolean;
}

export const gridSpacing = 3;
export const drawerWidth = 260;
export const appDrawerWidth = 320;

// conversation status constants
export const statuses = {
    active: { status: 1, name: 'active' },
    closed: { status: 3, name: 'closed' },
    spam: { status: 4, name: 'spam' },
    snoozed: { status: 6, name: 'snoozed' }
};

export const inboxFolderTypes = {
    mine: 20,
    starred: 25,
    drafts: 30,
    assigned: 40,
    closed: 60,
    spam: 80,
    deleted: 110,
    snoozed: 200
};

// snooze conversation options
export const snoozePresets = [
    {
        id: 1,
        title: 'This Evening',
        dateTitle: '6:00 PM',
        date: moment().set({ hour: 18, minute: 0, seconds: 0 }).toJSON()
    },
    {
        id: 2,
        title: 'Later Today',
        dateTitle: '7:00 PM',
        date: moment().set({ hour: 19, minute: 0, seconds: 0 }).toJSON()
    },
    {
        id: 3,
        title: 'Tomorrow',
        dateTitle: business.addWeekDays(moment().set({ hour: 9, minute: 0, seconds: 0 }), 1).format('lll'),
        date: business.addWeekDays(moment().set({ hour: 9, minute: 0, seconds: 0 }), 1).toJSON()
    },
    {
        id: 4,
        title: 'This Week',
        dateTitle: business.addWeekDays(moment().set({ hour: 9, minute: 0, seconds: 0 }), 2).format('lll'),
        date: business.addWeekDays(moment().set({ hour: 9, minute: 0, seconds: 0 }), 2).toJSON()
    },
    {
        id: 5,
        title: 'Next Week',
        dateTitle: moment().day(1).add(7, 'days').set({ hour: 9, minute: 0, seconds: 0 }).format('lll'),
        date: moment().day(1).add(7, 'days').set({ hour: 9, minute: 0, seconds: 0 }).toJSON()
    }
];

export const stringToColor = (string: string) => {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.substr(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
};

// staff colors
interface Colors {
    blue: ColorPaletteProps;
    purple: ColorPaletteProps;
    green: ColorPaletteProps;
    deepOrange: ColorPaletteProps;
    red: ColorPaletteProps;
    amber: ColorPaletteProps;
    grey: ColorPaletteProps;
    black: ColorPaletteProps;
    white: ColorPaletteProps;
}

export const colors: Colors = {
    blue: {
        value: '#2196F3',
        label: 'Blue'
    },
    purple: {
        value: '#673AB7',
        label: 'Purple'
    },
    green: {
        value: '#00C853',
        label: 'Green'
    },
    deepOrange: {
        value: '#D84315',
        label: 'Deep Orange'
    },
    red: {
        value: '#F44336',
        label: 'Red'
    },
    amber: {
        value: '#FFC107',
        label: 'Amber'
    },
    grey: {
        value: '#757575',
        label: 'Grey'
    },
    black: {
        value: '#212121',
        label: 'Black'
    },
    white: {
        value: '#ffffff',
        label: 'White'
    }
};

export const paymentMethods: PaymentMethods = {
    card: 'credit_card',
    cash: 'cash',
    other: 'other'
};

export const defaultWorkingHours: WorkingHours = {
    start: '00:00:00',
    end: '23:59:59'
};

export const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const appTimeFormat = 'MM-DD-YYYY hh:mm A';
export const appDateFormat = 'MM/DD/YY';
export const apiTimeFormat = 'YYYY-MM-DD HH:mm:ss';
export const apiReportDateFormat = 'YYYY-MM-DD';

export const appCalendarFormat = {
    sameDay: '[Today] hh:mm A',
    nextDay: '[Tomorrow] hh:mm A',
    nextWeek: 'dddd hh:mm A',
    lastDay: '[Yesterday] hh:mm A',
    lastWeek: '[Last] dddd hh:mm A',
    sameElse: 'MM-DD-YYYY hh:mm A'
};

export const capitalizeFirst = (str: string) =>
    str
        .split(' ')
        .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
        .join(' ');

// max service duration
const max_duration = 120;
export const getDurations = ({ min = 0 }: { min?: number }) => {
    const timeLabels: string[] = [];
    for (let i = min; i <= max_duration; i += 10) {
        timeLabels.push(String(i));
    }

    return timeLabels;
};

export const in_advance_default: number = 30;

export const initSchedule: ISchedule[] = weekDays.map((day, index) => ({
    id: index,
    label: day,
    enable: false,
    start: moment().set({ hours: 8, minutes: 30 }).format(apiTimeFormat),
    end: moment().set({ hours: 17, minutes: 30 }).format(apiTimeFormat)
}));

export const initServiceSchedule: IWeekDaySchedule[] = Array.from(Array(7).keys()).map((day) => ({
    id: day,
    enable: true
}));

export const getWidgetMaxBookingDate = (maxAdvanceBooking: number) =>
    maxAdvanceBooking > 0 ? moment().add(maxAdvanceBooking, 'days') : undefined;

export const getHumanizedDuration = (minutes: number) => {
    const hoursNum = Math.floor(minutes / 60);
    if (minutes === 60) {
        return '1h';
    }
    if (hoursNum) {
        return minutes % 60 > 0 ? `${hoursNum}h ${minutes % 60}m` : `${hoursNum}h`;
    }
    return `${minutes}m`;
};

export const removeZeroMinutes = (time: Moment) => (time.minutes() === 0 ? time.format('h A') : time.format('h:mm A'));

interface getMinMaxEventTimeProps {
    events: FormikValues[];
    mode: 'week' | 'day';
    date: string;
    time_zone: string;
}

export const getMinMaxEventTime = ({ events, mode, date, time_zone }: getMinMaxEventTimeProps) => {
    if (mode === 'day') {
        const todayEvents = events.filter((event) => moment.tz(date, time_zone).isSame(event.start, 'day'));
        const dayEventsStartMoments = todayEvents.map((event) => moment(event.start));
        const dayEventsEndMoments = todayEvents.map((event) => moment(event.end));
        return {
            min: todayEvents.length > 0 ? moment.min(dayEventsStartMoments) : null,
            max: todayEvents.length > 0 ? moment.max(dayEventsEndMoments) : null
        };
    }
    const weekEventsMoments = events.map((event) => moment(event.start));
    return {
        min: moment.min(weekEventsMoments),
        max: moment.max(weekEventsMoments)
    };
    // const min = events.reduce((curr, next) => {
    //     if (curr.)
    // }, {});
};

interface getDayWorkingHoursProps {
    location: ILocation;
    date: string;
    events: FormikValues[];
    view: string;
}

export const getCalendarWorkingHours = ({ location, date, events, view }: getDayWorkingHoursProps) => {
    if (
        (view === CalendarModeValues.Day || view === CalendarModeValues.ResourceDay || view === CalendarModeValues.Week) &&
        location.schedule.length > 0
    ) {
        // get location schedule for today
        const daySchedule = location.schedule.find((schedule) => Number(schedule.id) === moment(date).day())!;
        // schedule start time
        const scheduleStartTime = moment(daySchedule.start, 'YYYY-MM-DD HH:mm').format('HH:mm:ss');
        // schedule end time
        const scheduleEndTime = moment(daySchedule.end, 'YYYY-MM-DD HH:mm').format('HH:mm:ss');
        // get current selected calendar day
        const day = moment.tz(date, location.time_zone).format('YYYY-MM-DD');
        // makes moment object from schedule working start time and current date day
        const todayScheduleStartMoment = moment(`${day} ${scheduleStartTime}`);
        const todayScheduleEndMoment = moment(`${day} ${scheduleEndTime}`);
        // calculates min-max times from incoming events for today
        const minMaxFromEvent = getMinMaxEventTime({
            events,
            time_zone: location.time_zone,
            date,
            mode: 'day'
        });
        const startMoment = moment.min([todayScheduleStartMoment, ...(minMaxFromEvent.min ? [minMaxFromEvent.min] : [])]).startOf('hour');
        const endMoment = moment.max([todayScheduleEndMoment, ...(minMaxFromEvent.max ? [minMaxFromEvent.max] : [])]).endOf('hour');

        const locationBusinessDays = location.schedule.filter((scheduleDay) => scheduleDay.enable).map((schedule) => Number(schedule.id));
        const businessHours = {
            startTime: moment(daySchedule.start, 'YYYY-MM-DD HH:mm').format('HH:mm:ss'),
            endTime: scheduleEndTime,
            daysOfWeek: locationBusinessDays
        };

        return {
            start: startMoment.format('HH:mm:ss'),
            end: startMoment.isSame(endMoment, 'day') ? endMoment.format('HH:mm:ss') : defaultWorkingHours.end,
            businessHours
        };
    }
    if (view === CalendarModeValues.Month && location.schedule.length > 0) {
        // const startTimesArray = location.schedule.filter((schedule) => schedule.enable).map((schedule) => moment(schedule.start));
        // const endTimesArray = location.schedule.filter((schedule) => schedule.enable).map((schedule) => moment(schedule.end));
        const startTimesArray = location.schedule.map((schedule) => moment(schedule.start));
        const endTimesArray = location.schedule.map((schedule) => moment(schedule.end));
        return {
            start: startTimesArray.length > 0 ? moment.min(startTimesArray).startOf('hour').format('HH:mm:ss') : defaultWorkingHours.start,
            end: endTimesArray.length > 0 ? moment.max(endTimesArray).endOf('hour').format('HH:mm:ss') : defaultWorkingHours.end
        };
    }
    return defaultWorkingHours;
};

type CancellationTypes = 'customer_canceled' | 'customer_no_show' | 'staff_canceled';
interface CancellationValue {
    title: string;
    value: CancellationReason;
}

type CancellationReasonProps = {
    [key in CancellationTypes]: CancellationValue;
};

export const cancellationReasons: CancellationReasonProps = {
    customer_canceled: {
        title: 'Customer Canceled',
        value: CancellationReason.Customer_canceled
    },
    customer_no_show: {
        title: 'Customer No Show',
        value: CancellationReason.Customer_no_show
    },
    staff_canceled: {
        title: 'Staff Canceled',
        value: CancellationReason.Staff_canceled
    }
};

export const time24To12 = (time: string): string | undefined => {
    const [h, m] = time.split(':');
    const hours24 = Number(h);
    const minutes = Number(m);
    if (isNaN(hours24) || isNaN(minutes)) {
        return undefined;
    }
    const amPm = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = (hours24 % 12) + 12 * (hours24 % 12 === 0 ? 1 : 0);
    const hours = hours12 < 10 ? `0${hours12}` : hours12;
    const returnMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutes === 0 ? '00' : returnMinutes} ${amPm}`;
};

export interface CellData {
    value: number;
    duration: string;
    interval: string;
}

export interface CalendarCellInterval {
    [key: number]: CellData;
}

export const calendarCellDurations: CalendarCellInterval = {
    30: {
        value: 30,
        duration: '00:30:00',
        interval: '00:30'
    },
    60: {
        value: 60,
        duration: '01:00:00',
        interval: '01:00'
    }
};

export const min_service_reschedule_interval = 0;

type GetEmployeeBusinessTime = {
    date: string;
    employee: IEmployee;
    schedule: ISchedule[];
    dayId: number;
};

export const getEmployeeBusinessTime = ({ schedule, dayId, employee, date }: GetEmployeeBusinessTime) => {
    const nonWorkingDay = {
        startTime: '00:00',
        endTime: '00:00'
    };

    if (employee.is_shifts_enabled) {
        const customShift = getShiftByDate(date, employee.shifts);

        if (customShift)
            return customShift.opened
                ? {
                      startTime: moment(customShift.start, apiTimeFormat).format('HH:mm'),
                      endTime: moment(customShift.end, apiTimeFormat).format('HH:mm'),
                      daysOfWeek: [dayId]
                  }
                : nonWorkingDay;
    }

    const targetDaySchedule = schedule.find((day) => Number(day.id) === dayId);
    return targetDaySchedule && targetDaySchedule.enable
        ? {
              startTime: moment(targetDaySchedule.start, apiTimeFormat).format('HH:mm'),
              endTime: moment(targetDaySchedule.end, apiTimeFormat).format('HH:mm'),
              daysOfWeek: [dayId]
          }
        : nonWorkingDay;
};

export const getShiftByDate = (date: Date | Moment | string, shifts: CustomShift[]) => {
    const startTime = { hour: 0, minute: 0, second: 0 };

    return shifts.find((shift) =>
        moment(date).set(startTime).isBetween(moment(shift.start).set(startTime), moment(shift.end).set(startTime), null, '[]')
    );
};
