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
import customerAPI from 'services/CustomerService';
import { ICustomer } from 'models/ICustomer';
import CustomerForm from './CustomerForm';
import appointmentAPI from '../../services/AppointmentService';
import { AbilityContext } from '../../utils/roles/Can';
import useMobileCreateButton from '../../hooks/useMobileCreateButton';

const CustomerEdit: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const ability = useContext(AbilityContext);

    useMobileCreateButton({
        action: () => navigate('/customer/create'),
        condition: ability.can('create', 'customer')
    });

    // @ts-ignore
    const { data, isFetching } = customerAPI.useGetCustomerQuery(id, {
        refetchOnMountOrArgChange: true
    });
    const [updateCustomer] = customerAPI.useUpdateCustomerMutation();
    // console.log(error);

    const handleUpdate = (customer: ICustomer) => {
        updateCustomer(customer)
            .unwrap()
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Customer updated',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                navigate('/customer', { replace: true });
                dispatch(appointmentAPI.util.invalidateTags(['Appointment']));
            })
            .catch((err) => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: `${err.data}`,
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    useEffect(() => {
        if (!isFetching && !data) {
            navigate('/customer', { replace: true });
        }
    }, [isFetching]);

    return (
        <>
            {!isFetching && data && (
                <Grid>
                    <MainCard
                        title={`${data.firstname} ${data.lastname}`}
                        secondary={
                            <Button size="small" disableElevation onClick={() => navigate(-1)}>
                                <ChevronLeftOutlinedIcon />
                                Go back
                            </Button>
                        }
                        contentSX={{ p: { xs: 1.5, sm: 3 } }}
                    >
                        {!isFetching && data && <CustomerForm customer={data} update={handleUpdate} />}
                    </MainCard>
                </Grid>
            )}
        </>
    );
};

export default CustomerEdit;
