import useAuth from '../../hooks/useAuth';
import companyAPI from '../../services/CompanyService';
import WidgetSettingsForm from './WidgetSettingsForm';

const WidgetSettings = () => {
    const { user } = useAuth();

    const { data, isFetching } = companyAPI.useGetCompanyQuery(user?.currentCompany.id.toString() || '', {
        refetchOnMountOrArgChange: true
    });

    return data && !isFetching ? <WidgetSettingsForm company={data} /> : null;
};

export default WidgetSettings;
