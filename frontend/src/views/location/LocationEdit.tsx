import { Button, Grid } from '@material-ui/core';
import MainCard from 'ui-component/cards/MainCard';
import locationApi from '../../services/LocationService';
import { useNavigate, useParams } from 'react-router';
import React, { useContext, useEffect } from 'react';
import { ILocationPayload } from '../../models/ILocation';
import LocationForm from './LocationForm';

// assets
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';
import { AbilityContext } from '../../utils/roles/Can';
import useMobileCreateButton from '../../hooks/useMobileCreateButton';

const LocationEdit: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const ability = useContext(AbilityContext);

    useMobileCreateButton({
        action: () => navigate('/location/create'),
        condition: ability.can('create', 'location')
    });

    // @ts-ignore
    const { data, isFetching } = locationApi.useGetLocationQuery(id, {
        refetchOnMountOrArgChange: true
    });
    const [updateLocation] = locationApi.useUpdateLocationMutation();

    const handleUpdate = (location: ILocationPayload) => updateLocation(location);

    useEffect(() => {
        if (!isFetching && !data) {
            navigate('/location', { replace: true });
        }
    }, [isFetching]);

    return (
        <>
            {!isFetching && data && (
                <Grid>
                    <MainCard
                        title={data.name}
                        secondary={
                            <Button size="small" disableElevation onClick={() => navigate(-1)}>
                                <ChevronLeftOutlinedIcon />
                                Go back
                            </Button>
                        }
                        contentSX={{ p: { xs: 1.5, sm: 3 } }}
                    >
                        <LocationForm location={data} save={handleUpdate} />
                    </MainCard>
                </Grid>
            )}
        </>
    );
};

export default LocationEdit;
