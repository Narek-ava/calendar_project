import { useMemo } from 'react';
import moment, { Moment } from 'moment-timezone';
import { isAndroid } from 'react-device-detect';

// project-imports
import AndroidTimePicker from './AndroidTimePicker';
import TimePickerAutocomplete from './TimePickerAutocomplete';
import { AppTimePickerProps } from './types';

const AppTimePicker = (props: AppTimePickerProps) => {
    const { outerValue, onTimeSet, disabled } = props;

    // generate array of time options
    const timeOptions = useMemo(() => {
        if (isAndroid) {
            return [];
        }
        // const interval = isAndroid ? 15 : 1;
        const interval = 1;
        const timeLabels: Moment[] = [];
        const startTimeMoment = moment('00:00', 'HH:mm');
        const startPeriod = startTimeMoment.hours() * 60;
        const endPeriod = 1440; // 60min*24 = 1440m
        for (let i = startPeriod; i < endPeriod; i += interval) {
            startTimeMoment.add(i === 0 ? 0 : interval, 'minutes');
            timeLabels.push(startTimeMoment.clone());
        }
        return timeLabels;
    }, []);

    if (isAndroid) {
        return <AndroidTimePicker outerValue={outerValue} onTimeSet={onTimeSet} disabled={disabled} />;
    }

    return <TimePickerAutocomplete {...props} timeOptions={timeOptions} />;
};

export default AppTimePicker;
