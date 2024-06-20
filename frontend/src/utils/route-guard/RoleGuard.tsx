import { useNavigate } from 'react-router-dom';

// project imports
// import { GuardProps } from 'types';
import { ReactElement, useContext, useEffect } from 'react';
import { AbilityContext } from '../roles/Can';
import { UserAction, UserSubject } from '../../models/IUser';

interface RoleGuardProps {
    action?: UserAction;
    subject: UserSubject;
    children: ReactElement | null;
}

// ==============================|| ROLE GUARD ||============================== //

const RoleGuard = ({ children, action = 'view', subject }: RoleGuardProps) => {
    const navigate = useNavigate();
    const ability = useContext(AbilityContext);
    // const route = subject === 'company' ? 'organization' : subject;

    useEffect(() => {
        if (!ability.can(action, subject)) {
            // navigate(`/${route}`, { replace: true });
            navigate(-1);
        }
    }, []);

    return children;
};

export default RoleGuard;
