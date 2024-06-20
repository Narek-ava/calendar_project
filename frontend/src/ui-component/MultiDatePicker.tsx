import { MouseEventHandler, useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import weekends from 'react-multi-date-picker/plugins/highlight_weekends';
import Icon from 'react-multi-date-picker/components/icon';
import { Button } from '@mui/material';

interface MultiDatePickerProps {
    incomingDates: string[];
    setDates: (data: string[]) => void;
    dateFormat?: string;
    buttonText?: string;
}

type PickerValueType = DateObject | DateObject[] | null;

const MultiDatePicker = ({ incomingDates, setDates, dateFormat = 'MM/DD/YYYY', buttonText = 'Select Dates' }: MultiDatePickerProps) => {
    const [innerValues, setInnerValues] = useState<PickerValueType>(null);

    useEffect(() => {
        const parsedValues = incomingDates.map((date) => new DateObject({ date, format: dateFormat }));
        setInnerValues(parsedValues.length > 0 ? parsedValues : null);
    }, [incomingDates]);

    const handleChangeValues = (selectedDates: PickerValueType) => {
        setInnerValues(selectedDates);
        if (selectedDates) {
            if (Array.isArray(selectedDates)) {
                const outerDates = selectedDates.map((date) => date.format(dateFormat));
                setDates(outerDates);
                return;
            }
            setDates([selectedDates.format(dateFormat)]);
        }
    };

    return (
        <DatePicker
            value={innerValues}
            onChange={handleChangeValues}
            format={dateFormat}
            multiple
            plugins={[<DatePanel sort="date" />, weekends()]}
            render={(_: any, openCalendar: MouseEventHandler<HTMLButtonElement> | undefined) => (
                <Button startIcon={<Icon />} onClick={openCalendar} variant="outlined">
                    {buttonText}
                </Button>
            )}
        />
    );
};

export default MultiDatePicker;
