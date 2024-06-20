import { useCallback, useEffect, useState } from 'react';

// third-party
import moment from 'moment-timezone';
import { startCase, toLower } from 'lodash';

// mui
import { Avatar } from '@material-ui/core';
import { Icon, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import LocationOnOutlined from '@material-ui/icons/LocationOnOutlined';
import PageviewOutlined from '@material-ui/icons/PageviewOutlined';
import PersonOutlined from '@material-ui/icons/PersonOutlined';

// project imports
import { IAppointment } from '../../../models/IAppointment';
import { apiTimeFormat, getHumanizedDuration, stringToColor } from '../../../store/constant';
import { openConfirmPopup } from '../../../store/confirmPopupSlice';
import { useAppDispatch } from '../../../hooks/redux';
import { axiosServices } from '../../../utils/axios';
import { setOuterAppointment } from '../../../store/slices/outerAppointmentSlice';
import EllipsisTypography from '../../../ui-component/optimized-text-fields/EllipsisTypography';

interface UpcomingAppointmentProps {
    event: IAppointment;
    matchSm: boolean;
    closeCard: () => void;
}

const UpcomingAppointmentItem = ({ event, matchSm, closeCard }: UpcomingAppointmentProps) => {
    const dispatch = useAppDispatch();
    const [eventDuration, setEventDuration] = useState<number | null>(null);

    useEffect(() => {
        if (event) {
            const duration = Math.ceil(moment(event.end_at, apiTimeFormat).diff(moment(event.start_at, apiTimeFormat), 'minutes', true));
            setEventDuration(duration);
        }
    }, [event]);

    const openAppointment = useCallback(async (id: number) => {
        try {
            const res = await axiosServices.get(`/appointments/${id}`);
            if (res.data) {
                closeCard();
                dispatch(setOuterAppointment(res.data));
            }
        } catch (err) {
            if (err.message === 'Record not found.') {
                dispatch(
                    openConfirmPopup({
                        confirmText: `Ok`,
                        text: err.message
                    })
                );
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

    const handleClickAppointment = () => {
        dispatch(
            openConfirmPopup({
                onConfirm: () => openAppointment(event.id),
                confirmText: `Open`,
                text: 'You are going to open another Appointment. This will close the current Appointment Details card.'
            })
        );
    };

    // const getLogo = useCallback((logo) => replaceMinioToLocalhost(logo ? logo?.url : ''), []);

    return (
        <Stack
            spacing={1}
            sx={{
                padding: '16px 16px 16px 16px',
                transition: 'background-color, 0.3s'
                // '&:hover': {
                //     backgroundColor: theme.palette.grey.A100
                // }
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Typography variant="h4" sx={{ fontSize: matchSm ? '14px' : '16px' }}>
                    {moment(event.start_at).format('MM-DD-YY hh:mm A')}
                </Typography>
                <Typography>{eventDuration && getHumanizedDuration(Number(eventDuration))}</Typography>
                <Typography variant="h4" sx={{ fontSize: matchSm ? '14px' : '16px' }}>
                    {event.price ? `$${event.price}` : 'FREE'}
                </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Stack sx={{ maxWidth: 'calc(100% - 50px)' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                            variant="rounded"
                            // color="#fff"
                            // src={getLogo(event.service.images[event.service.images.length - 1])}
                            // src="/img"
                            sx={{
                                color: '#fff',
                                backgroundColor: stringToColor(event.service.name),
                                width: 24,
                                height: 24,
                                mb: '2px'
                            }}
                        >
                            <Typography fontSize="large">{event.service.name.charAt(0).toUpperCase()}</Typography>
                        </Avatar>
                        <EllipsisTypography text={startCase(toLower(event.service.name))} ml={0} sx={{ maxWidth: 'calc(100% - 40px)' }} />
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Icon>
                            <LocationOnOutlined />
                        </Icon>
                        <EllipsisTypography
                            text={`${startCase(toLower(event.location.name))} (${event.location.time_zone})`}
                            ml={0}
                            sx={{ maxWidth: 'calc(100% - 40px)' }}
                        />
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Icon>
                            <PersonOutlined sx={{ color: `#${event.employee.background_color}` }} />
                        </Icon>
                        <Typography>
                            {`${startCase(toLower(event.employee.user.firstname))} ${startCase(toLower(event.employee.user.lastname))}`}
                        </Typography>
                    </Stack>
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="flex-end">
                    <Tooltip title="View Appointment" placement="top">
                        <IconButton sx={{ p: 0 }} onClick={handleClickAppointment}>
                            <PageviewOutlined />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default UpcomingAppointmentItem;
