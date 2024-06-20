// third-party
import { useCallback, useEffect, useMemo, useState } from 'react';
import { map, startCase, toLower } from 'lodash';
import { FormikValues } from 'formik';
import moment from 'moment-timezone';

// material-ui
import { CircularProgress, Dialog, Theme, useMediaQuery } from '@material-ui/core';
import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@material-ui/core/styles';
import { Grid, Stack } from '@mui/material';

// project imports
import useAuth from '../../hooks/useAuth';
import employeeAPI from '../../services/EmployeeService';
import locationAPI from '../../services/LocationService';
import appointmentAPI from '../../services/AppointmentService';
import {
    AppointmentStatuses,
    AppointmentStatusPayload,
    AppointmentType,
    IAppointment,
    IAppointmentPayload
} from '../../models/IAppointment';
import { UserRole } from '../../models/IEmployee';
import { ILocation } from '../../models/ILocation';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { SNACKBAR_OPEN } from '../../store/actions';
import { SnackBarTypes } from '../../store/snackbarReducer';
import AppointmentWizard from './wizard/AppointmentWizard';
import serviceAPI from '../../services/ServiceService';
import StyledCalendar from './StyledCalendar';
import { openConfirmPopup } from '../../store/confirmPopupSlice';
import { colors } from '../../store/constant';
import AppointmentCard from './appointment-card/AppointmentCard';
import AppointmentOrBlockDialog from './modals/AppointmentOrBlockDialog';
import BlockTimeDialog from './appointment-block/BlockTimeDialog';
import { clearOuterAppointment } from '../../store/slices/outerAppointmentSlice';
import MobileActionConfirmation from './modals/MobileActionConfirmation';
import appointmentWidgetAPI from '../../services/WidgetService';
import { stopSubmitting } from 'store/slices/SubmittingSlice';
import { CalendarModes, CalendarModeValues, DateRange, FilterProps, FiltersProps } from './types';
import { skipToken } from '@reduxjs/toolkit/query/react';
import useFilterSettings from './hooks/useFilterSettings';
import {
    setAllEmployees,
    setBusyEmployeeIds,
    setCalendarDate,
    setCalendarLocationFilter,
    setShowSearch
} from '../../store/slices/calendarFilterSlice';
import { setIsForeignAppointment } from '../../store/slices/calendarSlice';
import { useDebouncedCallback } from 'use-debounce';
import Welcome from './Welcome/Welcome';

const statuses = [];
for (const [propertyValue] of Object.entries(AppointmentStatuses)) {
    statuses.push(propertyValue.toLowerCase());
}

// ==============================|| CALENDAR ||============================== //

