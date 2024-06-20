import { useCallback } from 'react';
import Check from '@material-ui/icons/Check';
import ListItemFilter from './components/ListItemFilter';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { setShowScheduledStaffOnly } from '../../../store/slices/calendarFilterSlice';

const ScheduledStaffFilter = () => {
    const { showScheduledStaffOnly } = useAppSelector((state) => state.calendarFilter);
    const dispatch = useAppDispatch();

    const toggleScheduledStaff = useCallback(() => {
        dispatch(setShowScheduledStaffOnly(!showScheduledStaffOnly));
    }, [dispatch, showScheduledStaffOnly]);

    return (
        <ListItemFilter
            label="Scheduled Staff Only"
            onClick={toggleScheduledStaff}
            isActive={showScheduledStaffOnly}
            activeIcon={<Check />}
        />
    );
};

export default ScheduledStaffFilter;
