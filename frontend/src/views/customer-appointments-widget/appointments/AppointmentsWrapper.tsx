import { Divider, Grid, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Stack } from '@material-ui/core';
import { Fragment, useCallback, useState } from 'react';
import AppointmentItem from './AppointmentItem';
import { AppointmentStatuses, IAppointment } from '../../../models/IAppointment';
import useBoolean from '../../../hooks/useBoolean';
import RescheduleAppointment from './RescheduleAppointment';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import moment from 'moment-timezone';
import { isEventDateValid } from '../../../utils/functions/time-zones-helpers';
import { styled } from '@material-ui/core/styles';

export interface AppointmentsProps {
    appointments: IAppointment[];
    targetAppointment: IAppointment;
    matchSm: boolean;
    refetch: any;
}

export enum AppointmentDateType {
    Upcoming = 'upcoming',
    Past = 'past'
}

const StyledGrid = styled(Grid)(({ theme }) => ({
    color: theme.palette.widget.text
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
    wordBreak: 'keep-all',

    '&.Mui-selected': {
        color: theme.palette.widget.green,
        backgroundColor: theme.palette.grey[100]
    }
}));

const AppointmentsWrapper = ({ matchSm, appointments, targetAppointment, refetch }: AppointmentsProps) => {
    const [type, setType] = useState(AppointmentDateType.Upcoming);
    const { value: isInRescheduleMode, off: stopReschedule, on: startReschedule } = useBoolean();
    const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null);

    const handleChange = (event: React.MouseEvent<HTMLElement>, newType: AppointmentDateType) => {
        if (newType !== null) {
            setType(newType);
        }
    };

    const appointmentsToShow = useCallback(() => {
        let sorted: IAppointment[] = [];
        const customerAppointments = appointments.filter((appointment) => {
            if (type === AppointmentDateType.Upcoming) {
                return (
                    appointment.status === AppointmentStatuses.Active &&
                    appointment.uuid !== targetAppointment.uuid &&
                    isEventDateValid(appointment, appointment.location.time_zone)
                );
            }
            return appointment.uuid !== targetAppointment.uuid && !isEventDateValid(appointment, appointment.location.time_zone);
        });
        if (customerAppointments.length) {
            sorted = customerAppointments.sort((a: IAppointment, b: IAppointment) =>
                moment(moment(a.start_at, 'DD-MM-YYYY HH:mm:ss')).diff(moment(b.start_at, 'DD-MM-YYYY HH:mm:ss'))
            );
        }
        return sorted;
    }, [appointments, type]);

    return (
        <StyledGrid container spacing={3}>
            {isInRescheduleMode && selectedAppointment ? (
                <Grid item xs={12}>
                    <RescheduleAppointment
                        refetch={refetch}
                        matchSm={matchSm}
                        appointment={selectedAppointment}
                        stopReschedule={stopReschedule}
                    />
                </Grid>
            ) : (
                <>
                    <Grid item xs={12}>
                        <AppointmentItem
                            refetch={refetch}
                            appointment={targetAppointment}
                            matchSm={matchSm}
                            setSelectedAppointment={setSelectedAppointment}
                            startReschedule={startReschedule}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={12} sx={{ flexDirection: matchSm ? 'column' : 'row', pr: 1 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }} spacing={2}>
                            <Typography sx={{ fontSize: '20px', mx: 1 }}>Your Other Bookings:</Typography>
                            <ToggleButtonGroup color="primary" value={type} exclusive onChange={handleChange}>
                                <StyledToggleButton value={AppointmentDateType.Upcoming}>
                                    {AppointmentDateType.Upcoming.toUpperCase()}
                                </StyledToggleButton>
                                <StyledToggleButton value={AppointmentDateType.Past}>
                                    {AppointmentDateType.Past.toUpperCase()}
                                </StyledToggleButton>
                            </ToggleButtonGroup>
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        <Stack spacing={2}>
                            {appointmentsToShow().length > 0 ? (
                                appointmentsToShow().map((appointment) => (
                                    <Fragment key={appointment.uuid}>
                                        <AppointmentItem
                                            refetch={refetch}
                                            isInPast={type === AppointmentDateType.Past}
                                            appointment={appointment}
                                            matchSm={matchSm}
                                            setSelectedAppointment={setSelectedAppointment}
                                            startReschedule={startReschedule}
                                        />
                                    </Fragment>
                                ))
                            ) : (
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 1 }}>
                                    <InfoOutlined />
                                    <Typography>No Appointments to show</Typography>
                                </Stack>
                            )}
                        </Stack>
                    </Grid>
                </>
            )}
        </StyledGrid>
    );
};

export default AppointmentsWrapper;
