import { Fragment, useState } from 'react';
import { Icon, Stack, Typography } from '@mui/material';
import Transitions from '../../../../ui-component/extended/Transitions';
import ChevronRight from '@material-ui/icons/ChevronRight';
import HistoryItem from './HistoryItem';
import { useTheme } from '@mui/material/styles';
import { AppointmentType, IAppointmentHistory } from '../../../../models/IAppointment';
import { HistoryFields } from '../AppointmentCardContent';

interface UpdateHistoryProps {
    history: IAppointmentHistory[];
    target_field: HistoryFields;
    type?: AppointmentType;
}

const History = ({ history, target_field, type = AppointmentType.Appointment }: UpdateHistoryProps) => {
    const theme = useTheme();
    const [isOpened, setIsOpened] = useState(false);

    const toggleUpdate = () => {
        setIsOpened((prev) => !prev);
    };

    const targetHistory = history.filter((elem) => {
        if (elem.event === 'created' && target_field === HistoryFields.Status) {
            return undefined;
        }
        return target_field in elem.new_values;
    });

    return (
        <>
            {targetHistory.length > 1 ? (
                <Stack>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="end"
                        spacing={1}
                        onClick={toggleUpdate}
                        sx={{
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'inline-block',
                            ml: 'auto',
                            pr: 1,
                            transition: 'color 0.3s',
                            '&:hover': {
                                color: theme.palette.primary.main
                            }
                        }}
                    >
                        <Icon sx={{ position: 'absolute', top: 1, left: '-14px' }}>
                            <ChevronRight
                                sx={{
                                    transform: isOpened ? 'rotate(90deg)' : 'rotate(0)',
                                    transition: 'all 0.3s',
                                    fontSize: '16px'
                                }}
                            />
                        </Icon>
                        <Typography sx={{ fontSize: '12px', display: 'inline-block' }}>{targetHistory.length} more updates:</Typography>
                    </Stack>
                    <Transitions type="collapse" in={isOpened}>
                        {targetHistory.map((historyElem, index) => (
                            <Fragment key={historyElem.created_at}>
                                <HistoryItem data={historyElem} field={target_field} type={type} />
                            </Fragment>
                        ))}
                    </Transitions>
                </Stack>
            ) : (
                <>{targetHistory.length === 1 && <HistoryItem data={targetHistory[0]} field={target_field} type={type} />} </>
            )}
        </>
    );
};

export default History;
