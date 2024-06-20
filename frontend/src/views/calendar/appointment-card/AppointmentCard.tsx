import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { IconEdit } from '@tabler/icons';
import { FormikValues } from 'formik';

// mui
import { Button, Grid, Stack } from '@material-ui/core';

// project imports
import { AppointmentStatuses, AppointmentStatusPayload, IAppointment, IAppointmentHistory } from '../../../models/IAppointment';
import { IService } from '../../../models/IService';
import AppointmentCardContent from './AppointmentCardContent';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { clearOuterAppointment } from '../../../store/slices/outerAppointmentSlice';
import { CalendarProps, CancellationReason } from '../types';
import appointmentAPI from '../../../services/AppointmentService';
import moment from 'moment-timezone';
import { skipToken } from '@reduxjs/toolkit/query/react';
import CardSkeleton from './CardSkeleton';
import { isEventDateValid } from '../../../utils/functions/time-zones-helpers';
import CBModal from '../../../ui-component/CBModal';
import { useTheme } from '@material-ui/core/styles';

export interface AppointmentCardProps {
    isOpen: boolean;
    userRole: CalendarProps['userRole'];
    time_zone: string;
    cardEvent: IAppointment | string | undefined;
    onEdit: () => void;
    reschedule: () => void;
    onCancel: () => void;
    setSelectedEvent: (arg: FormikValues | null) => void;
    onChangeStatus: (data: AppointmentStatusPayload) => void;
    services: IService[];
    matchSm: boolean;
}

export const checkTotal = (amount: number, totalAmount: number) => amount && totalAmount <= amount;

