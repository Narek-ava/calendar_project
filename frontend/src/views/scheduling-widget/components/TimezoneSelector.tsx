import { useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import timezones from './timezones';

interface TimezoneSelectorProps {
    timezone: string | null;
    setTimezone: (timezone: string) => void;
}

const TimezoneSelector = ({ timezone, setTimezone }: TimezoneSelectorProps) => {
    const value = useMemo(() => {
        const tz = timezone || 'UTC;';

        return timezones.find((t) => t.timezone === tz) || { location: tz, label: tz, timezone: tz };
    }, [timezone]);

    return (
        <>
            <Autocomplete
                fullWidth
                disableClearable
                size="small"
                disablePortal
                id="timezone-select"
                options={timezones}
                groupBy={(option) => option.location}
                renderInput={(params) => <TextField {...params} label="Timezone" />}
                value={value}
                onChange={(e, val) => {
                    setTimezone(val.timezone);
                }}
                ListboxProps={{
                    style: { maxHeight: '300px' }
                }}
            />
        </>
    );
};

export default TimezoneSelector;
