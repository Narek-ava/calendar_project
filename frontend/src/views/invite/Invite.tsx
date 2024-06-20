import React, { useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { axiosServices } from '../../utils/axios';
import { useNavigate, useParams } from 'react-router-dom';
import config from 'config';
import { useAppDispatch } from '../../hooks/redux';
import { SNACKBAR_OPEN } from '../../store/actions';
import { ICompany } from '../../models/ICompany';
import { clearUserInvitationData, setUserInvitationData } from '../../store/slices/userInviteSlice';
import { useLocation } from 'react-router';
import { IUser } from '../../models/IUser';

interface ICheckCompanyID {
    contextCompanyId: number;
    targetCompanyId: number;
    allCompanies: ICompany[];
    message?: string;
}

const Invite: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, changeCompanyContext } = useAuth();
    const { token, companyId, email } = useParams();

    const showSuccessJoinCompany = (name: string) => {
        dispatch({
            type: SNACKBAR_OPEN,
            open: true,
            message: `Congratulations, you’ve successfully joined ${name}`,
            variant: 'alert',
            alertSeverity: 'success',
            anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
    };

    // check company_id from the context_company and from invitation link
    const checkAndChangeCompany = ({ allCompanies, targetCompanyId, contextCompanyId }: ICheckCompanyID) => {
        if (targetCompanyId !== contextCompanyId) {
            const targetCompany = allCompanies.find((company) => Number(company.id) === targetCompanyId);
            if (targetCompany) {
                changeCompanyContext(targetCompanyId).then(() => {
                    showSuccessJoinCompany(targetCompany.name);
                });
            }
        }
    };

    useEffect(() => {
        if (token) {
            axiosServices.get(`/employees/invite/${token}`).then(() => {
                if (user && companyId) {
                    // update user's account and his companies list after accepting the token
                    axiosServices.get<IUser>('/account').then((updatedUser) => {
                        checkAndChangeCompany({
                            targetCompanyId: Number(companyId),
                            contextCompanyId: user.currentCompany.id,
                            allCompanies: updatedUser.data.companies
                        });
                        navigate(config.defaultPath, { replace: true });
                        dispatch(clearUserInvitationData());
                    });
                } else {
                    dispatch(setUserInvitationData({ email }));
                    // remove token from url
                    // http://localhost:8080/invite/5/admin1@staff.com/NbQR5nEsSffmVFECLzFzTFuwA5okkcGD6rvtVZ7X9bYPF7JEk5iyiF0eMiNlzEiV
                    const match = location.pathname.match(/^.+\//);
                    if (match) {
                        navigate('/login', { replace: true, state: { ...location, pathname: match[0] } });
                        return;
                    }
                    navigate('/login', { replace: true, state: location });
                }
            });
            return;
        }
        // no token case
        if (user && companyId) {
            // update user's account and his companies list after accepting the token
            axiosServices.get<IUser>('/account').then((updatedUser) => {
                checkAndChangeCompany({
                    targetCompanyId: Number(companyId),
                    contextCompanyId: user.currentCompany.id,
                    allCompanies: updatedUser.data.companies
                });
                navigate(config.defaultPath, { replace: true });
                dispatch(clearUserInvitationData());
            });
        } else {
            dispatch(setUserInvitationData({ email }));
            navigate('/login', { replace: true, state: location });
        }
    });

    return <></>;
};

export default Invite;
