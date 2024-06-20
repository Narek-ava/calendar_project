import useAuth from '../../hooks/useAuth';
import companyAPI from '../../services/CompanyService';
import SettingsForm from './SettingsForm';

const Settings = () => {
    const { user } = useAuth();
    const { data, isFetching } = companyAPI.useGetCompanyQuery(user?.currentCompany.id.toString() || '', {
        refetchOnMountOrArgChange: true
    });

    return !isFetching && data ? <SettingsForm company={data} /> : null;
};

export default Settings;
