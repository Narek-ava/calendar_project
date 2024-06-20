import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FormikValues } from 'formik';
import moment from 'moment-timezone';
import { IconLayoutGrid, IconLayoutList, IconListNumbers, IconSquarePlus, IconTemplate } from '@tabler/icons';
import useAuth from 'hooks/useAuth';
// material-ui
import { alpha, Badge, BadgeProps, Box, IconButton, Stack, Theme, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@material-ui/styles';

// fullcalendar.io
import FullCalendar, { DateSelectArg, EventClickArg } from '@fullcalendar/react';
import momentPlugin from '@fullcalendar/moment';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';

// assets
import CalendarStyleWrapper from './CalendarStyleWrapper';
import Toolbar from './components/Toolbar';
import CalendarEventContent from './components/CalendarEventContent';
import EllipsisTypography from '../../ui-component/optimized-text-fields/EllipsisTypography';
import UserAvatar from '../../ui-component/UserAvatar';
import MobileAddNewButton from './components/MobileAddNewButton';
import { clearOuterAppointment } from '../../store/slices/outerAppointmentSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { DefaultRootStateProps } from '../../types';
import { UserRole } from '../../models/IEmployee';
import { AppointmentStatuses, AppointmentType } from '../../models/IAppointment';
import { CalendarModes, CalendarModeValues, CalendarProps, DateRange, GetCalendarModeProps, ViewOption, ViewOptions } from './types';
import { apiTimeFormat, getCalendarWorkingHours, getEmployeeBusinessTime } from '../../store/constant';
import { styled } from '@mui/material/styles';
import DatePickerModal from './components/DatePickerModal';
import useFilterSettings from './hooks/useFilterSettings';
import CalendarFilters from './filters/CalendarFilters';
import { setIsForeignAppointment } from '../../store/slices/calendarSlice';
import { CircularProgress } from '@material-ui/core';
import useSwipe from '../../hooks/useSwipe';
import useMobileCreateButton from '../../hooks/useMobileCreateButton';

const useStyles = makeStyles((theme: Theme) => ({
    cells: {
        '.fc-daygrid-day-top': {
            position: 'relative'
        },
        '&:hover button': {
            display: 'inline-block !important'
        }
    },
    cta: {
        position: 'absolute',
        top: 0,
        right: '4px',
        opacity: 0,
        visibility: 'hidden',
        transform: 'translateX(-10px)',
        fontSize: '20px',
        transition: 'all 0.3s',
        color: theme.palette.primary.main
    },
    progress: {
        position: 'absolute',
        top: 'calc(50% - 20px)',
        left: 'calc(50% - 20px)'
    }
}));

export const viewOptions: ViewOptions = {
    day: {
        label: CalendarModes.Day,
        value: CalendarModeValues.Day,
        icon: IconLayoutList
    },
    resourceDay: {
        label: CalendarModes.Day,
        value: CalendarModeValues.ResourceDay,
        icon: IconLayoutList
    },
    week: {
        label: CalendarModes.Week,
        value: CalendarModeValues.Week,
        icon: IconTemplate
    },
    month: {
        label: CalendarModes.Month,
        value: CalendarModeValues.Month,
        icon: IconLayoutGrid
    },
    agenda: {
        label: 'Agenda',
        value: CalendarModeValues.Agenda,
        icon: IconListNumbers
    }
};

// set events api filtering mode
const getCalendarMode = ({ mode, changeMode }: GetCalendarModeProps) => {
    switch (mode) {
        case viewOptions.month.value:
            changeMode(CalendarModes.Month);
            break;
        case viewOptions.week.value:
            changeMode(CalendarModes.Week);
            break;
        case viewOptions.day.value:
            changeMode(CalendarModes.Day);
            break;
        case viewOptions.resourceDay.value:
            changeMode(CalendarModes.Day);
            break;
        case viewOptions.agenda.value:
            changeMode(CalendarModes.Week);
            break;
        default:
            changeMode(CalendarModes.Month);
    }
};

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: 3,
        top: 2,
        backgroundColor: theme.palette.background.paper,
        padding: 0
    }
}));

