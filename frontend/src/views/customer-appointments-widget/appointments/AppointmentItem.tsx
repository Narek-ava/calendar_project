import { useCallback, useState } from 'react';
// third-party
import { useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import { IconClock, IconId, IconLocation, IconNote } from '@tabler/icons';
import { useNavigate } from 'react-router';

// mui
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { makeStyles } from '@material-ui/styles';
import { Theme, useTheme } from '@material-ui/core/styles';
import { alpha } from '@material-ui/core';

// project-imports
import Transitions from '../../../ui-component/extended/Transitions';
import { AppointmentStatuses, IAppointment } from '../../../models/IAppointment';
import AnimateButton from '../../../ui-component/extended/AnimateButton';
import { useAppDispatch } from '../../../hooks/redux';
import EllipsisTypography from '../../../ui-component/optimized-text-fields/EllipsisTypography';
import { SnackBarTypes } from '../../../store/snackbarReducer';
import { SNACKBAR_OPEN } from '../../../store/actions';
import FormattedPhoneNumber from '../../../ui-component/FormattedPhoneNumber';
import TimeZoneView from '../../../ui-component/TimeZoneView';
import { replaceMinioToLocalhost } from '../../../utils/functions/uploading-images-helpers';
import { AppointmentsProps } from './AppointmentsWrapper';
import { axiosServices } from '../../../utils/axios';
import StyledGreenButton from '../../scheduling-widget/components/StyledGreenButton';
import CBModal from '../../../ui-component/CBModal';

interface AppointmentItemProps {
    appointment: IAppointment;
    matchSm: boolean;
    setSelectedAppointment: (data: IAppointment) => void;
    startReschedule: () => void;
    isInPast?: boolean;
    refetch: AppointmentsProps['refetch'];
}

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    cancel: {
        backgroundColor: theme.palette.error.light,
        color: theme.palette.getContrastText(theme.palette.error.light),
        '&:hover': {
            backgroundColor: theme.palette.error.main,
            color: theme.palette.getContrastText(theme.palette.error.main)
        }
    },
    serviceImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        objectPosition: 'center',
        background: theme.palette.background.default,
        outline: 'none',
        transition: '0.3s'
    },
    serviceImageText: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: alpha(theme.palette.text.primary, 0.4)
    },
    eventDateMonth: {
        color: theme.palette.getContrastText(theme.palette.grey.A700),
        fontSize: '20px',
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },
    eventDateDay: {
        color: theme.palette.getContrastText(theme.palette.grey.A700),
        fontSize: '40px',
        fontWeight: 'bold'
    },
    footerInfo: {
        fontStyle: 'italic'
    }
}));

