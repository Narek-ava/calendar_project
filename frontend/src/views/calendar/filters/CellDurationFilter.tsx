import { ListItem } from '@material-ui/core';
import Circle from '@material-ui/icons/Circle';
import ListItemFilter from './components/ListItemFilter';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { calendarCellDurations } from '../../../store/constant';
import { setCellData } from '../../../store/slices/calendarFilterSlice';

const CellDurationFilter = () => {
    const { cellData } = useAppSelector((state) => state.calendarFilter);
    const dispatch = useAppDispatch();

    return (
        <>
            <ListItem>Calendar Cell Duration:</ListItem>
            {Object.values(calendarCellDurations).map((d) => (
                <ListItemFilter
                    key={`cell_duration_${d.value}`}
                    label={`${d.value}m`}
                    onClick={() => {
                        dispatch(setCellData(d));
                    }}
                    isActive={cellData.value === d.value}
                    activeIcon={<Circle />}
                />
            ))}
        </>
    );
};

export default CellDurationFilter;
