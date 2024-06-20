import { useCallback } from 'react';
import Check from '@material-ui/icons/Check';
import ListItemFilter from './components/ListItemFilter';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { setShowCancelledAppointments } from '../../../store/slices/calendarFilterSlice';

const CancelledAppointmentsFilter = () => {
    const { showCancelledAppointments } = useAppSelector((state) => state.calendarFilter);
    const dispatch = useAppDispatch();

    const toggleCancelledAppointments = useCallback(() => {
        dispatch(setShowCancelledAppointments(!showCancelledAppointments));
    }, [dispatch, showCancelledAppointments]);

    return (
        <ListItemFilter
            label="Cancelled Appointments"
            onClick={toggleCancelledAppointments}
            isActive={showCancelledAppointments}
            activeIcon={<Check />}
        />
    );
};

export default CancelledAppointmentsFilter;
