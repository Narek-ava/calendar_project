import { Button, Grid } from '@material-ui/core';
import MainCard from 'ui-component/cards/MainCard';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SNACKBAR_OPEN } from '../../store/actions';
import { useAppDispatch } from '../../hooks/redux';

// assets
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';
import customerAPI from 'services/CustomerService';
import { ICustomer } from 'models/ICustomer';
import CustomerForm from './CustomerForm';

const CustomerCreate: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [createCustomer] = customerAPI.useCreateCustomerMutation();
    const initValue = {
        firstname: '',
        lastname: '',
        address: {
            address: '',
            city: '',
            state: '',
            country: '',
            postal_code: ''
        },
        email: '',
        phone: '',
        birth_date: null,
        note: ''
    } as ICustomer;

    const handleCreate = (customer: ICustomer) => {
        createCustomer(customer)
            .unwrap()
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Customer created',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                navigate('/customer', { replace: true });
            })
            .catch((error) => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: `${error.data}`,
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    return (
        <Grid>
            <MainCard
                title="New Customer"
                secondary={
                    <Button size="small" disableElevation onClick={() => navigate(-1)}>
                        <ChevronLeftOutlinedIcon />
                        Go back
                    </Button>
                }
                contentSX={{ p: { xs: 1.5, sm: 3 } }}
            >
                <CustomerForm customer={initValue} update={handleCreate} />
            </MainCard>
        </Grid>
    );
};

export default CustomerCreate;
