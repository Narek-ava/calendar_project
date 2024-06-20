import CalendarDatePicker from './CalendarDatePicker';
import { DatePickerModalProps } from '../types';
import { useState } from 'react';
import moment from 'moment-timezone';
import CBModal from '../../../ui-component/CBModal';

const DatePickerModal = ({ setDate, handleGoToDate, location, date, opened, handleClose }: DatePickerModalProps) => {
    const [currentMonthInPicker, setCurrentMonthInPicker] = useState<string>(moment(date).format('MMMM YYYY'));

    return (
        <CBModal title={currentMonthInPicker} hideCloseButton open={opened} onClose={handleClose} fullWidth>
            <CalendarDatePicker
                location={location}
                date={date}
                setDate={setDate}
                handleGoToDate={handleGoToDate}
                setCurrentMonthInPicker={setCurrentMonthInPicker}
                onDateChange={handleClose}
            />
        </CBModal>
    );
};

export default DatePickerModal;