const StyledCalendar = ({
    date,
    setDate,
    events,
    setSelectedEvent,
    view,
    setView,
    filters,
    changeMode,
    userRole,
    handleFilter,
    setIsEventOpen,
    setIsEditOpen,
    setSelectedRange,
    employee,
    employees,
    locations,
    services,
    location,
    isMobile,
    matchSm,
    handleOpenChooseEventType,
    setIsBlockOpened,
    setSelectedEmployeeId,
    isFetching
}: CalendarProps) => {
    const { user } = useAuth();
    const { outerAppointment } = useAppSelector((state) => state.outerAppointment);
    const dispatch = useAppDispatch();
    const classes = useStyles();
    const { cellData } = useAppSelector((state) => state.calendarFilter);
    const { selectedEmployeeIds } = useFilterSettings();
    const leftDrawerOpened = useSelector((state: DefaultRootStateProps) => state.customization.opened);
    const calendarRef = useRef<FullCalendar>(null);
    // calendar header staff state (resources)
    const [isDatePickerOpened, setIsDatePickerOpened] = useState(false);
    const [calendarTitle, setCalendarTitle] = useState<string>('');
    const [filtersAnchorEl, setFiltersAnchorEl] = useState<null | HTMLElement>(null);
    const [locationIsSet, setLocationIsSet] = useState<boolean>(false);

    const handleDatePrev = useCallback(() => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();
            calendarApi.prev();
            setDate(moment(calendarApi.getDate()).format());
        }
    }, [setDate]);

    const handleDateNext = useCallback(() => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();
            calendarApi.next();
            setDate(moment(calendarApi.getDate()).format());
        }
    }, [setDate]);

    const onSwipeLeft = useCallback(() => {
        if (view === CalendarModeValues.Day || view === CalendarModeValues.ResourceDay) handleDateNext();
    }, [handleDateNext, view]);

    const onSwipeRight = useCallback(() => {
        if (view === CalendarModeValues.Day || view === CalendarModeValues.ResourceDay) handleDatePrev();
    }, [handleDatePrev, view]);

    const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({ onSwipeLeft, onSwipeRight });

    const openFilters = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setFiltersAnchorEl(event.currentTarget);
    }, []);

    const closeFilters = useCallback(() => {
        setFiltersAnchorEl(null);
    }, []);

    const staff = useMemo(
        () =>
            employees
                .filter((e) => selectedEmployeeIds.includes(e.id))
                .map((employeeElem) => ({
                    // associating with his events by employee ID
                    id: employeeElem.id,
                    title: employeeElem.user.firstname,
                    businessHours: getEmployeeBusinessTime({
                        employee: employeeElem,
                        date,
                        schedule: employeeElem.settings.widget?.use_location_schedule ? location.schedule : employeeElem.schedule,
                        dayId: moment(date).day()
                    }),
                    employee: employeeElem
                })),
        [date, employees, selectedEmployeeIds]
    );

    const filteredEvents = useMemo(() => events.filter((e) => selectedEmployeeIds.includes(e.resourceId)), [events, selectedEmployeeIds]);

    const togglePicker = useCallback(() => {
        setIsDatePickerOpened((state) => !state);
    }, []);

    const closePicker = useCallback(() => {
        setIsDatePickerOpened(false);
    }, []);

    const handleChangeMode = useCallback((mode: string) => {
        getCalendarMode({ mode, changeMode });
        setTitle();
    }, []);

    const resize = () => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();
            calendarApi.updateSize();
        }
    };

    const workingHours = useCallback(() => getCalendarWorkingHours({ events, date, location, view }), [events, date, location, view]);

    // fix calendar size on toggle app sidebar
    useEffect(() => {
        const timer = setTimeout(() => {
            resize();
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [leftDrawerOpened]);

    useEffect(() => {
        if (locationIsSet) {
            handleGoToday();
        }
        setLocationIsSet(true);
    }, [location]);

    useEffect(() => {
        if (outerAppointment) {
            handleGoToDate(new Date(outerAppointment.start_at));
        }
    }, [outerAppointment]);

    useEffect(() => {
        const calendarEl = calendarRef.current;
        const headerToolbar = {
            center: 'prev datePicker next',
            // right: `${locations.length > 0 && services.length > 0 ? 'newEvent filters' : 'filters'}`,
            right: 'filters'
        };

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();
            if (isMobile || (staff.length === 0 && view === CalendarModeValues.ResourceDay)) {
                handleViewChange(viewOptions.day);
                calendarApi.setOption('headerToolbar', {
                    ...headerToolbar,
                    left: 'today timeGridDay,timeGridWeek,dayGridMonth,listWeek'
                });
            } else if (staff.length > 0 && view === CalendarModeValues.Day && userRole !== UserRole.Provider) {
                handleViewChange(viewOptions.resourceDay);
                calendarApi.setOption('headerToolbar', {
                    ...headerToolbar,
                    left: 'today resourceTimeGridDay,timeGridWeek,dayGridMonth,listWeek'
                });
            }
            calendarApi.setOption('titleFormat', { day: 'numeric', weekday: 'short', month: 'short' });
        }
    }, [isMobile, staff, view, date]);

    const generateNewRange = (startDate?: Date) => {
        const time = moment(startDate).tz(location.time_zone).set({ hours: 8, minutes: 0 });
        const newRange: DateRange = {
            start: time.format(apiTimeFormat),
            end: time.clone().add(location.calendar_cell_duration, 'minutes').format(apiTimeFormat),
            duration: null
        };
        setSelectedRange(newRange);
        handleOpenChooseEventType();
    };

    // handler for the outside Add-New-Event-Button
    const handleClickPlus = useCallback(() => {
        generateNewRange();
    }, [location]);

    const injectCellContent = (arg: any) => {
        if (services.length > 0) {
            return (
                <>
                    <Box component="span">{arg.dayNumberText}</Box>
                    <IconButton
                        onClick={() => generateNewRange(arg.date)}
                        color="primary"
                        className={classes.cta}
                        aria-label="add appointment"
                        component="span"
                    >
                        <IconSquarePlus />
                    </IconButton>
                </>
            );
        }
        return undefined;
    };

    const handleViewChange = (newView: ViewOption) => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.changeView(newView.value);
            setView(newView.value);
            handleChangeMode(newView.value);
        }
    };

    const handleSetDate = () => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();
            // calendarApi.setOption('now', new Date(2022, 3, 20, 12, 0, 0));
            setDate(moment(calendarApi.getDate()).format());
            // dispatch(appointmentAPI.util.invalidateTags(['Appointment']));
        }
    };

    const handleEventSelect = (arg: EventClickArg) => {
        if (arg.event.id && arg.event.extendedProps.type !== AppointmentType.BlockedInOtherCompany) {
            const selectEvent = events.find((_event: FormikValues) => _event.id === arg.event.id);
            setSelectedEvent(selectEvent as FormikValues[]);
        } else {
            setSelectedEvent(null);
            dispatch(clearOuterAppointment());
        }
        if (arg.event.extendedProps.type === AppointmentType.Appointment) {
            setIsEventOpen(true);
            return;
        }
        if (arg.event.extendedProps.type === AppointmentType.Blocked_Time) {
            setIsBlockOpened(true);
        }
        if (arg.event.extendedProps.type === AppointmentType.OwnAppointmentInOtherCompany) {
            setIsEventOpen(true);
            dispatch(setIsForeignAppointment(true));
        }
        if (arg.event.extendedProps.type === AppointmentType.OwnBlockInOtherCompany) {
            setIsBlockOpened(true);
            dispatch(setIsForeignAppointment(true));
        }
    };

    // allow selecting only 1 cell
    // const handleTimeSelection = (selection: any) =>
    //     // moment(selection.end).diff(moment(selection.start), 'hours') === 1 && services.length > 0;
    //     !isMobile && services.length > 0;
    const handleTimeSelection = () => services.length > 0;

    const handleRangeSelect = (arg: DateSelectArg) => {
        const calendarEl = calendarRef.current;
        if (calendarEl) {
            const calendarApi = calendarEl.getApi();
            calendarApi.unselect();
        }

        const selectedRange: DateRange = {
            start: moment(arg.start).format(apiTimeFormat),
            end: moment(arg.end).format(apiTimeFormat),
            duration: moment(arg.end).diff(moment(arg.start), 'minutes')
        };
        setSelectedRange(selectedRange);
        if (arg.resource) {
            setSelectedEmployeeId(Number(arg.resource.id));
        }
        handleOpenChooseEventType();
    };

    const handleGoToDate = (arg: Date) => {
        const calendarEl = calendarRef.current;
        if (calendarEl) {
            const calendarApi = calendarEl.getApi();
            calendarApi.gotoDate(arg);
        }
    };

    const handleGoToday = () => {
        const calendarEl = calendarRef.current;
        if (calendarEl) {
            const calendarApi = calendarEl.getApi();
            calendarApi.today();
            setDate(moment.tz(location.time_zone).format());
        }
    };

    const addNewAppointment = () => {
        setIsEditOpen(true);

        const selectedRange: DateRange = {
            start: moment(date).format(apiTimeFormat),
            end: moment(date).format(apiTimeFormat),
            duration: null
        };
        setSelectedRange(selectedRange);
    };

    const setTitle = useCallback(() => {
        const calendarEl = calendarRef.current;
        if (!calendarEl) {
            setCalendarTitle('');
            return;
        }
        const api = calendarEl.getApi();
        setCalendarTitle(api.view.title);
    }, []);

    useEffect(() => {
        setTitle();
    }, [date, setTitle]);

    useMobileCreateButton({
        action: handleClickPlus,
        condition: true
    });

    const onTitleClick = useCallback(() => {
        if (view === CalendarModeValues.Day || view === CalendarModeValues.ResourceDay) {
            setIsDatePickerOpened(true);
        }
    }, [view]);

    return (
        <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <Toolbar
                date={date}
                view={view}
                staff={staff}
                locations={locations}
                services={services}
                viewOptions={viewOptions}
                onClickNew={handleClickPlus}
                onClickToday={handleGoToday}
                onClickNext={handleDateNext}
                onClickPrev={handleDatePrev}
                togglePicker={togglePicker}
                isMobile={isMobile}
                matchSm={matchSm}
                onChangeView={handleViewChange}
                openFilters={openFilters}
                userRole={user?.employee.role.name}
            />
            <CalendarStyleWrapper cellheight={cellData.value} view={view} fetching={isFetching.toString()}>
                {isFetching && <CircularProgress className={classes.progress} />}
                <FullCalendar
                    eventMaxStack={100}
                    // eventResizableFromStart
                    key={date}
                    timeZone={location.time_zone}
                    initialDate={date}
                    slotLabelFormat={{ hour: '2-digit', minute: '2-digit', meridiem: 'short' }}
                    eventTimeFormat={{ hour: 'numeric', minute: '2-digit', omitZeroMinute: true }}
                    ref={calendarRef}
                    dayCellClassNames={classes.cells}
                    dayCellContent={injectCellContent}
                    nowIndicator
                    longPressDelay={300}
                    selectLongPressDelay={300}
                    // apply changes to the view and date onClick to calendar buttons
                    datesSet={(arg) => {
                        setView(arg.view.type);
                        handleChangeMode(arg.view.type);
                        handleSetDate();
                    }}
                    weekends
                    showNonCurrentDates={false}
                    fixedWeekCount={false}
                    slotEventOverlap={false}
                    eventMinHeight={30}
                    displayEventTime
                    eventShortHeight={10}
                    selectable={view !== viewOptions.month.value}
                    selectAllow={handleTimeSelection}
                    handleWindowResize
                    events={filteredEvents}
                    /* ========= FEATURE TO SHOW NON-WORKING HOURS =========== */
                    // events={addBackgroundEvents()}
                    /* ======================================================= */
                    // @ts-ignore
                    resources={staff}
                    resourceLabelContent={(props) => (
                        <Tooltip
                            placement="top"
                            title={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="subtitle2">
                                        {props.resource.extendedProps.employee.user.firstname}{' '}
                                        {props.resource.extendedProps.employee.user.lastname}
                                    </Typography>
                                    {props.resource.extendedProps.employee.is_shifts_enabled && (
                                        <Typography variant="subtitle2">(custom shift)</Typography>
                                    )}
                                </Stack>
                            }
                        >
                            <Stack
                                direction={staff.length > 5 ? 'column' : 'row'}
                                alignItems="center"
                                justifyContent="center"
                                py={1}
                                sx={{ overflow: 'hidden' }}
                            >
                                <EllipsisTypography
                                    text={props.resource.title}
                                    ml={staff.length > 5 ? 0 : 1}
                                    sx={{ order: staff.length > 5 ? 1 : 2 }}
                                />
                                <Box sx={{ position: 'relative' }} px={0.5}>
                                    {props.resource.extendedProps.employee.is_shifts_enabled ? (
                                        <StyledBadge
                                            badgeContent={
                                                <Box sx={{ border: '1px solid', px: '3px', borderRadius: '8px' }}>
                                                    <Typography fontSize="10px">S</Typography>
                                                </Box>
                                            }
                                            color="default"
                                        >
                                            <UserAvatar employee={props.resource.extendedProps.employee} />
                                        </StyledBadge>
                                    ) : (
                                        <UserAvatar employee={props.resource.extendedProps.employee} />
                                    )}
                                </Box>
                            </Stack>
                        </Tooltip>
                    )}
                    displayEventEnd={false}
                    rerenderDelay={10}
                    initialView={view}
                    dayMaxEventRows={4}
                    dayMaxEvents={4}
                    eventDidMount={(arg) => {
                        const { event, el }: any = arg;
                        el.style.border = 'none';
                        if (event.extendedProps.status === AppointmentStatuses.Completed) {
                            el.style.opacity = '0.3';
                            return;
                        }
                        if (event.extendedProps.status === AppointmentStatuses.Canceled) {
                            el.style.textDecoration = 'line-through';

                            if (event.extendedProps.type !== AppointmentType.OwnAppointmentInOtherCompany) {
                                el.style.backgroundColor = '#eabebe';
                                el.style.color = '#000';
                            }
                            return;
                        }
                        if (
                            event.extendedProps.type === AppointmentType.Blocked_Time ||
                            event.extendedProps.type === AppointmentType.OwnBlockInOtherCompany
                        ) {
                            if (view === CalendarModeValues.Month) {
                                // Hide block-type events from month view
                                el.style.display = 'none';
                            } else {
                                el.style.backgroundColor = alpha(event.backgroundColor, 0.5);
                                el.style.border = '20px solid';
                                el.style.borderWidth = '0 0 0 20px';
                                el.style.borderImage = `repeating-linear-gradient(-45deg, ${event.backgroundColor} 0, transparent 1px 5px, ${event.backgroundColor} 6px 10px) 0 0 0 20`;
                                el.style.color = '#000';
                            }
                        }
                        if (event.extendedProps.type === AppointmentType.BlockedInOtherCompany) {
                            el.style.cursor = 'not-allowed';
                        }
                        if (
                            view !== CalendarModeValues.ResourceDay &&
                            view !== CalendarModeValues.Day &&
                            event.extendedProps.type === AppointmentType.BlockedInOtherCompany
                        ) {
                            el.style.display = 'none';
                        }
                    }}
                    moreLinkClick={(info) => {
                        const moreDay = info.date.getDate();
                        handleGoToDate(moment(info.date).set('date', moreDay).toDate());
                        handleViewChange(staff.length ? viewOptions.resourceDay : viewOptions.day);
                    }}
                    allDaySlot={false}
                    height="auto"
                    slotMinTime={workingHours().start}
                    slotMaxTime={workingHours().end}
                    businessHours={workingHours().businessHours}
                    // expandRows
                    slotDuration={cellData.duration}
                    slotLabelInterval={cellData.interval}
                    // CUSTOM EVENT TEXT
                    eventContent={(arg) => (
                        <CalendarEventContent arg={arg} view={view} isSingleEmployeeObserved={filters.employee.length === 1} />
                    )}
                    customButtons={{
                        newEvent: {
                            text: 'New Appointment',
                            click: addNewAppointment
                        },
                        datePicker: {
                            text: calendarTitle,
                            click: onTitleClick
                        },
                        filters: {
                            text: '',
                            click: (e) => {
                                // @ts-ignore
                                openFilters(e);
                            }
                        }
                    }}
                    buttonText={{
                        today: 'Today',
                        month: 'Month',
                        week: 'Week',
                        day: 'Day',
                        list: 'Agenda'
                    }}
                    eventDisplay="block"
                    // eventDisplay="list-item"
                    headerToolbar={{
                        left: 'today resourceTimeGridDay,timeGridWeek,dayGridMonth,listWeek',
                        center: 'prev datePicker next',
                        // right: `${locations.length > 0 && services.length > 0 ? 'newEvent filters' : 'filters'}`,
                        right: 'filters'
                    }}
                    // allDayMaintainDuration
                    select={handleRangeSelect}
                    eventClick={handleEventSelect}
                    windowResizeDelay={10}
                    plugins={[
                        listPlugin,
                        momentPlugin,
                        momentTimezonePlugin,
                        dayGridPlugin,
                        timelinePlugin,
                        resourceTimeGridPlugin,
                        timeGridPlugin,
                        interactionPlugin
                    ]}
                />
                {isMobile && <MobileAddNewButton onClick={handleClickPlus} />}
            </CalendarStyleWrapper>

            <DatePickerModal
                location={location}
                date={date}
                setDate={setDate}
                handleGoToDate={handleGoToDate}
                opened={isDatePickerOpened}
                handleClose={closePicker}
            />
            <CalendarFilters
                mode={filters.mode}
                isMobile={isMobile}
                employee={employee}
                employees={employees}
                locations={locations}
                location={location}
                userRole={userRole}
                onFilter={handleFilter}
                anchorEl={filtersAnchorEl}
                close={closeFilters}
            />
        </div>
    );
};

export default StyledCalendar;
