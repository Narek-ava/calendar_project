import { SnackBarTypes } from '../store/snackbarReducer';
import { SNACKBAR_OPEN } from '../store/actions';
import { useAppDispatch } from './redux';

const useShowSnackbar = () => {
    const dispatch = useAppDispatch();

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

    return { showSnackbar };
};

export default useShowSnackbar;
