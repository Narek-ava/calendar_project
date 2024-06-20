import { useCallback, useEffect, useMemo, useState } from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Theme, useTheme } from '@material-ui/core/styles';
import { Typography, Grid, Button, Box } from '@material-ui/core';

// assets
import { INotification, NotificationType } from 'models/INotification';
import moment from 'moment';
import { useNavigate } from 'react-router';
import { appCalendarFormat } from '../../../../store/constant';
import notificationAPI from 'services/NotificationService';
import { axiosServices } from '../../../../utils/axios';
import { setOuterAppointment } from '../../../../store/slices/outerAppointmentSlice';
import { useAppDispatch } from '../../../../hooks/redux';
import { useLocation } from 'react-router-dom';
import { openConfirmPopup } from '../../../../store/confirmPopupSlice';
import { Stack } from '@mui/material';
import EllipsisTypography from '../../../../ui-component/optimized-text-fields/EllipsisTypography';
import TimeZoneView from '../../../../ui-component/TimeZoneView';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    listAction: {
        // top: '22px'
    },
    actionColor: {
        color: theme.palette.grey[500]
    },

    listItem: {
        padding: 0
    },
    sendIcon: {
        marginLeft: '8px',
        marginTop: '-3px'
    },
    listDivider: {
        marginTop: 0,
        marginBottom: 0
    },
    listChipError: {
        color: theme.palette.orange.dark,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.orange.light,
        height: '24px',
        padding: '0 6px',
        marginRight: '5px'
    },
    listChipWarning: {
        color: theme.palette.warning.dark,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.warning.light,
        height: '24px',
        padding: '0 6px'
    },
    listChipSuccess: {
        color: theme.palette.success.dark,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.success.light,
        height: '24px',
        padding: '0 6px'
    },
    listAvatarSuccess: {
        color: theme.palette.success.dark,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.success.light,
        border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
        borderColor: theme.palette.success.main
    },
    listAvatarPrimary: {
        color: theme.palette.primary.dark,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.primary.light,
        border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
        borderColor: theme.palette.primary.main
    },
    listContainer: {
        paddingLeft: '56px'
    },
    uploadCard: {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light
    },
    paddingBottom: {
        paddingBottom: '16px'
    },
    itemAction: {
        cursor: 'pointer',
        padding: '19px',
        '&:hover': {
            background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.primary[200]
        }
    },
    title: {
        color: theme.palette.text.dark
    },
    markAsReadBtn: {
        color: theme.palette.primary.main,

        '&:hover': {
            background: theme.palette.primary.main,
            color: '#ffffff'
        }
    }
}));

// ==============================|| NOTIFICATION LIST ITEM ||============================== //

type NotificationItemProps = {
    notification: INotification;
    setOpen: (arg: boolean) => void;
};

