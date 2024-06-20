import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { getHumanizedDuration, removeZeroMinutes } from '../../../store/constant';
import moment from 'moment-timezone';
import ArrowRight from '@material-ui/icons/ArrowRight';
import { EventContentArg } from '@fullcalendar/react';
import { useCallback } from 'react';
import { FormikValues } from 'formik';
import { CalendarModeValues } from '../types';
import { makeStyles } from '@material-ui/styles';
import { AppointmentType } from '../../../models/IAppointment';

interface CalendarEventContentProps {
    arg: EventContentArg;
    view: string;
    isSingleEmployeeObserved: boolean;
}

const useStyles = makeStyles(() => ({
    eventText: {
        fontSize: '12px',
        whiteSpace: 'nowrap'
    }
}));

const CalendarEventContent = ({ arg, view, isSingleEmployeeObserved }: CalendarEventContentProps) => {
    const classes = useStyles();
    const eventDuration = useCallback((event: FormikValues) => Math.ceil(moment(event.end).diff(moment(event.start), 'minutes', true)), []);

    if (arg.event && arg.event.extendedProps.type !== 'background') {
        return (
            <Box sx={{ cursor: arg.event.title ? 'pointer' : 'not-allowed' }}>
                <Tooltip
                    title={arg.event.title ? `Customer: ${arg.event.title}` : ''}
                    placement="top"
                    disableHoverListener={view !== CalendarModeValues.Month}
                >
                    <Stack
                        direction={view === CalendarModeValues.Week ? 'column' : 'row'}
                        alignItems={view === CalendarModeValues.Week ? undefined : 'center'}
                        // direction="row"
                        // alignItems="center"
                        sx={{
                            overflow: 'hidden',
                            ml: view === CalendarModeValues.Week || view === CalendarModeValues.Month ? '4px' : 1,
                            // mt: view === CalendarModeValues.Week ? '-4px' : 0
                            py: view === CalendarModeValues.Month ? '4px' : undefined
                        }}
                    >
                        <Stack direction="row" alignItems="center">
                            <Stack direction="row" alignItems="center" sx={{ flexWrap: 'nowrap' }}>
                                <Typography className={classes.eventText}>
                                    {removeZeroMinutes(moment(arg.event.start))},&nbsp;
                                    {getHumanizedDuration(Number(eventDuration(arg.event)))}&nbsp;
                                </Typography>
                            </Stack>
                            {isSingleEmployeeObserved && arg.event.extendedProps.type === AppointmentType.Appointment && (
                                <Stack direction="row" alignItems="center" sx={{ flexWrap: 'nowrap', mr: '5px' }}>
                                    <Typography className={classes.eventText} sx={{ mr: '5px' }}>
                                        {arg.event.extendedProps.service.name}
                                    </Typography>
                                    {(view === CalendarModeValues.Day || view === CalendarModeValues.ResourceDay) && <ArrowRight />}
                                    {view === CalendarModeValues.Month && <Typography className={classes.eventText}>-</Typography>}
                                </Stack>
                            )}
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            sx={{ flexWrap: 'nowrap', mt: view === CalendarModeValues.Week ? '-4px' : 0 }}
                        >
                            <Typography className={classes.eventText}>{arg.event.title}</Typography>
                        </Stack>
                    </Stack>
                </Tooltip>
            </Box>
        );
    }
    return <></>;
};

export default CalendarEventContent;
