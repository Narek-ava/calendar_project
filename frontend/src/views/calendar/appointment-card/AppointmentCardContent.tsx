import { useCallback, useEffect, useState } from 'react';
import moment from 'moment-timezone';
import { startCase, toLower } from 'lodash';
import { useNavigate } from 'react-router-dom';

// material ui
import { Button, Grid, Stack, Link } from '@material-ui/core';
import { Box, FormControl, Icon, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { useTheme } from '@material-ui/core/styles';
import ChevronRight from '@material-ui/icons/ChevronRight';

// project imports
import { apiTimeFormat, appCalendarFormat, cancellationReasons, getHumanizedDuration } from '../../../store/constant';
import Transitions from '../../../ui-component/extended/Transitions';
import { AppointmentStatuses, IAppointment, IAppointmentHistory } from '../../../models/IAppointment';
import { openConfirmPopup } from '../../../store/confirmPopupSlice';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import CollapsibleTitle from './CollapsibleTitle';
import CollapsibleContent from './CollapsibleContent';
import UpcomingAppointmentItem from './UpcomingAppointmentItem';
import EllipsisTypography from '../../../ui-component/optimized-text-fields/EllipsisTypography';
import AppointmentImages from './AppointmentImages';
import Contacts from './Contacts';
import Address from './Address';
import { CancellationReason } from '../types';
import History from './history/History';
import Payments from '../components/PaymentInfoDialog/Payments';
import AppointmentTotalPriceInput from './components/AppointmentTotalPriceInput';

export enum HistoryFields {
    Note = 'note',
    Customer = 'customer_id',
    DateTime = 'start_at',
    Provider = 'employee_id',
    Status = 'status'
}

interface AppointmentCardContentProps {
    event: IAppointment;
    upcomingAppointments: IAppointment[] | null;
    history: IAppointmentHistory[];
    matchSm: boolean;
    reason: CancellationReason | undefined;
    setReason: (data: CancellationReason) => void;
    isCompleting: boolean;
    isCancelling: boolean;
    onCancel: () => void;
}

enum CardElements {
    Customer = 'customer',
    Location = 'location',
    Provider = 'provider',
    Upcoming = 'upcoming',
    Attachments = 'Attachments'
}

const AppointmentCardContent = ({
    event,
    upcomingAppointments,
    history,
    isCompleting,
    isCancelling,
    matchSm,
    onCancel,
    reason,
    setReason
}: AppointmentCardContentProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const [isCustomerInfoOpened, setIsCustomerInfoOpened] = useState(false);
    const [isLocationInfoOpened, setIsLocationInfoOpened] = useState(false);
    const [isProviderInfoOpened, setIsProviderInfoOpened] = useState(false);
    const [isUpcomingOpened, setIsUpcomingOpened] = useState(false);
    const [isAttachmentsOpened, setIsAttachmentsOpened] = useState(false);
    const [eventDuration, setEventDuration] = useState<number | null>(null);

    const { isForeignAppointment } = useAppSelector((state) => state.calendar);

    useEffect(() => {
        if (event) {
            const duration = Math.ceil(moment(event.end_at, apiTimeFormat).diff(moment(event.start_at, apiTimeFormat), 'minutes', true));
            setEventDuration(duration);
        }
    }, [event]);

    useEffect(() => {
        if (isCompleting || isCancelling) {
            setIsCustomerInfoOpened(false);
            setIsLocationInfoOpened(false);
            setIsProviderInfoOpened(false);
            setIsUpcomingOpened(false);
            setIsAttachmentsOpened(false);
        }
    }, [isCompleting, isCancelling]);

    const toggleAdditionalInfo = useCallback(
        (state: CardElements) => {
            switch (state) {
                case CardElements.Customer:
                    setIsCustomerInfoOpened((prev) => !prev);
                    break;
                case CardElements.Location:
                    setIsLocationInfoOpened((prev) => !prev);
                    break;
                case CardElements.Provider:
                    setIsProviderInfoOpened((prev) => !prev);
                    break;
                case CardElements.Upcoming:
                    if (upcomingAppointments && upcomingAppointments.length > 0) {
                        setIsUpcomingOpened((prev) => !prev);
                    }
                    break;
                case CardElements.Attachments:
                    setIsAttachmentsOpened((prev) => !prev);
                    break;
                default:
                    return undefined;
            }
            return undefined;
        },
        [upcomingAppointments]
    );

    const goToEditCustomer = () => {
        onCancel();
        navigate(`/customer/${event.customer.id}`);
    };

    const editCustomerConfirmation = () => {
        dispatch(
            openConfirmPopup({
                onConfirm: goToEditCustomer,
                confirmText: `Edit`,
                text: 'You are going to edit Customer. This will close the Appointment Details card.'
            })
        );
    };

    const handleChangeReason = (e: SelectChangeEvent) => {
        setReason(e.target.value as CancellationReason);
    };

    const getCancellationReason = () => {
        if (event.cancel_reason) {
            const reasonObject = Object.values(cancellationReasons).find((elem) => elem.value === event.cancel_reason);
            return reasonObject?.title;
        }
        return '';
    };

    return (
        <Grid container spacing={2} alignItems="center">
            {/* ==================== CANCELLATION REASON ===================== */}
            {event.status === AppointmentStatuses.Canceled && (
                <Grid item xs={12}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            textTransform: 'uppercase',
                            padding: '0 16px',
                            mb: '5px'
                        }}
                    >
                        Cancellation Reason:
                    </Typography>
                    <Stack
                        sx={{
                            borderRadius: matchSm ? 'none' : '8px',
                            backgroundColor: theme.palette.background.default,
                            padding: '12px 16px 8px'
                        }}
                        spacing={2}
                    >
                        <Typography variant="h5">{getCancellationReason()}</Typography>
                    </Stack>
                    <History history={history} target_field={HistoryFields.Status} />
                </Grid>
            )}
            <Grid item xs={12}>
                {/* ================= CUSTOMER INFO =================== */}
                <CollapsibleTitle
                    matchSm={matchSm}
                    isOpened={isCustomerInfoOpened}
                    onOpen={() => toggleAdditionalInfo(CardElements.Customer)}
                >
                    <EllipsisTypography
                        text={`${startCase(toLower(event.customer.firstname))} ${startCase(toLower(event.customer.lastname))}`}
                        variant="h4"
                        ml={0}
                        sx={{ maxWidth: '100%', color: theme.palette.text.dark }}
                    />
                    <Icon>
                        <ChevronRight
                            sx={{
                                transform: isCustomerInfoOpened ? 'rotate(90deg)' : 'rotate(0)',
                                transition: 'all 0.3s'
                            }}
                        />
                    </Icon>
                </CollapsibleTitle>
                <CollapsibleContent state={isCustomerInfoOpened}>
                    <Contacts email={event.customer.email} phone={event.customer.phone} />
                    {event.customer.birth_date && (
                        <Stack direction="row" alignItems={matchSm ? 'unset' : 'center'} justifyContent="space-between">
                            <Typography variant="subtitle1">Birth Date:</Typography>
                            <Typography variant="body2" textAlign="right">
                                {moment(event.customer.birth_date, 'YYYY-MM-DD HH:mm:ss').format('MM-DD-YYYY')}
                            </Typography>
                        </Stack>
                    )}
                    {event.customer.address?.address && <Address matchSm={matchSm} address={event.customer.address?.address} />}

                    {!isForeignAppointment && (
                        <Button variant="text" onClick={editCustomerConfirmation} sx={{ alignSelf: 'flex-end' }}>
                            Edit Customer Info
                        </Button>
                    )}
                </CollapsibleContent>
            </Grid>
            {/* ============== DATE & TIME ================= */}
            <Grid item xs={12}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        borderRadius: matchSm ? 'none' : '8px',
                        backgroundColor: theme.palette.background.default,
                        padding: '12px 16px 8px'
                    }}
                >
                    <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 'medium' }}>
                        Date & Time
                    </Typography>
                    <Typography variant="h5" sx={{ fontSize: matchSm ? '14px' : '16px' }}>
                        {moment(event.start_at).tz(event.location.time_zone).calendar(null, appCalendarFormat)}
                    </Typography>
                </Stack>
                <History history={history} target_field={HistoryFields.DateTime} />
            </Grid>
            {/* ============== PROVIDER ================= */}
            <Grid item xs={12}>
                <CollapsibleTitle
                    matchSm={matchSm}
                    isOpened={isProviderInfoOpened}
                    onOpen={() => toggleAdditionalInfo(CardElements.Provider)}
                >
                    <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 'medium' }}>
                        Provider
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h5" textAlign="right">
                            {`${startCase(toLower(event.employee.user.firstname))} ${startCase(toLower(event.employee.user.lastname))}`}
                        </Typography>
                        <Icon>
                            <ChevronRight
                                sx={{
                                    transform: isProviderInfoOpened ? 'rotate(90deg)' : 'rotate(0)',
                                    transition: 'all 0.3s'
                                }}
                            />
                        </Icon>
                    </Stack>
                </CollapsibleTitle>
                <CollapsibleContent state={isProviderInfoOpened}>
                    <Contacts email={event.employee.user.email} phone={event.employee.user.phone} />
                </CollapsibleContent>
                <History history={history} target_field={HistoryFields.Provider} />
            </Grid>
            {/* ============== LOCATION ================= */}
            {!matchSm && ((!!event.employee.locations_count && event.employee.locations_count > 1) || isForeignAppointment) && (
                <Grid item xs={12}>
                    <CollapsibleTitle
                        matchSm={matchSm}
                        isOpened={isLocationInfoOpened}
                        onOpen={() => toggleAdditionalInfo(CardElements.Location)}
                    >
                        <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 'medium' }} mr={2}>
                            {`Location (${event.location.time_zone}):`}
                        </Typography>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ maxWidth: 'calc(100% - 60px)' }}>
                            <EllipsisTypography
                                variant="h5"
                                text={`${startCase(toLower(event.location.name))}`}
                                ml={0}
                                sx={{ maxWidth: '100%', textAlign: 'right' }}
                            />
                            <Icon>
                                <ChevronRight
                                    sx={{
                                        transform: isLocationInfoOpened ? 'rotate(90deg)' : 'rotate(0)',
                                        transition: 'all 0.3s'
                                    }}
                                />
                            </Icon>
                        </Stack>
                    </CollapsibleTitle>
                    <CollapsibleContent state={isLocationInfoOpened}>
                        <Contacts phone={event.location.phone} />
                        {event.location.address.address && <Address matchSm={matchSm} address={event.location.address.address} />}
                    </CollapsibleContent>
                </Grid>
            )}
            {event.service.is_virtual && (
                <Grid item xs={12}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            borderRadius: matchSm ? 'none' : '8px',
                            backgroundColor: theme.palette.background.default,
                            padding: '12px 16px 8px'
                        }}
                    >
                        <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 'medium' }}>
                            Link to video call
                        </Typography>
                        <Typography variant="h5" sx={{ fontSize: matchSm ? '14px' : '16px' }}>
                            <Link
                                style={{ textDecoration: 'none' }}
                                href={`${event.tva_url}?name=${startCase(toLower(event.employee.user.firstname))} ${startCase(
                                    toLower(event.employee.user.lastname)
                                )}`}
                                target="_blank"
                            >
                                {event.tva_url}
                            </Link>
                        </Typography>
                    </Stack>
                </Grid>
            )}
            {/* ================== SERVICES ====================  */}
            <Grid item xs={12}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        textTransform: 'uppercase',
                        padding: '0 16px',
                        mb: '5px'
                    }}
                >
                    Service
                </Typography>
                <Stack
                    sx={{
                        borderRadius: matchSm ? 'none' : '8px',
                        backgroundColor: theme.palette.background.default,
                        padding: '12px 16px 8px'
                    }}
                    spacing={1}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                        <EllipsisTypography
                            text={event.service.name}
                            ml={0}
                            sx={{ maxWidth: 'calc(100% - 50px)', fontSize: matchSm ? '14px' : '16px', fontWeight: 'medium' }}
                        />
                        <AppointmentTotalPriceInput appointment={event} />
                    </Stack>
                    {event.service.prepay && (
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2" sx={{ fontSize: matchSm ? '14px' : '16px' }}>
                                Deposit:
                            </Typography>
                            <Typography variant="h5" sx={{ fontSize: matchSm ? '14px' : '16px' }}>
                                ${event.service.prepay}
                            </Typography>
                        </Stack>
                    )}
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2" sx={{ fontSize: matchSm ? '14px' : '16px' }}>
                            Duration:
                        </Typography>
                        <Typography sx={{ fontSize: matchSm ? '14px' : '16px' }}>
                            {eventDuration && getHumanizedDuration(Number(eventDuration))}
                        </Typography>
                    </Stack>
                </Stack>
            </Grid>
            {/* ==================== NOTES ===================== */}
            <Grid item xs={12}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        textTransform: 'uppercase',
                        padding: '0 16px',
                        mb: '5px'
                    }}
                >
                    Notes
                </Typography>
                <Stack
                    sx={{
                        borderRadius: matchSm ? 'none' : '8px',
                        backgroundColor: theme.palette.background.default,
                        padding: '12px 16px 8px'
                    }}
                    spacing={2}
                >
                    <EllipsisTypography
                        text={event.note || 'No notes'}
                        ml={0}
                        sx={{
                            maxWidth: '100%',
                            fontSize: matchSm ? '14px' : '16px',
                            fontWeight: 'medium',
                            fontStyle: 'italic'
                        }}
                    />
                </Stack>
                <History history={history} target_field={HistoryFields.Note} />
            </Grid>
            {event.private_note && (
                <Grid item xs={12}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            textTransform: 'uppercase',
                            padding: '0 16px',
                            mb: '5px'
                        }}
                    >
                        Private Note
                    </Typography>
                    <Stack
                        sx={{
                            borderRadius: matchSm ? 'none' : '8px',
                            backgroundColor: theme.palette.background.default,
                            padding: '12px 16px 8px'
                        }}
                        spacing={2}
                    >
                        <EllipsisTypography
                            text={event.private_note || 'No private note'}
                            ml={0}
                            sx={{
                                maxWidth: '100%',
                                fontSize: matchSm ? '14px' : '16px',
                                fontWeight: 'medium',
                                fontStyle: 'italic'
                            }}
                        />
                    </Stack>
                </Grid>
            )}
            {/* ============== Attachments ================= */}
            {event.images.length > 0 && (
                <Grid item xs={12}>
                    <CollapsibleTitle
                        matchSm={matchSm}
                        isOpened={isAttachmentsOpened}
                        onOpen={() => toggleAdditionalInfo(CardElements.Attachments)}
                    >
                        <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 'medium' }}>
                            {`Attachments (${event.images.length})`}
                        </Typography>
                        <Stack direction="row" alignItems="center" justifyContent="flex-end">
                            <Icon>
                                <ChevronRight
                                    sx={{
                                        transform: isAttachmentsOpened ? 'rotate(90deg)' : 'rotate(0)',
                                        transition: 'all 0.3s'
                                    }}
                                />
                            </Icon>
                        </Stack>
                    </CollapsibleTitle>
                    <CollapsibleContent state={isAttachmentsOpened}>
                        <AppointmentImages matchSm={matchSm} attachments={event.images} />
                    </CollapsibleContent>
                </Grid>
            )}
            {/* ================= UPCOMING APPOINTMENTS =================== */}
            <Grid item xs={12}>
                {!isForeignAppointment && (
                    <CollapsibleTitle
                        hovered={!!upcomingAppointments}
                        matchSm={matchSm}
                        isOpened={isUpcomingOpened}
                        onOpen={() => toggleAdditionalInfo(CardElements.Upcoming)}
                    >
                        <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 'medium' }}>
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            Upcoming Customer's Appointments ({upcomingAppointments ? upcomingAppointments.length : 0})
                        </Typography>
                        {upcomingAppointments && upcomingAppointments.length > 0 && (
                            <Icon>
                                <ChevronRight
                                    sx={{
                                        transform: isUpcomingOpened ? 'rotate(90deg)' : 'rotate(0)',
                                        transition: 'all 0.3s'
                                    }}
                                />
                            </Icon>
                        )}
                    </CollapsibleTitle>
                )}
                <CollapsibleContent state={isUpcomingOpened} p={0}>
                    {upcomingAppointments ? (
                        upcomingAppointments.map((appointment) => (
                            <Stack
                                key={appointment.id}
                                sx={{
                                    '&:nth-of-type(2n)': {
                                        backgroundColor: theme.palette.grey.A100
                                    }
                                }}
                            >
                                <UpcomingAppointmentItem event={appointment} matchSm={matchSm} closeCard={onCancel} />
                            </Stack>
                        ))
                    ) : (
                        <Typography>No upcoming Appointments for this Customer</Typography>
                    )}
                </CollapsibleContent>
            </Grid>
            <Grid item xs={12}>
                <Payments appointment={event} />
            </Grid>
            {/* ================== CANCELLING APPOINTMENT | REQUEST REASON ======================== */}
            <Grid item xs={12}>
                <Transitions type="collapse" in={isCancelling}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                        sx={{
                            backgroundColor: theme.palette.background.default,
                            borderRadius: matchSm ? 'none' : '8px',
                            padding: '12px 16px 8px',
                            width: '100%'
                        }}
                    >
                        <Typography variant="h5">Select the cancellation reason:</Typography>
                        <Box sx={{ minWidth: 200 }}>
                            <FormControl fullWidth>
                                {/* @ts-ignore */}
                                <InputLabel id="cancel-reason-select" size="small">
                                    Reason
                                </InputLabel>
                                <Select
                                    size="small"
                                    id="cancel-reason-select"
                                    value={reason || ''}
                                    label="Reason"
                                    onChange={handleChangeReason}
                                >
                                    {Object.values(cancellationReasons).map((reasonOption) => (
                                        <MenuItem key={reasonOption.title} value={reasonOption.value}>
                                            {reasonOption.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Stack>
                </Transitions>
            </Grid>
        </Grid>
    );
};

export default AppointmentCardContent;
