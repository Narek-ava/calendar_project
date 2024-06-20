import { AbilityContext } from '../utils/roles/Can';
import useAuth from '../hooks/useAuth';
import { buildAbilityFor } from '../utils/roles/ability';

export const UserRoleProvider = ({ children }: { children: React.ReactElement | null }) => {
    const { user } = useAuth();
    return user && <AbilityContext.Provider value={buildAbilityFor(user)}>{children}</AbilityContext.Provider>;
};

export default AbilityContext;
