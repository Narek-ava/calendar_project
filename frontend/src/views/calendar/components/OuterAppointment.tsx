import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import appointmentAPI from '../../../services/AppointmentService';
import { setOuterAppointment } from '../../../store/slices/outerAppointmentSlice';
import { openConfirmPopup } from '../../../store/confirmPopupSlice';
import { useAppDispatch } from '../../../hooks/redux';
import { useLocation } from 'react-router';
import useAuth from 'hooks/useAuth';
import { skipToken } from '@reduxjs/toolkit/query';
import { setUserInvitationData } from '../../../store/slices/userInviteSlice';

const MailboxAppointment = () => {
    const { user, changeCompanyContext } = useAuth();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { companyId, eventId, email } = useParams();
    const { data, isSuccess, refetch, isError } = appointmentAPI.useGetAppointmentQuery(
        user?.currentCompany.id !== companyId ? skipToken : Number(eventId)
    );

    useEffect(() => {
        // if logged in
        if (!user) {
            // if not logged in:
            if (email) {
                dispatch(setUserInvitationData({ email }));
            }
            navigate('/login', { replace: true, state: location });
        }
        if (user?.currentCompany.id !== companyId) {
            autoChangeCompany(Number(companyId));
        }
    }, []);

    useEffect(() => {
        if (isSuccess) {
            dispatch(setOuterAppointment(data));
            navigate('/calendar');
        }
        if (isError) {
            navigate('/calendar');
            dispatch(
                openConfirmPopup({
                    confirmText: `Okay`,
                    text: 'This appointment was removed and can`t be opened'
                })
            );
        }
    }, [isSuccess, isError]);

    const autoChangeCompany = async (id: number | undefined) => {
        if (id !== undefined) {
            await changeCompanyContext(id);
            refetch();
        }
    };

    return <></>;
};

export default MailboxAppointment;