const AppointmentItem = ({ appointment, matchSm, setSelectedAppointment, startReschedule, isInPast, refetch }: AppointmentItemProps) => {
    const navigate = useNavigate();
    const { company_slug, appointment_uuid } = useParams();
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const getServiceImage = useCallback((logo) => replaceMinioToLocalhost(logo ? logo?.url : ''), []);
    const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);

    const closeConfirmModal = useCallback(() => {
        setOpenConfirmModal(false);
    }, [setOpenConfirmModal]);

    const handleReschedule = (data: IAppointment) => {
        setSelectedAppointment(data);
        startReschedule();
    };
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

    const changeStatusConfirm = () => {
        setOpenConfirmModal(true);
    };

    const handleChangeStatus = () => {
        if (company_slug && appointment_uuid) {
            axiosServices
                .put(`/public/company/${company_slug}/appointment/${appointment.uuid}/status`, { status: AppointmentStatuses.Canceled })
                .then((res) => {
                    showSnackbar({
                        message: 'Appointment Canceled',
                        alertSeverity: SnackBarTypes.Success
                    });
                    setOpenConfirmModal(false);
                    refetch();
                })
                .catch((e: Error) => {
                    showSnackbar({
                        message: e.message,
                        alertSeverity: SnackBarTypes.Error
                    });
                    if (e.message === 'Canceling interval is over for the service of this appointment') {
                        refetch();
                    }
                    setOpenConfirmModal(false);
                });
        }
    };

    const handleGoToBookingWidget = useCallback(() => {
        if (company_slug) {
            navigate(`/cal/${company_slug}`);
        }
    }, [company_slug]);

    const handlePhoneLink = useCallback(() => {
        if (appointment.location.phone) {
            window.location.href = `tel:+1${appointment.location.phone}`;
        }
    }, [appointment]);

    return (
        <Transitions type="fade" in>
            <Stack
                direction={matchSm ? 'column' : 'row'}
                // alignItems={matchSm ? 'flex-start' : 'center'}
                sx={{ boxShadow: 4 }}
            >
                {/* ================= SERVICE IMAGE SECTION ==================== */}
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        flexShrink: 0,
                        width: matchSm ? '100%' : '250px',
                        // maxHeight: '100px',
                        height: matchSm ? '200px' : 'unset',
                        position: 'relative',
                        // margin: matchSm ? '0 auto' : 'unset',
                        backgroundColor:
                            appointment.service.images && appointment.service.images.length
                                ? 'none'
                                : alpha(theme.palette.text.primary, 0.5)
                    }}
                >
                    {/* ================== IMAGE WRAPPER =================== */}
                    {appointment.service.images && appointment.service.images.length > 0 && (
                        <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
                            <img src={getServiceImage(appointment.service.images[0])} className={classes.serviceImage} alt="service" />
                        </Box>
                    )}
                    {/* =============== DATE =============== */}
                    <Stack className={classes.serviceImageText} alignItems="center" justifyContent="center">
                        <Typography className={classes.eventDateMonth}>
                            {moment.tz(appointment.start_at, appointment.location.time_zone).format('MMM')}
                        </Typography>
                        <Typography className={classes.eventDateDay}>
                            {moment.tz(appointment.start_at, appointment.location.time_zone).format('DD')}
                        </Typography>
                    </Stack>
                </Stack>
                {/* <Divider orientation="vertical" flexItem /> */}
                {/* ================ CONTENT SECTION ================= */}
                <Stack sx={{ width: matchSm ? '100%' : 'calc(100% - 250px)' }} flexGrow={1}>
                    {appointment.status === AppointmentStatuses.Canceled && (
                        <Typography
                            textAlign="center"
                            sx={{
                                color: theme.palette.getContrastText(theme.palette.error.light),
                                p: '16px',
                                border: `1px solid ${theme.palette.error.light}`,
                                borderLeft: 'none',
                                borderRight: 'none'
                            }}
                        >
                            Appointment Canceled
                        </Typography>
                    )}
                    {appointment.status === AppointmentStatuses.Completed && (
                        <Typography
                            textAlign="center"
                            sx={{
                                color: theme.palette.getContrastText(theme.palette.error.light),
                                p: '16px',
                                border: `1px solid ${theme.palette.success.main}`,
                                borderLeft: 'none',
                                borderRight: 'none'
                            }}
                        >
                            Appointment Completed
                        </Typography>
                    )}
                    <Stack flexGrow={1} sx={{ p: 2 }} spacing={1}>
                        {/* ========== SERVICE ============ */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                            <EllipsisTypography
                                text={appointment.service.name}
                                sx={{
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    maxWidth: '100%'
                                }}
                                ml={0}
                            />
                            {appointment.price ? (
                                <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>${appointment.price}</Typography>
                            ) : (
                                <Typography sx={{ fontSize: '18px' }}>FREE</Typography>
                            )}
                        </Stack>
                        {/* ============ TIME ============ */}
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <IconClock size={20} />
                            <Stack direction="row" alignItems="center" flexWrap="wrap">
                                <Typography sx={{ fontSize: '14px' }} mr={1}>
                                    {moment
                                        .tz(appointment.start_at, appointment?.time_zone || appointment.location.time_zone)
                                        .format('hh:mm A')}{' '}
                                    {' - '}
                                    {moment
                                        .tz(appointment.end_at, appointment?.time_zone || appointment.location.time_zone)
                                        .add(1, 'second')
                                        .format('hh:mm A')}
                                </Typography>
                                <TimeZoneView time_zone={appointment?.time_zone || appointment.location.time_zone} showOffset={false} />
                            </Stack>
                        </Stack>
                        {/* ============ LOCATION ============ */}
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <IconLocation size={20} style={{ flexShrink: 0 }} />
                            <Stack sx={{ maxWidth: 'calc(100% - 40px) !important' }}>
                                <EllipsisTypography
                                    text={appointment.location.name}
                                    ml={0}
                                    sx={{ maxWidth: '100%', fontSize: '14px', fontWeight: 'bold' }}
                                />
                                <Button
                                    variant="text"
                                    onClick={handlePhoneLink}
                                    sx={{
                                        display: 'inline-flex',
                                        justifyContent: 'flex-start',
                                        pl: '0',
                                        '&:hover': {
                                            backgroundColor: 'transparent'
                                        }
                                    }}
                                >
                                    <FormattedPhoneNumber phone={appointment.location.phone} sx={{ color: theme.palette.widget.text }} />
                                </Button>
                                <EllipsisTypography
                                    text={appointment.location.address.address}
                                    ml={0}
                                    sx={{ maxWidth: '100%', fontSize: '14px' }}
                                />
                            </Stack>
                        </Stack>
                        {/* ============ PROVIDER ============ */}
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ maxWidth: 'calc(100% - 40px) !important' }}>
                            <IconId size={20} style={{ flexShrink: 0 }} />
                            <EllipsisTypography
                                text={`${appointment.employee.user.firstname} ${appointment.employee.user.lastname}`}
                                ml={0}
                                sx={{ maxWidth: '100%', fontSize: '14px' }}
                            />
                        </Stack>
                        {/* ============ NOTE ============ */}
                        {appointment.note && (
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ maxWidth: 'calc(100% - 40px) !important' }}>
                                <IconNote size={20} style={{ flexShrink: 0 }} />
                                <EllipsisTypography text={appointment.note} ml={0} sx={{ maxWidth: '100%', fontSize: '14px' }} />
                            </Stack>
                        )}
                    </Stack>
                    <Divider />
                    {appointment.is_in_rescheduling_or_canceling_interval ? (
                        <>
                            {!isInPast && appointment.status === AppointmentStatuses.Active && (
                                <Stack flexGrow={0} direction="row" alignItems="center" sx={{ p: '8px 16px' }} spacing={3}>
                                    {appointment.service.is_reschedule_enabled && (
                                        <AnimateButton>
                                            <StyledGreenButton variant="contained" onClick={() => handleReschedule(appointment)}>
                                                Reschedule
                                            </StyledGreenButton>
                                        </AnimateButton>
                                    )}
                                    <AnimateButton>
                                        <Button variant="contained" color="error" className={classes.cancel} onClick={changeStatusConfirm}>
                                            Cancel
                                        </Button>
                                    </AnimateButton>
                                </Stack>
                            )}
                        </>
                    ) : (
                        <>
                            {!isInPast && (appointment.location.phone || appointment.company?.phone || appointment.company?.email) && (
                                <Stack p={2}>
                                    <Typography className={classes.footerInfo}>
                                        For any questions or to reschedule/cancel the appointment, please contact our manager:
                                    </Typography>
                                    <Stack direction="row" alignItems="center" flexWrap="wrap">
                                        {(!!appointment.location.phone || !!appointment.company?.phone) && (
                                            <Typography className={classes.footerInfo} mr={2}>
                                                Phone: {appointment.location.phone || appointment.company?.phone}{' '}
                                            </Typography>
                                        )}
                                        {appointment.company?.email && (
                                            <Typography className={classes.footerInfo}>Email: {appointment.company?.email}</Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            )}
                        </>
                    )}
                    {appointment.status !== AppointmentStatuses.Active && (
                        <Stack direction="row" alignItems="center" justifyContent={matchSm ? 'center' : 'flex-end'} sx={{ p: '8px 16px' }}>
                            <StyledGreenButton variant="contained" sx={{ flexGrow: 0 }} onClick={handleGoToBookingWidget}>
                                Schedule Another Booking
                            </StyledGreenButton>
                        </Stack>
                    )}
                </Stack>
            </Stack>
            <CBModal
                open={openConfirmModal}
                onClose={closeConfirmModal}
                okButtonText="Confirm Change"
                onClickOk={handleChangeStatus}
                closeButtonText="Cancel"
                maxWidth="md"
                severity="warning"
            >
                Are you sure you want to cancel this appointment?
            </CBModal>
        </Transitions>
    );
};

export default AppointmentItem;
