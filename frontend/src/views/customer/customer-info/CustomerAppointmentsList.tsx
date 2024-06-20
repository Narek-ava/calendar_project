import { useMemo, useState } from 'react';
import { AppointmentStatuses, IAppointment } from '../../../models/IAppointment';
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, ToggleButton, ToggleButtonGroup, Typography } from '@material-ui/core';
import ExpandMore from '@material-ui/icons/ExpandMore';
import CustomerInfoAppointmentItem from './CustomerInfoAppointmentItem';
import { isEventDateValid } from '../../../utils/functions/time-zones-helpers';
import moment from 'moment-timezone';
import { PaymentType } from '../../../models/IService';
import { styled } from '@material-ui/core/styles';
import { CancellationReason } from '../../calendar/types';

interface CustomerAppointmentsListProps {
    appointments?: IAppointment[];
}

const StyledChip = styled(Chip)(({ theme }) => ({
    marginLeft: 'auto',
    textTransform: 'capitalize',

    '@media(max-width: 500px)': {
        margin: theme.spacing(0.5, 1, 0, 0)
    }
}));

const StyledTitle = styled(Box)(({ theme }) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.primary.main,

    '& > span': {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        fontWeight: 'bold'
    },

    '@media(max-width: 500px)': {
        display: 'block'
    }
}));

const CustomerAppointmentList = ({ appointments }: CustomerAppointmentsListProps) => {
    enum AppointmentTypes {
        Upcoming = 'Upcoming',
        Past = 'Past'
    }

    const [appointmentsType, setAppointmentsType] = useState<AppointmentTypes>(AppointmentTypes.Upcoming);

    const filteredAppointments = useMemo(
        () =>
            appointments?.filter((appointment) =>
                appointmentsType === AppointmentTypes.Upcoming
                    ? isEventDateValid(appointment, appointment.location.time_zone)
                    : !isEventDateValid(appointment, appointment.location.time_zone)
            ),
        [AppointmentTypes, appointmentsType, appointments]
    );

    const getChipColorByStatus = (status: AppointmentStatuses) => {
        switch (status) {
            case AppointmentStatuses.Canceled:
                return 'error';
            case AppointmentStatuses.Completed:
                return 'success';
            default:
                return 'primary';
        }
    };

    return (
        <>
            <Typography color="primary" variant="h4" mb={1}>
                Customer Appointments
            </Typography>
            <ToggleButtonGroup
                fullWidth
                color="primary"
                value={appointmentsType}
                exclusive
                onChange={(e, value) => {
                    if (!value) return;
                    setAppointmentsType(value);
                }}
                aria-label="Subscription Plan"
            >
                {Object.entries(AppointmentTypes).map((entry) => {
                    const [type] = entry;
                    return (
                        <ToggleButton key={type} size="small" value={type}>
                            {type}
                        </ToggleButton>
                    );
                })}
            </ToggleButtonGroup>
            {filteredAppointments?.length ? (
                filteredAppointments.map((appointment) => (
                    <Accordion key={`appointment_info_${appointment.id}`}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <StyledTitle color="primary">
                                {appointment.service.name}
                                {' - '}
                                {moment.tz(appointment.start_at, appointment.location.time_zone).format('ll')}
                                <span>{appointment.payment_type === PaymentType.Free ? 'Free' : `$${appointment.price}`}</span>
                                <StyledChip label={appointment.status} size="small" color={getChipColorByStatus(appointment.status)} />
                                {appointment.status === AppointmentStatuses.Canceled &&
                                    appointment.cancel_reason === CancellationReason.Customer_no_show && (
                                        <StyledChip size="small" label="No Show" color="warning" />
                                    )}
                            </StyledTitle>
                        </AccordionSummary>
                        <AccordionDetails>
                            <CustomerInfoAppointmentItem appointment={appointment} />
                        </AccordionDetails>
                    </Accordion>
                ))
            ) : (
                <Typography mt={1}>There are no appointments</Typography>
            )}
        </>
    );
};

export default CustomerAppointmentList;
