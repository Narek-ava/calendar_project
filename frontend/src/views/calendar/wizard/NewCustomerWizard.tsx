import { Grid } from '@material-ui/core';
// import MainCard from 'ui-component/cards/MainCard';
import React from 'react';
// import { useNavigate } from 'react-router-dom';
import { SNACKBAR_OPEN } from '../../../store/actions';
import { useAppDispatch } from '../../../hooks/redux';

// assets
// import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';
// import customerAPI from 'services/CustomerService';
import { ICustomer } from 'models/ICustomer';
import NewCustomerFormWizard from './NewCustomerFormWizard';
import { NewCustomerWizardProps } from './types';
import { axiosServices } from 'utils/axios';
import { setNewCustomer } from '../../../store/slices/newCustomerSlice';
import { SnackBarTypes } from '../../../store/snackbarReducer';

const NewCustomerWizard: React.FC<NewCustomerWizardProps> = ({ setIsAppointmentWizardOpened }) => {
    const dispatch = useAppDispatch();
    const initValue = {
        firstname: '',
        lastname: '',
        email: '',
        phone: ''
    } as ICustomer;

    const showSnackbar = ({ alertSeverity, message }: { alertSeverity: SnackBarTypes; message: string }) => {
        dispatch({
            type: SNACKBAR_OPEN,
            open: true,
            message,
            variant: 'alert',
            alertSeverity,
            anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
    };

    const handleCreate = async (customer: ICustomer) => {
        try {
            const res = await axiosServices.post('/customers', customer);
            if (res) {
                showSnackbar({
                    message: 'Customer created',
                    alertSeverity: SnackBarTypes.Success
                });
                dispatch(setNewCustomer(res.data));
                setIsAppointmentWizardOpened(true);
                return;
            }
        } catch (e) {
            if (e.message) {
                showSnackbar({
                    message: e.message,
                    alertSeverity: SnackBarTypes.Error
                });
            }
        }
    };

    return (
        <Grid>
            <NewCustomerFormWizard customer={initValue} update={handleCreate} />
        </Grid>
    );
};

export default NewCustomerWizard;
