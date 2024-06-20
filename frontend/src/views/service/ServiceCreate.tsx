// material-ui
import { Button, Grid } from '@material-ui/core';

// assets
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SNACKBAR_OPEN } from '../../store/actions';
import { useAppDispatch } from '../../hooks/redux';
import serviceAPI from 'services/ServiceService';
import { IService } from 'models/IService';
import ServiceForm from './ServiceForm';
import locationAPI from '../../services/LocationService';
import employeeAPI from '../../services/EmployeeService';
import { initServiceSchedule, min_service_reschedule_interval } from '../../store/constant';

const ServiceCreate: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [createService] = serviceAPI.useCreateServiceMutation();
    const initValue = ({
        name: '',
        service_category_id: 1,
        advance_booking_buffer: 30,
        is_reschedule_enabled: true,
        rescheduling_interval: min_service_reschedule_interval,
        fixed_price: false,
        duration: 60,
        interval: 0,
        payment_type: '',
        price: null,
        prepay: null,
        locations: [],
        employees: [],
        images: [],
        description: '',
        schedule: initServiceSchedule
    } as unknown) as IService;

    const handleCreate = (service: IService) => {
        createService(service)
            .unwrap()
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Service created',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                dispatch(locationAPI.util.invalidateTags(['Location']));
                dispatch(employeeAPI.util.invalidateTags(['Employee']));
                navigate('/service', { replace: true });
            })
            .catch((e) => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: e.data || "Error: Service hasn't created",
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    return (
        <Grid>
            <MainCard
                title="New Service"
                secondary={
                    <Button size="small" disableElevation onClick={() => navigate(-1)}>
                        <ChevronLeftOutlinedIcon />
                        Go back
                    </Button>
                }
                contentSX={{ p: { xs: 1.5, sm: 3 } }}
            >
                <ServiceForm service={initValue} update={handleCreate} />
            </MainCard>
        </Grid>
    );
};

export default ServiceCreate;
