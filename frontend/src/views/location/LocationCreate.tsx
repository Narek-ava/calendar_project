import { useNavigate } from 'react-router-dom';
// material-ui
import { Button, Grid } from '@material-ui/core';
import MainCard from 'ui-component/cards/MainCard';
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';

// project imports
import locationAPI from '../../services/LocationService';
import { ILocation, ILocationPayload } from '../../models/ILocation';
import LocationForm from './LocationForm';
import { calendarCellDurations, in_advance_default, initSchedule } from '../../store/constant';
import useAuth from '../../hooks/useAuth';

const LocationCreate: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [createLocation] = locationAPI.useCreateLocationMutation();
    const initValue = ({
        name: '',
        phone: '',
        address: {
            address: '',
            l1: '',
            l2: '',
            city: '',
            state: '',
            country: '',
            postal_code: ''
        },
        employees: [],
        services: [],
        time_zone: user?.currentCompany.time_zone,
        in_advance: in_advance_default,
        schedule: initSchedule,
        immediately_sms_notify: false,
        calendar_cell_duration: calendarCellDurations['60'].value
    } as unknown) as ILocation;

    const handleCreate = (location: ILocationPayload) => createLocation(location);

    return (
        <Grid>
            <MainCard
                title="New Location"
                secondary={
                    <Button size="small" disableElevation onClick={() => navigate(-1)}>
                        <ChevronLeftOutlinedIcon />
                        Go back
                    </Button>
                }
                contentSX={{ p: { xs: 1.5, sm: 3 } }}
            >
                <LocationForm location={initValue} save={handleCreate} isCreate />
            </MainCard>
        </Grid>
    );
};

export default LocationCreate;
