import { MouseEventHandler, useCallback, useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import Icon from 'react-multi-date-picker/components/icon';
import { Button, Stack } from '@mui/material';
import { appDateFormat } from '../store/constant';

export type PickerValueType = DateObject | DateObject[] | null;

interface DateRangePickerProps {
    setDates: (data: PickerValueType) => void;
    value: PickerValueType;
    dateFormat?: string;
    range?: boolean;
    buttonText?: string;
    onClose?: () => void;
    onChangeCb?: () => void;
    isMobile?: boolean;
}

const DateRangePicker = ({
    value,
    setDates,
    dateFormat = appDateFormat,
    buttonText = 'Select Date',
    onClose,
    onChangeCb,
    range,
    isMobile
}: DateRangePickerProps) => {
    const [innerValues, setInnerValues] = useState<PickerValueType>(value);

    useEffect(() => {
        setInnerValues(value);
    }, [value]);

    // useEffect(() => {
    //     const parsedValues = incomingDates.map((date) => new DateObject({ date, format: dateFormat }));
    //     setInnerValues(parsedValues.length > 0 ? parsedValues : null);
    // }, [incomingDates]);

    const handleChangeValues = (selectedDates: PickerValueType) => {
        if (selectedDates) {
            if (Array.isArray(selectedDates)) {
                setDates(selectedDates);
                if (onChangeCb) {
                    onChangeCb();
                }
                return;
            }
            if (range) {
                setDates([selectedDates]);
            } else {
                setDates(selectedDates);
            }
            if (onChangeCb) {
                onChangeCb();
            }
        } else {
            setDates(null);
        }
    };

    const getDisabledState = useCallback(() => !innerValues || (Array.isArray(innerValues) && innerValues.length === 0), [innerValues]);

    return (
        <DatePicker
            value={innerValues}
            onChange={handleChangeValues}
            format={dateFormat}
            range={range}
            numberOfMonths={range && !isMobile ? 2 : 1}
            multiple={false}
            onOpenPickNewDate={false}
            onClose={onClose}
            plugins={[<DatePanel sort="date" />]}
            render={(_: DateObject, openCalendar: MouseEventHandler<HTMLButtonElement> | undefined) => (
                <Button startIcon={<Icon />} onClick={openCalendar} variant="outlined">
                    {buttonText}
                </Button>
            )}
        >
            <Stack direction="row" alignItems="center" justifyContent="center" sx={{ borderTop: '1px solid #cfd8e2' }}>
                <Button
                    disabled={getDisabledState()}
                    onClick={() => {
                        setInnerValues(null);
                        if (range) {
                            setDates([]);
                        } else {
                            setDates(null);
                        }
                    }}
                >
                    DESELECT
                </Button>
            </Stack>
        </DatePicker>
    );
};

export default DateRangePicker;
