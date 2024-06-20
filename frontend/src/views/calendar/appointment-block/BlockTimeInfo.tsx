import { Button, Divider, Grid, Stack } from '@material-ui/core';
import { Icon, Typography } from '@mui/material';
import CollapsibleTitle from '../appointment-card/CollapsibleTitle';
import { startCase, toLower } from 'lodash';
import ChevronRight from '@material-ui/icons/ChevronRight';
import EmailOutlined from '@material-ui/icons/EmailOutlined';
import PersonOutlined from '@material-ui/icons/PersonOutlined';
import PhoneOutlined from '@material-ui/icons/PhoneOutlined';
import CollapsibleContent from '../appointment-card/CollapsibleContent';
import moment from 'moment-timezone';
import { apiTimeFormat } from '../../../store/constant';
import { useTheme } from '@material-ui/core/styles';
import { useCallback, useContext, useState } from 'react';
import { openConfirmPopup } from '../../../store/confirmPopupSlice';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { AbilityContext } from '../../../utils/roles/Can';
import { AppointmentType, IAppointment, IAppointmentHistory } from '../../../models/IAppointment';
import History from '../appointment-card/history/History';
import { HistoryFields } from '../appointment-card/AppointmentCardContent';

interface BlockTimeInfoProps {
    event: IAppointment;
    matchSm: boolean;
    history: IAppointmentHistory[];
}

const BlockTimeInfo = ({ event, matchSm, history }: BlockTimeInfoProps) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const ability = useContext(AbilityContext);
    const theme = useTheme();
    const [isProviderInfoOpened, setIsProviderInfoOpened] = useState(false);
    const { isForeignAppointment } = useAppSelector((state) => state.calendar);

    const toggleProviderInfo = useCallback(() => {
        setIsProviderInfoOpened((prev) => !prev);
    }, []);

    const handleEmail = useCallback((email: string) => {
        window.location.href = `mailto:${email}`;
    }, []);

    const handlePhoneLink = useCallback((link: string | undefined) => {
        if (link) {
            const phone = link.replace(/[^\d]/, '');
            window.location.href = `tel:+1${phone}`;
        }
    }, []);

    const handleGoToProfile = (id: number) => {
        navigate(`/employee/${id}`);
    };

    const confirmGoToProfile = (id: number | undefined) => {
        if (id) {
            dispatch(
                openConfirmPopup({
                    onConfirm: () => handleGoToProfile(id),
                    confirmText: `Open`,
                    text: "You are going to open Employee's Profile. This will close the Time Block card"
                })
            );
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        textTransform: 'uppercase',
                        padding: '0 16px',
                        mb: '5px'
                    }}
                >
                    Title
                </Typography>
                <Stack
                    sx={{
                        borderRadius: matchSm ? 'none' : '8px',
                        backgroundColor: theme.palette.background.default,
                        padding: '12px 16px 8px'
                    }}
                    spacing={1}
                >
                    <Typography variant="h4" sx={{ fontSize: matchSm ? '14px' : '16px', fontWeight: 'medium' }}>
                        {event.note || 'No Title'}
                    </Typography>
                </Stack>
                <History history={history} target_field={HistoryFields.Note} type={AppointmentType.Blocked_Time} />
            </Grid>
            <Grid item xs={12}>
                <CollapsibleTitle matchSm={matchSm} isOpened={isProviderInfoOpened} onOpen={() => toggleProviderInfo()}>
                    <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 'medium' }}>
                        Provider
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h5" textAlign="right" sx={{ fontSize: matchSm ? '14px' : '16px' }}>
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
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Button onClick={() => handlePhoneLink(event.employee.user.phone)} variant="outlined">
                                <PhoneOutlined />
                            </Button>
                            <Button onClick={() => handleEmail(event.employee.user.email)} variant="outlined">
                                <EmailOutlined />
                            </Button>
                        </Stack>
                        {ability.can('update', 'employee') && !isForeignAppointment && (
                            <Button startIcon={<PersonOutlined />} onClick={() => confirmGoToProfile(event.employee.id)}>
                                Profile
                            </Button>
                        )}
                    </Stack>
                </CollapsibleContent>
                <History history={history} target_field={HistoryFields.Provider} type={AppointmentType.Blocked_Time} />
            </Grid>
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
                        Date:
                    </Typography>
                    <Typography variant="h5" sx={{ fontSize: matchSm ? '14px' : '16px' }}>
                        {moment(event.start_at, apiTimeFormat).format('MM-DD-YYYY')}
                    </Typography>
                </Stack>
            </Grid>
            <Grid item xs={12}>
                <Stack
                    sx={{
                        borderRadius: matchSm ? 'none' : '8px',
                        backgroundColor: theme.palette.background.default,
                        padding: '12px 16px 8px'
                    }}
                    spacing={2}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 'medium' }}>
                            From:
                        </Typography>
                        <Typography variant="h5" sx={{ fontSize: matchSm ? '14px' : '16px' }}>
                            {moment(event.start_at).format('hh:mm A')}
                        </Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h4" sx={{ fontSize: '14px', fontWeight: 'medium' }}>
                            To:
                        </Typography>
                        <Typography variant="h5" sx={{ fontSize: matchSm ? '14px' : '16px' }}>
                            {moment(event.end_at).add(1, 'second').format('hh:mm A')}
                        </Typography>
                    </Stack>
                </Stack>
                <History history={history} target_field={HistoryFields.DateTime} type={AppointmentType.Blocked_Time} />
            </Grid>
        </Grid>
    );
};

export default BlockTimeInfo;