const NotificationItem = ({ notification, setOpen }: NotificationItemProps) => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const [readNotification] = notificationAPI.useMarkNotificationAsReadMutation();
    const classes = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const [isClicked, setIsClicked] = useState(false);

    const notificationsVariants = {
        [NotificationType.appointmentCanceled]: `The appointment with ${notification?.data?.customer?.firstname} was canceled!`,
        [NotificationType.appointmentDateUpdated]: `The appointment with ${notification?.data?.customer?.firstname} was rescheduled for you!`,
        [NotificationType.appointmentCreated]: `The new appointment with ${notification?.data?.customer?.firstname} was scheduled for you!`,
        [NotificationType.appointmentCompleted]: `The appointment with ${notification?.data?.customer?.firstname} was completed!`,
        [NotificationType.appointmentCheckedIn]: `Customer ${notification?.data?.customer?.firstname} ${notification?.data?.customer?.lastname} arrived for his appointment at ${notification?.data?.location?.name}`
    };

    // const notification_time_zone = useMemo(() => notification.data.location.time_zone || notification.data.location.time_zone_name, [
    //     notification
    // ]);

    const handleClickAppointment = useCallback(async (id: number) => {
        try {
            const res = await axiosServices.get(`/appointments/${id}`);
            if (res.data) {
                dispatch(setOuterAppointment(res.data));
                if (location.pathname !== '/calendar') {
                    navigate('/calendar', { replace: true });
                }
            }
            setOpen(false);
            readNotification(notification.id);
        } catch (err) {
            if (err.message === 'Record not found.') {
                dispatch(
                    openConfirmPopup({
                        confirmText: `Ok`,
                        text: 'This appointment was deleted and can`t be opened'
                    })
                );
                readNotification(notification.id);
            } else {
                dispatch(
                    openConfirmPopup({
                        confirmText: `Ok`,
                        text: 'An error occurred. Please try again later'
                    })
                );
            }
        }
    }, []);

    const notification_time_zone = useMemo(() => notification.data.location.time_zone || notification.data.location.time_zone_name, [
        notification
    ]);

    useEffect(() => {
        if (isClicked) {
            handleClickAppointment(notification.data.id);
        }
    }, [isClicked]);

    return (
        <Box className={classes.itemAction} sx={{ background: notification.read_at ? 'ffff' : theme.palette.primary.light }}>
            {/* <div className={classes.itemAction}> */}
            <Grid item xs={12} className={classes.paddingBottom}>
                <Typography variant="subtitle2">{notificationsVariants[notification?.type as never]}</Typography>
                <Typography variant="subtitle1">More details:</Typography>
                {!notification?.data?.service?.is_virtual && (
                    <Stack direction="row" alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle2" mr={1} className={classes.title}>
                            Location:
                        </Typography>
                        <EllipsisTypography
                            variant="subtitle2"
                            text={notification?.data?.location?.address?.address}
                            ml={0}
                            sx={{ maxWidth: '100%' }}
                        />
                    </Stack>
                )}
                <Stack direction="row" alignItems="center" flexWrap="wrap">
                    <Typography variant="subtitle2" mr={1} className={classes.title}>
                        Service:
                    </Typography>
                    <EllipsisTypography variant="subtitle2" text={notification?.data?.service?.name} ml={0} sx={{ maxWidth: '100%' }} />
                </Stack>
                <Stack direction="row" alignItems="center" flexWrap="wrap">
                    <Typography variant="subtitle2" mr={1} className={classes.title}>
                        Date & Time:
                    </Typography>
                    <Stack direction="row" flexWrap="wrap">
                        <Typography variant="subtitle2" mr={1}>
                            {notification_time_zone
                                ? moment(notification?.data?.start_at).tz(notification_time_zone).calendar(null, appCalendarFormat)
                                : moment(notification?.data?.start_at).calendar(null, appCalendarFormat)}
                        </Typography>
                        {notification_time_zone && (
                            <TimeZoneView time_zone={notification_time_zone} sx={{ fontSize: '12px' }} variant="subtitle2" />
                        )}
                    </Stack>
                </Stack>
                <Stack direction="row" alignItems="center" flexWrap="wrap">
                    <Typography variant="subtitle2" mr={1} className={classes.title}>
                        With:
                    </Typography>
                    <EllipsisTypography
                        variant="subtitle2"
                        text={`${notification?.data?.customer?.firstname} ${notification?.data?.customer?.lastname}`}
                        ml={0}
                        sx={{ maxWidth: '100%' }}
                    />
                </Stack>
            </Grid>
            <Grid item xs={12}>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Button variant="contained" size="small" disableElevation onClick={() => setIsClicked(true)}>
                        View Appointment
                    </Button>
                    {!notification.read_at && (
                        <Button
                            className={classes.markAsReadBtn}
                            size="small"
                            disableElevation
                            onClick={() => readNotification(notification.id)}
                        >
                            Mark as read
                        </Button>
                    )}
                </Grid>
            </Grid>
            {/* </div> */}
        </Box>
    );
};

export default NotificationItem;