const AppointmentCard = ({
    isOpen,
    userRole,
    cardEvent,
    onCancel,
    onEdit,
    reschedule,
    services,
    onChangeStatus,
    setSelectedEvent,
    time_zone,
    matchSm
}: AppointmentCardProps) => {
    const theme = useTheme();
    const { isForeignAppointment } = useAppSelector((state) => state.calendar);
    const dispatch = useAppDispatch();
    // event from calendar -> get his id -> fetch full appointment info
    const eventId = typeof cardEvent === 'string' && !isNaN(Number(cardEvent)) ? Number(cardEvent) : undefined;
    const [isCompleting, setIsCompleting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [reason, setReason] = useState<CancellationReason | undefined>();
    const [upcomingAppointments, setUpcomingAppointments] = useState<IAppointment[] | null>(null);
    const [sortedHistory, setSortedHistory] = useState<IAppointmentHistory[] | null>(null);
    const [event, setEvent] = useState<IAppointment | null>(null);

    const { data: appointment, isLoading: isLoadingAppointment } = appointmentAPI.useGetAppointmentQuery(eventId ?? skipToken);
    const { data: history, isLoading: isLoadingHistory } = appointmentAPI.useGetAppointmentHistoryQuery(event ? event.id : skipToken);
    const { data: upcomingData, isLoading: isLoadingUpcoming } = appointmentAPI.useFetchAllAppointmentsQuery(
        event && !isForeignAppointment
            ? {
                  mode: 'all',
                  date: moment().format('YYYY-MM-DD'),
                  customer: String(event.customer.id),
                  location: String(event.location.id)
              }
            : skipToken
    );

    const modalContentRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (modalContentRef.current) modalContentRef.current.scrollTop = modalContentRef.current.scrollHeight;
    }, []);

    useEffect(() => {
        if (eventId) {
            if (!isLoadingAppointment && appointment) {
                setEvent(appointment);
                // return;
            }
        }

        // if event from redux store
        if (typeof cardEvent === 'object') {
            setEvent(cardEvent);
        }
    }, [eventId, appointment]);

    // get upcoming appointments for the current user, filter and validate by current time of calendar location
    useEffect(() => {
        if (event && upcomingData) {
            const activeAppointments = upcomingData.filter(
                (elem: IAppointment) =>
                    elem.status === AppointmentStatuses.Active && elem.id !== event.id && isEventDateValid(elem, event.location.time_zone)
            );
            if (activeAppointments.length) {
                const sorted = activeAppointments.sort((a: IAppointment, b: IAppointment) =>
                    moment(a.start_at, 'DD-MM-YYYY HH:mm:ss').diff(moment(b.start_at, 'DD-MM-YYYY HH:mm:ss'))
                );
                setUpcomingAppointments(sorted);
            }
        }
    }, [event, upcomingData]);

    // sorting history
    useEffect(() => {
        if (history) {
            if (!isLoadingHistory && history.length > 1) {
                const sorted = [...history].sort((a: IAppointmentHistory, b: IAppointmentHistory) =>
                    moment(a.created_at).diff(moment(b.created_at))
                );
                setSortedHistory(sorted);
                return;
            }
            setSortedHistory(history);
        }
    }, [history]);

    const closeEventCard = () => {
        onCancel();
        setSelectedEvent(null);
        setIsCompleting(false);
        dispatch(clearOuterAppointment());
    };

    const handleStartEdit = () => {
        onEdit();
        onCancel();
    };

    const handleComplete = () => {
        onChangeStatus({
            status: AppointmentStatuses.Completed
        });
    };

    const handleCancel = () => {
        if (!isCancelling) {
            setIsCancelling(true);
            setTimeout(scrollToBottom, 400);
            return;
        }
        onChangeStatus({
            cancel_reason: reason,
            status: AppointmentStatuses.Canceled
        });
    };

    const modalActions = useMemo(
        () => (
            <Grid container justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={matchSm ? 1 : 2}>
                    {event?.status === AppointmentStatuses.Active && (
                        <>
                            {(isCompleting || isCancelling) && (
                                <Button
                                    size={matchSm ? 'small' : 'medium'}
                                    variant="contained"
                                    onClick={() => {
                                        if (isCompleting) {
                                            setIsCompleting(false);
                                        }
                                        if (isCancelling) {
                                            setIsCancelling(false);
                                            setReason(undefined);
                                        }
                                    }}
                                >
                                    Return
                                </Button>
                            )}
                            {!isCompleting && (
                                <Button
                                    size={matchSm ? 'small' : 'medium'}
                                    key="cancel"
                                    variant="contained"
                                    onClick={handleCancel}
                                    disabled={isCancelling && !reason}
                                    color="error"
                                >
                                    {isCancelling ? 'Ok' : 'Cancel'}
                                </Button>
                            )}
                            {!isCancelling && (
                                <Button
                                    size={matchSm ? 'small' : 'medium'}
                                    key="complete"
                                    variant="contained"
                                    onClick={handleComplete}
                                    disabled={isCompleting}
                                    color="success"
                                >
                                    {matchSm ? 'Complete' : 'Mark Complete'}
                                </Button>
                            )}
                            {!isCompleting && services.length > 0 && !isForeignAppointment && (
                                <Button
                                    size={matchSm ? 'small' : 'medium'}
                                    variant="contained"
                                    startIcon={matchSm ? null : <IconEdit />}
                                    onClick={handleStartEdit}
                                    color="secondary"
                                >
                                    Edit
                                </Button>
                            )}
                        </>
                    )}
                </Stack>
            </Grid>
        ),
        [
            event,
            handleCancel,
            handleComplete,
            handleStartEdit,
            isCancelling,
            isCompleting,
            isForeignAppointment,
            matchSm,
            reason,
            services.length
        ]
    );

    const headerColor = useMemo(() => {
        if (!event) return 'transparent';

        if (event?.status === AppointmentStatuses.Active) return undefined;

        return event?.status === AppointmentStatuses.Canceled ? theme.palette.error.light : theme.palette.success.main;
    }, [event, theme]);

    return (
        <CBModal
            headerColor={headerColor}
            open={isOpen}
            onClose={closeEventCard}
            title="Appointment Details"
            specialContent={modalActions}
            maxWidth={matchSm ? false : 'sm'}
            fullWidth
            fullScreen={matchSm}
            contentRef={modalContentRef}
        >
            {event && sortedHistory && (isForeignAppointment || upcomingData) && (
                <AppointmentCardContent
                    event={event}
                    history={sortedHistory}
                    matchSm={matchSm}
                    isCompleting={isCompleting}
                    isCancelling={isCancelling}
                    onCancel={onCancel}
                    reason={reason}
                    setReason={setReason}
                    upcomingAppointments={upcomingAppointments}
                />
            )}
            {(isLoadingAppointment || isLoadingHistory || isLoadingUpcoming || !sortedHistory) && <CardSkeleton />}
        </CBModal>
    );
};

export default AppointmentCard;
