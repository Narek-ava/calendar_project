// material-ui
import { Button, Grid } from '@mui/material';

// project imports
import useAuth from 'hooks/useAuth';
import SubCard from 'ui-component/cards/SubCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { gridSpacing } from 'store/constant';

// assets
import { SNACKBAR_OPEN } from '../../../store/actions';
import { IUser } from '../../../models/IUser';
import useBoolean from '../../../hooks/useBoolean';
import { useAppDispatch } from '../../../hooks/redux';
import ProfileCard from './ProfileCard';
import ProfileForm from './ProfileForm';
import { axiosServices } from '../../../utils/axios';
import { SnackBarTypes } from '../../../store/snackbarReducer';
import ProfileAvatar from './avatar/ProfileAvatar';
import appointmentAPI from '../../../services/AppointmentService';

// ==============================|| PROFILE ||============================== //

const Profile = () => {
    const dispatch = useAppDispatch();
    const { user, checkAuthentication } = useAuth();
    // const [updateUser] = userAPI.useUpdateUserMutation();
    const { value: isInEditUserMode, off: stopEditUser, toggle } = useBoolean();
    const { value: isSubmitting, off: stopSubmitting, on: startSubmitting } = useBoolean();

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

    const handleUpdateUser = async (arg: IUser) => {
        if (!isSubmitting) {
            startSubmitting();
        }
        try {
            const res = await axiosServices.post('/account', { ...arg });
            if (res) {
                showSnackbar({
                    message: 'User Profile updated',
                    alertSeverity: SnackBarTypes.Success
                });
                checkAuthentication().then(() => {
                    stopSubmitting();
                    if (isInEditUserMode) {
                        stopEditUser();
                    }
                    dispatch(appointmentAPI.util.invalidateTags(['Appointment']));
                });
            }
        } catch (e) {
            if (e.message === 'The phone field contains an invalid number.') {
                showSnackbar({
                    message: 'Invalid phone number',
                    alertSeverity: SnackBarTypes.Error
                });
            } else {
                showSnackbar({
                    message: "Profile hasn't updated",
                    alertSeverity: SnackBarTypes.Error
                });
            }
            stopSubmitting();
        }
    };

    return (
        <>
            {user && (
                <Grid container spacing={gridSpacing}>
                    <Grid item sm={6} md={4} xs={12}>
                        <ProfileAvatar
                            user={user}
                            onUpdate={handleUpdateUser}
                            isSubmitting={isSubmitting}
                            startSubmitting={startSubmitting}
                            isInEditUserMode={isInEditUserMode}
                        />
                    </Grid>
                    <Grid item sm={6} md={8}>
                        <SubCard
                            title={isInEditUserMode ? 'Edit Profile Details' : 'Profile Details'}
                            titleSX={{ minHeight: '66px' }}
                            contentSX={{ minHeight: '205px' }}
                            secondary={
                                <AnimateButton>
                                    <Button variant="contained" size="small" onClick={() => toggle(!isInEditUserMode)}>
                                        {isInEditUserMode ? 'Return' : 'Edit'}
                                    </Button>
                                </AnimateButton>
                            }
                        >
                            {isInEditUserMode ? (
                                <ProfileForm user={user} onUpdate={handleUpdateUser} isSubmitting={isSubmitting} />
                            ) : (
                                <ProfileCard user={user} />
                            )}
                        </SubCard>
                    </Grid>
                </Grid>
            )}
        </>
    );
};

export default Profile;
