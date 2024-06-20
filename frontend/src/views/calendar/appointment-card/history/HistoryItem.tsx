import { Stack, Theme, Typography } from '@mui/material';
import { colors } from '../../../../store/constant';
import { makeStyles } from '@material-ui/styles';
import { AppointmentType, IAppointmentHistory } from '../../../../models/IAppointment';
import useAuth from '../../../../hooks/useAuth';
import moment from 'moment/moment';
import { HistoryFields } from '../AppointmentCardContent';

const useStyles = makeStyles((theme: Theme) => ({
    historyElement: {
        fontSize: '12px',
        padding: '5px 5px 0 0'
    }
}));

interface HistoryItemProps {
    data: IAppointmentHistory;
    type: AppointmentType;
    field: HistoryFields;
}

const HistoryItem = ({ data, field, type }: HistoryItemProps) => {
    const classes = useStyles();
    const { user } = useAuth();
    let action: string;

    switch (field) {
        case HistoryFields.Status:
            action = data.new_values.status as string;
            break;
        case HistoryFields.Note:
            action = data.event;
            break;
        default:
            action = type === AppointmentType.Appointment && data.event === 'created' ? 'booked' : (data.event as string);
    }

    return (
        <Stack direction="row" alignItems="center" justifyContent="end" spacing={1} className={classes.historyElement}>
            {data.event_source === 'backoffice' && (
                <>
                    <Typography sx={{ color: colors.blue.value, fontSize: 'inherit' }}>
                        {user?.id === data.user?.id ? 'You' : `${data.user?.firstname} ${data.user?.lastname}`}
                    </Typography>
                </>
            )}
            <Typography sx={{ fontSize: 'inherit' }}>{action}</Typography>
            {data.event_source === 'widget' && <Typography sx={{ color: colors.blue.value, fontSize: 'inherit' }}>via Widget</Typography>}
            <Typography sx={{ fontSize: 'inherit' }}>{moment(data.created_at).format('MM/DD/YY h:mm a (z)')}</Typography>
        </Stack>
    );
};

export default HistoryItem;
