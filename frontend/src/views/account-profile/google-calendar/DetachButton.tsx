import { useState } from 'react';
import userAPI from '../../../services/AccountService';
import useAuth from '../../../hooks/useAuth';
import useShowSnackbar from '../../../hooks/useShowSnackbar';
import { SnackBarTypes } from '../../../store/snackbarReducer';
import GoogleButton from './GoogleButton';

const DetachButton = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const { checkAuthentication } = useAuth();
    const [detachCalendar] = userAPI.useDetachGoogleCalendarMutation();
    const { showSnackbar } = useShowSnackbar();

    const detach = () => {
        setLoading(true);
        detachCalendar(null)
            .unwrap()
            .then((response) => {
                checkAuthentication().then(() => {
                    showSnackbar({
                        alertSeverity: SnackBarTypes.Success,
                        message: response?.message || 'Google Account Detached'
                    });
                    setLoading(false);
                });
            })
            .catch((err) => {
                setLoading(false);
                showSnackbar({
                    alertSeverity: SnackBarTypes.Error,
                    message: err.data || 'Error occurred, please contact administrator'
                });
            });
    };

    return (
        <GoogleButton loading={loading} disabled={loading} onClick={detach}>
            Detach from Google
        </GoogleButton>
    );
};

export default DetachButton;
