import { useCallback, useMemo } from 'react';
import { TimeZoneObject, TimeZoneSelectProps } from './types';
import { Autocomplete, TextField } from '@mui/material';
import { getTimeZones } from '../../utils/functions/time-zones-helpers';

const TimeZoneSelect: React.FC<TimeZoneSelectProps> = ({ onChange, showTimezoneOffset, selectValue }) => {
    const handleChange = useCallback(
        (timezoneOption: TimeZoneObject | null) => {
            if (timezoneOption) {
                onChange(timezoneOption.name);
            }
        },
        [onChange]
    );

    const options: TimeZoneObject[] = useMemo(() => getTimeZones(showTimezoneOffset), [showTimezoneOffset]);

    const getDefaultZone = useMemo(() => {
        const matchingOption = options.find((option: TimeZoneObject) => option.name === selectValue);
        return matchingOption || undefined;
    }, [options, selectValue]);

    return (
        <Autocomplete
            id="time-zone-select"
            options={options}
            autoHighlight
            value={getDefaultZone}
            disableClearable
            getOptionLabel={(option) => option.label}
            onChange={(event, value) => handleChange(value)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    inputProps={{
                        ...params.inputProps
                    }}
                />
            )}
        />
    );
};

export default TimeZoneSelect;