const Calendar = () => {
    const theme = useTheme();
    // incoming location filter (from direct link to location's calendar)
    const { selectedLocation, selectedEmployee, showCancelledAppointments, searchString, allEmployees } = useAppSelector(
        (state) => state.calendarFilter
    );
    const { selectedServiceIds, selectedEmployeeIds } = useFilterSettings();
    const { outerAppointment } = useAppSelector((state) => state.outerAppointment);

    const matchSm = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('sm'));
    const isMobile = useMediaQuery('(max-width:768px)');
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const isCalendaraRole = user?.employee.role.name === UserRole.ReadOnlyLimited;
    // location used by calendar filter
    const location = selectedLocation;

    const setLocation = useCallback(
        (loc: ILocation) => {
            dispatch(setCalendarLocationFilter(loc));
        },
        [dispatch]
    );

    const [filters, setFilters] = useState<FiltersProps>({
        mode: CalendarModes.Day.toLowerCase(),
        employee: '',
        location: '',
        customerInfo: ''
    } as FiltersProps);
    const [isEventTypeSelectOpened, setIsEventTypeSelectOpened] = useState(false);
    const [isEventOpen, setIsEventOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [date, setDate] = useState<string>(moment().format());
    const [view, setView] = useState<CalendarModeValues | string>(
        user?.employee.role.name === UserRole.Provider ? CalendarModeValues.Day : CalendarModeValues.ResourceDay
    );
    const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<FormikValues | null>(null);
    const [isRescheduled, setIsRescheduled] = useState(false);
    const [rangeMode, setRangeMode] = useState(false);
    const [isBlockOpened, setIsBlockOpened] = useState(false);
    const [isEditBlockMode, setIsEditBlockMode] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

    const appointments = appointmentAPI.useFetchAllAppointmentsQuery(
        filters.location
            ? {
                  mode: filters.mode,
                  date: moment(date).format('YYYY-MM-DD'),
                  employee: filters.employee.length > 0 ? filters.employee : undefined,
                  location: filters.location,
                  customerInfo: filters.customerInfo
              }
            : skipToken
    );

    const globalAppointments = appointmentAPI.useFetchGlobalAppointmentsQuery(
        filters.location
            ? {
                  mode: filters.mode,
                  date: moment(date).format('YYYY-MM-DD'),
                  employee: filters.employee.length > 0 ? filters.employee : undefined,
                  location: filters.location,
                  customerInfo: filters.customerInfo
              }
            : skipToken
    );

    const locations = locationAPI.useFetchAllLocationsQuery({}, { refetchOnMountOrArgChange: true });
    const services = serviceAPI.useFetchAllServicesQuery({});
    const employeesResource = employeeAPI.useFetchAllEmployeesQuery({});
    const [createAppointment] = appointmentAPI.useCreateAppointmentMutation();
    const [updateAppointment] = appointmentAPI.useUpdateAppointmentMutation();
    const [deleteAppointment] = appointmentAPI.useDeleteAppointmentMutation();
    const [setAppointmentStatus] = appointmentAPI.useSetAppointmentStatusMutation();

    // filters calendar by incoming location or by default
    useEffect(() => {
        if (!locations.isFetching && locations.data) {
            const savedLocation = locations.data.data.find((loc) => loc.id === user?.employee.settings.calendar.selected_location_id);
            const firstLocation = locations.data.data[0];
            setLocation(savedLocation || firstLocation);
            setIsLoading(false);
            // starts data fetching with filters
            setFilters({
                mode: filters.mode,
                employee: selectedEmployee ? String(selectedEmployee.id) : '',
                location: String(savedLocation?.id || firstLocation?.id),
                customerInfo: searchString
            });
        }
    }, [locations.isFetching]);

    useEffect(() => {
        if (location) {
            moment.tz.setDefault(location.time_zone);
        }
    }, [location]);

    // incoming appointment from email or notification
    useEffect(() => {
        if (outerAppointment) {
            setSelectedEvent(outerAppointment);
            setIsEventOpen(true);
        }
    }, [outerAppointment]);

    const setSelectedAppointment = (): IAppointment | string | undefined => {
        if (outerAppointment !== undefined) {
            return outerAppointment;
        }
        return selectedEvent?.id;
    };

    // show search filter only on calendar page
    useEffect(() => {
        dispatch(setShowSearch(true));

        return () => {
            dispatch(setShowSearch(false));
        };
    }, []);

    useEffect(() => {
        handleFilter({
            mode: filters.mode,
            location: selectedLocation,
            // turn off backend filtering by employee ids (https://app.clickup.com/t/8677qyjjq)
            // employees: selectedEmployeeIds ? allEmployees.filter((e) => selectedEmployeeIds.includes(e.id)) : allEmployees || [],
            employees: [],
            customerInfo: searchString
        });
    }, [searchString, selectedEmployeeIds, allEmployees]);

    // transform API appointments data to Fullcalendar events
    const events = useMemo(() => {
        if (!appointments.data || !location) return [];

        const data = showCancelledAppointments
            ? appointments.data
            : appointments.data.filter((a) => a.status !== AppointmentStatuses.Canceled);

        const formattedEvents = data.map((event: IAppointment) => ({
            // block-time events props
            ...(event.type === AppointmentType.Blocked_Time && { className: 'blocked-time' }),
            ...(event.type === AppointmentType.Blocked_Time && { overlap: true }),
            ...(event.type === AppointmentType.Blocked_Time && {
                borderColor: `linear-gradient(45deg, #${event.employee.background_color} 50%, #${event.employee.text_color} 50%)`
            }),
            // regular event props
            id: event.id,
            resourceId: event.employee.id,
            // hide canceled events in mobile view
            ...(matchSm && event.status === AppointmentStatuses.Canceled && { display: 'none' }),
            title:
                event.type === AppointmentType.Appointment
                    ? `${event.customer.firstname} ${event.customer.lastname}`
                    : `Block: ${event.employee.user.firstname} ${event.employee.user.lastname}`,
            description: '',
            color: event.employee && event.employee.background_color ? `#${event.employee.background_color}` : colors.blue.value,
            borderColor: event.employee.background_color,
            textColor:
                event.type === AppointmentType.Appointment ? theme.palette.getContrastText(`#${event.employee.background_color}`) : '#000',
            allDay: false,
            start: event.start_at,
            end: event.end_at,
            extendedProps: {
                ...event
            },
            payments: event.payments
        }));

        return selectedServiceIds
            ? formattedEvents.filter(
                  (e) => selectedServiceIds.includes(e.extendedProps.service?.id) || e.extendedProps.type === AppointmentType.Blocked_Time
              )
            : formattedEvents;
    }, [appointments.data, location, showCancelledAppointments, selectedServiceIds, matchSm, theme.palette]);

    const globalEvents = useMemo(() => {
        if (!globalAppointments.data) return [];

        return globalAppointments.data.map((event: IAppointment) => {
            let title;
            let type;

            if (event.type === AppointmentType.Blocked_Time) {
                title = event.employee?.user ? `Block: ${event.employee?.user?.firstname} ${event.employee?.user?.lastname}` : 'Block';
                type =
                    event?.foreign_employee?.id === user?.employee.id
                        ? AppointmentType.OwnBlockInOtherCompany
                        : AppointmentType.BlockedInOtherCompany;
            } else {
                title = event?.foreign_employee?.id === user?.employee.id ? `${event.customer?.firstname} ${event.customer?.lastname}` : '';
                type =
                    event?.foreign_employee?.id === user?.employee.id
                        ? AppointmentType.OwnAppointmentInOtherCompany
                        : AppointmentType.BlockedInOtherCompany;
            }

            return {
                id: event.id,
                start: event.start_at,
                end: event.end_at,
                resourceId: event?.foreign_employee?.id || 0,
                extendedProps: {
                    ...event,
                    type
                },
                backgroundColor: event?.foreign_employee?.id === user?.employee.id ? theme.palette.secondary[200] : theme.palette.grey[400],
                title
            };
        });
    }, [globalAppointments.data, theme.palette.grey]);

    const allEvents = useMemo(() => [...events, ...globalEvents], [events, globalEvents]);

    useEffect(() => {
        const currentDayEvents = allEvents.filter((e) => moment(e.start).isSame(moment(date), 'day'));
        dispatch(setBusyEmployeeIds(Array.from(new Set(currentDayEvents.map((e) => e.resourceId)))));
    }, [allEvents, dispatch, date]);

    const showSnackbar = ({ alertSeverity, message }: { alertSeverity: SnackBarTypes; message: string }) => {
        dispatch({
            type: SNACKBAR_OPEN,
            open: true,
            message,
            variant: 'alert',
            alertSeverity,
            anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
    };

    const invalidateAppointmentTag = () => {
        dispatch(appointmentAPI.util.invalidateTags(['Appointment']));
        dispatch(appointmentWidgetAPI.util.invalidateTags(['AppointmentWidget']));
    };

    const handleChangeMode = (arg: CalendarModes) => {
        setFilters((prev) => ({ ...prev, mode: arg.toLowerCase() }));
    };

    const handleFilter = useDebouncedCallback((arg: FilterProps) => {
        setFilters({
            mode: filters.mode,
            location: String(arg.location?.id || 0),
            employee: map(arg.employees, 'id').toString(),
            customerInfo: arg.customerInfo
        });
    }, 400);

    const reschedule = () => {
        setIsEventOpen(false);
        setIsRescheduled(true);
        setIsEditOpen(true);
    };

    const handleEventCreate = (data: IAppointmentPayload) => {
        createAppointment(data)
            .unwrap()
            .then(() => {
                showSnackbar({
                    message: data.type === AppointmentType.Appointment ? 'Appointment Created' : 'Time Block Created',
                    alertSeverity: SnackBarTypes.Success
                });
                invalidateAppointmentTag();
                if (data.type === AppointmentType.Appointment) {
                    handleEditClose();
                }
                if (data.type === AppointmentType.Blocked_Time) {
                    handleCloseBlock();
                }
                dispatch(stopSubmitting());
                // setUploadedImagesUrls(null);
            })
            .catch((e) => {
                if (e.data) {
                    showSnackbar({
                        message: e.data,
                        alertSeverity: SnackBarTypes.Error
                    });
                } else {
                    showSnackbar({
                        message:
                            data.type === AppointmentType.Appointment
                                ? "Appointment hasn't been created"
                                : "Time Block hasn't been Created",
                        alertSeverity: SnackBarTypes.Error
                    });
                }
                dispatch(stopSubmitting());
            });
    };

    const handleUpdateEvent = (eventId: string, data: IAppointmentPayload) => {
        data.price = selectedEvent?.price || selectedEvent?.extendedProps?.price;
        updateAppointment({ appointmentId: eventId, data })
            .unwrap()
            .then(() => {
                showSnackbar({
                    message: `${data.type === AppointmentType.Appointment ? 'Appointment' : 'Time Block'} Updated`,
                    alertSeverity: SnackBarTypes.Success
                });

                if (isRescheduled) {
                    setIsRescheduled(false);
                }
                if (data.type === AppointmentType.Appointment) {
                    handleEditClose();
                }
                if (data.type === AppointmentType.Blocked_Time) {
                    handleCloseBlock();
                    setIsEditBlockMode(false);
                }
                invalidateAppointmentTag();
                dispatch(stopSubmitting());
                // setUploadedImagesUrls(null);
            })
            .catch((e) => {
                if (e.data) {
                    showSnackbar({
                        message: e.data,
                        alertSeverity: SnackBarTypes.Error
                    });
                } else {
                    showSnackbar({
                        message: `${data.type === AppointmentType.Appointment ? 'Appointment' : 'Time Block'} hasn't been Updated`,
                        alertSeverity: SnackBarTypes.Error
                    });
                }
                dispatch(stopSubmitting());
            });
    };

    const deleteEventConfirm = (id: string | number, type: AppointmentType) => {
        dispatch(
            openConfirmPopup({
                onConfirm: () => handleEventDelete(id, type),
                confirmText: `Delete`,
                text: `Are you sure you want to delete this ${type === AppointmentType.Appointment ? 'appointment' : 'time block'}?`
            })
        );
    };

    const handleEventDelete = (id: string | number, type: AppointmentType) => {
        deleteAppointment(id)
            .unwrap()
            .then(() => {
                showSnackbar({
                    message: `${type === AppointmentType.Appointment ? 'Appointment' : 'Time Block'} Deleted`,
                    alertSeverity: SnackBarTypes.Success
                });
                invalidateAppointmentTag();
            })
            .catch(() => {
                showSnackbar({
                    message: `${type === AppointmentType.Appointment ? 'Appointment' : 'Time Block'} hasn't been Deleted`,
                    alertSeverity: SnackBarTypes.Error
                });
            });
        if (type === AppointmentType.Appointment) {
            handleEditClose();
        }
        if (type === AppointmentType.Blocked_Time) {
            handleCloseBlock();
            setIsEditBlockMode(false);
        }
    };

    const changeStatusConfirm = (data: AppointmentStatusPayload) => {
        dispatch(
            openConfirmPopup({
                onConfirm: () => handleChangeStatus(data),
                confirmText: `Confirm Change`,
                text: `Are you sure you want to change Appointment status to: ${data.status.toUpperCase()}?`
            })
        );
    };

    const handleChangeStatus = (data: AppointmentStatusPayload) => {
        if (selectedEvent) {
            setAppointmentStatus({
                appointmentId: selectedEvent.id,
                data
            })
                .unwrap()
                .then(() => {
                    showSnackbar({
                        message: `Appointment ${startCase(toLower(data.status))}`,
                        alertSeverity: SnackBarTypes.Success
                    });
                    setIsEventOpen(false);
                    setSelectedEvent(null);
                    dispatch(clearOuterAppointment());
                    invalidateAppointmentTag();
                })
                .catch(() => {
                    showSnackbar({
                        message: "Error: Appointment status hasn't been Updated",
                        alertSeverity: SnackBarTypes.Error
                    });
                });
        }
    };

    const handleCloseBlock = () => {
        dispatch(setIsForeignAppointment(false));
        setIsEventTypeSelectOpened(false);
        setSelectedRange(null);
        setSelectedEvent(null);
        setIsEditBlockMode(false);
        setIsBlockOpened(false);
    };

    const handleEventClose = () => {
        dispatch(setIsForeignAppointment(false));
        setIsEventOpen(false);
        setSelectedRange(null);
        dispatch(clearOuterAppointment());
    };

    const handleEditClose = () => {
        setSelectedEmployeeId(null);
        setIsEventTypeSelectOpened(false);
        setSelectedEvent(null);
        setIsRescheduled(false);
        setSelectedRange(null);
        dispatch(clearOuterAppointment());
        setIsEditOpen(false);
    };

    const openTypeSelect = useCallback(() => {
        setIsEventTypeSelectOpened(true);
    }, []);

    const closeTypeSelect = useCallback(() => {
        setIsEventTypeSelectOpened(false);
    }, []);

    const openWizard = useCallback(() => {
        closeTypeSelect();
        setIsEditOpen(true);
    }, []);

    const openBlock = useCallback(() => {
        closeTypeSelect();
        setIsBlockOpened(true);
    }, []);

    useEffect(() => {
        dispatch(
            setAllEmployees(
                employeesResource?.data?.data.filter((employeeElem) =>
                    employeeElem.services.length > 0 &&
                    selectedLocation?.employees.some((employeeUser) => employeeUser.id === employeeElem.id)
                        ? employeeElem
                        : undefined
                ) || []
            )
        );
    }, [employeesResource, dispatch, selectedLocation]);

    useEffect(() => {
        dispatch(setCalendarDate(date));
    }, [date, dispatch]);

    const isFetching = useMemo(() => appointments.isFetching || globalAppointments.isFetching, [
        appointments.isFetching,
        globalAppointments.isFetching
    ]);

    const isCompanySetupProperly = useMemo(
        () =>
            // Organization has at least 1 location
            !!locations.data?.data.length &&
            // Organization has at least 1 service with attached location
            services.data &&
            services.data?.data.length > 0 &&
            !!services.data.data.find((s) => s.locations?.length) &&
            // Organization has at least 1 employee with attached service and location
            employeesResource.data &&
            employeesResource.data.data.length &&
            !!employeesResource.data.data.find((e) => e.services.length && e.locations.length),
        [locations, services, employeesResource]
    );

    return (
        <>
            {!isLoading && !appointments.isLoading && allEmployees && locations.data && services.data && user && (
                <>
                    {isCompanySetupProperly && location ? (
                        <MainCard contentSX={{ padding: isMobile ? '0' : '24px 24px 0' }} id="calendar_wrapper">
                            <StyledCalendar
                                date={date}
                                setDate={setDate}
                                changeMode={handleChangeMode}
                                view={view}
                                setView={setView}
                                events={allEvents}
                                setSelectedEvent={setSelectedEvent}
                                setIsEditOpen={setIsEditOpen}
                                setIsEventOpen={setIsEventOpen}
                                setSelectedRange={setSelectedRange}
                                filters={filters}
                                userRole={user.employee.role.name}
                                location={location}
                                services={services.data.data}
                                locations={locations.data.data}
                                employee={selectedEmployee}
                                employees={allEmployees}
                                handleFilter={handleFilter}
                                isMobile={isMobile}
                                matchSm={matchSm}
                                handleOpenChooseEventType={openTypeSelect}
                                setIsBlockOpened={setIsBlockOpened}
                                setSelectedEmployeeId={setSelectedEmployeeId}
                                isFetching={isFetching}
                            />
                            {/* ================ NEW EVENT OR BLOCK TIME MODAL ================ */}
                            {!isCalendaraRole &&
                                (matchSm && isEventTypeSelectOpened ? (
                                    <MobileActionConfirmation
                                        keepMounted={false}
                                        isOpened={isEventTypeSelectOpened}
                                        onClose={closeTypeSelect}
                                        matchSm={matchSm}
                                        handleOpenWizard={openWizard}
                                        handleOpenBlock={openBlock}
                                        setIsEditBlockMode={setIsEditBlockMode}
                                    />
                                ) : (
                                    <Dialog
                                        maxWidth="sm"
                                        // fullScreen={matchSm}
                                        // fullWidth
                                        onClose={closeTypeSelect}
                                        open={isEventTypeSelectOpened}
                                        sx={{ '& .MuiDialog-paper': { p: 0, maxWidth: '400px' } }}
                                    >
                                        {isEventTypeSelectOpened && (
                                            <AppointmentOrBlockDialog
                                                isOpened={isEventTypeSelectOpened}
                                                closeModal={closeTypeSelect}
                                                handleOpenWizard={openWizard}
                                                handleOpenBlock={openBlock}
                                                matchSm={matchSm}
                                                setIsEditBlockMode={setIsEditBlockMode}
                                            />
                                        )}
                                    </Dialog>
                                ))}
                            {/* ============ APPOINTMENT WIZARD DIALOG ================= */}
                            {isEditOpen && services && (
                                <AppointmentWizard
                                    isOpen={isEditOpen}
                                    onClose={handleEditClose}
                                    isRescheduled={isRescheduled}
                                    services={services.data.data}
                                    event={selectedEvent}
                                    range={selectedRange}
                                    employees={allEmployees}
                                    locations={locations.data.data}
                                    currentLocation={location}
                                    user={user}
                                    userRole={user.employee.role.name}
                                    onCancel={handleEditClose}
                                    handleDelete={deleteEventConfirm}
                                    handleCreate={handleEventCreate}
                                    handleUpdate={handleUpdateEvent}
                                    matchSm={matchSm}
                                    rangeMode={rangeMode}
                                    setRangeMode={setRangeMode}
                                    selectedEmployeeId={selectedEmployeeId}
                                />
                            )}
                            {/* =============== APPOINTMENT CARD DIALOG =============== */}
                            {!isCalendaraRole && isEventOpen && (selectedEvent || outerAppointment) && (
                                <AppointmentCard
                                    isOpen={isEventOpen}
                                    userRole={user.employee.role.name}
                                    time_zone={location.time_zone}
                                    cardEvent={setSelectedAppointment()}
                                    onCancel={handleEventClose}
                                    onChangeStatus={changeStatusConfirm}
                                    reschedule={reschedule}
                                    setSelectedEvent={setSelectedEvent}
                                    onEdit={() => setIsEditOpen(true)}
                                    services={services.data.data}
                                    matchSm={matchSm}
                                />
                            )}
                            {/* ============ BLOCK TIME DIALOG =============== */}
                            {!isCalendaraRole && isBlockOpened && appointments.data && (
                                <BlockTimeDialog
                                    isOpen={isBlockOpened}
                                    onClose={handleCloseBlock}
                                    eventId={selectedEvent?.id || undefined}
                                    closeBlockDialog={handleCloseBlock}
                                    employees={allEmployees}
                                    range={selectedRange}
                                    handleDelete={deleteEventConfirm}
                                    handleCreate={handleEventCreate}
                                    handleUpdate={handleUpdateEvent}
                                    location={location}
                                    matchSm={matchSm}
                                    isEdit={isEditBlockMode}
                                    setIsEdit={setIsEditBlockMode}
                                    selectedEmployeeId={selectedEmployeeId}
                                    setSelectedEmployeeId={setSelectedEmployeeId}
                                />
                            )}
                        </MainCard>
                    ) : (
                        <Welcome
                            locations={locations.data.data}
                            services={services.data.data}
                            employees={employeesResource?.data?.data || []}
                        />
                    )}
                </>
            )}
            {(isLoading || appointments.isLoading) && (
                <Grid item xs={12}>
                    <Stack justifyContent="center" direction="row" sx={{ mx: 'auto', mt: 1, width: 200 }}>
                        <CircularProgress />
                    </Stack>
                </Grid>
            )}
        </>
    );
};

export default Calendar;
