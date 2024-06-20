// material-ui
import { Button, Grid } from '@material-ui/core';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate, useParams } from 'react-router';
import React, { useContext, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { SNACKBAR_OPEN } from '../../store/actions';

// assets
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';
import serviceAPI from 'services/ServiceService';
import { IService } from 'models/IService';
import ServiceForm from './ServiceForm';
import appointmentAPI from '../../services/AppointmentService';
import { min_service_reschedule_interval } from '../../store/constant';
import { AbilityContext } from '../../utils/roles/Can';
import useMobileCreateButton from '../../hooks/useMobileCreateButton';

const ServiceEdit: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const ability = useContext(AbilityContext);

    useMobileCreateButton({
        action: () => navigate('/service/create'),
        condition: ability.can('create', 'service')
    });

    // @ts-ignore
    const { data, isFetching } = serviceAPI.useGetServiceQuery(id, {
        refetchOnMountOrArgChange: true
    });
    const [updateService] = serviceAPI.useUpdateServiceMutation();

    const handleUpdate = (service: IService) => {
        if (!service.rescheduling_interval) service.rescheduling_interval = min_service_reschedule_interval;

        updateService(service)
            .unwrap()
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Service updated',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                navigate('/service', { replace: true });
                dispatch(serviceAPI.util.invalidateTags(['Service']));
                dispatch(appointmentAPI.util.invalidateTags(['Appointment']));
            })
            .catch((e) => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: e.data || "Error: Service hasn't updated",
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    useEffect(() => {
        if (!isFetching && !data) {
            navigate('/service', { replace: true });
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
                        <ServiceForm service={data} update={handleUpdate} />
                    </MainCard>
                </Grid>
            )}
        </>
    );
};

export default ServiceEdit;
