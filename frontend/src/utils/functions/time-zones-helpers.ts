import moment, { Moment } from 'moment-timezone';
import { TimeZoneObject } from '../../ui-component/time-zone-select/types';
import { IAppointment, IAppointmentPayload } from '../../models/IAppointment';

export const default_time_zone = 'UTC';

export const getTimeZones = (showTimezoneOffset?: boolean) => {
    const timeZones: { name: string; offset: number }[] = [{ name: 'UTC', offset: 0 }, ...moment.tz.zonesForCountry('US', true)];
    const zones: TimeZoneObject[] = [];

    timeZones.forEach((zone, index) => {
        const tz = timeZones[index];
        const tzAbbr = moment.tz(tz.name).format('z');
        const label = tzAbbr === 'UTC' ? 'UTC' : `(${tzAbbr} / UTC${moment.tz(tz.name).format('Z')}) ${tz.name}`;
        const timeZoneOption: TimeZoneObject = {
            id: index,
            label: showTimezoneOffset ? label : tz.name,
            name: tz.name,
            offset: -tz.offset
        };
        zones.push(timeZoneOption);
    });

    return zones;
};

export const isEventDateValid = (event: IAppointmentPayload | IAppointment, zone: string) =>
    moment.tz(event.start_at, zone) > moment().tz(zone);

export const setDayStart = (date: Moment) => date.set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
