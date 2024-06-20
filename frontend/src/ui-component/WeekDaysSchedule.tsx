import moment from 'moment-timezone';
import { Switch, Table, TableBody, TableCell, TableRow, Typography } from '@material-ui/core';
import { IWeekDaySchedule } from '../models/IService';
import { useState } from 'react';
import { useMediaQuery } from '@mui/material';

interface WeekDaysScheduleProps {
    schedule: IWeekDaySchedule[];
    onChange: (data: IWeekDaySchedule[]) => void;
    title?: string;
}

const WeekDaysSchedule = ({ schedule, onChange, title }: WeekDaysScheduleProps) => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [innerSchedule, setInnerSchedule] = useState(schedule);

    const handleDayClick = (id: number) => {
        const updatedSchedule = innerSchedule.map((dayItem) => {
            if (dayItem.id === id) {
                return { ...dayItem, enable: !dayItem.enable };
            }
            return dayItem;
        });
        setInnerSchedule(updatedSchedule);
        onChange(updatedSchedule);
    };

    return (
        <>
            <Typography mt={{ xs: 1, sm: 0 }} mb={1}>
                {title}
            </Typography>
            <Table sx={{ width: isMobile ? '100%' : 'auto' }}>
                <TableBody>
                    {schedule.map((day) => (
                        <TableRow key={`schedule_${day.id}`}>
                            <TableCell
                                sx={{ cursor: 'pointer', borderBottom: 'none', pl: isMobile ? 4 : 0 }}
                                onClick={() => {
                                    handleDayClick(day.id);
                                }}
                                width={isMobile ? 'auto' : 100}
                                padding="none"
                            >
                                {moment().weekday(day.id).format('dddd')}
                            </TableCell>
                            <TableCell padding="none" sx={{ borderBottom: 'none', textAlign: isMobile ? 'right' : 'left' }}>
                                <Switch
                                    checked={innerSchedule[day.id].enable}
                                    value={innerSchedule[day.id].enable}
                                    onChange={() => {
                                        handleDayClick(day.id);
                                    }}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
};

export default WeekDaysSchedule;
