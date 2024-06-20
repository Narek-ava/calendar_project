import useAuth from './useAuth';

const usePlanName = () => {
    const { user } = useAuth();

    if (!user?.currentCompany) return null;

    return user.currentCompany.subscription_type === 'single_user' ? 'single user' : 'organization';
};

export default usePlanName;
