import { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';

import moment from 'moment';
import useMask from '../../hooks/useMask';

interface GetTimeLabels {
    startTime: string | undefined;
    endTime: string | undefined;
    interval: number;
}

interface TimeLabel {
    value: string;
    label: string;
}

const getTimelineLabels = ({ startTime, endTime, interval }: GetTimeLabels): TimeLabel[] => {
    const timeLabels: TimeLabel[] = [];
    const startTimeMoment = startTime ? moment(startTime, 'hh:mm') : moment();
    const startPeriod = startTime ? startTimeMoment.hours() * 60 : 0;
    const endPeriod = endTime ? moment(endTime, 'hh:mm').hours() * 60 : 1440; // 60min*24 = 1440m
    for (let i = startPeriod; i < endPeriod; i += interval) {
        startTimeMoment.add(i === 0 ? 0 : interval, 'minutes');
        timeLabels.push({
            value: startTimeMoment.format('hh:mm a'),
            label: startTimeMoment.format('hh:mm a')
        });
    }
    return timeLabels;
};

interface OptimizedTimePickerProps {
    startTime?: string;
    endTime?: string;
    interval: number;
}

const OptimizedTimePicker = ({ interval = 5, startTime = '00:00', endTime }: OptimizedTimePickerProps) => {
    const { onInput, onKeyDown } = useMask();
    const [error, setError] = useState('');

    return (
        <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={getTimelineLabels({ startTime, endTime, interval })}
            onInput={onInput}
            freeSolo
            onKeyDown={onKeyDown}
            sx={{ width: 300 }}
            clearOnBlur={false}
            ListboxProps={{
                style: {
                    borderBottom: '1px solid'
                }
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    onChange={(e) => {
                        if (error) {
                            setError('');
                        }
                    }}
                    onBlur={(e) => {
                        if (!/^(0?[1-9]|1[012])(:[0-5]\d) [APap][mM]$/.test(e.target.value)) {
                            setError('Invalid 12h time format');
                        }
                        if (!e.target.value) {
                            setError('');
                        }
                    }}
                    error={!!error}
                    helperText={error}
                    label="TimePicker"
                    // onChange={(e) => onInput(e)}
                    // onKeyDown={onKeyDown}
                />
            )}
        />
    );
};

export default OptimizedTimePicker;
