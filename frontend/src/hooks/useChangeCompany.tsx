import useAuth from './useAuth';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const useChangeCompany = () => {
    const { changeCompanyContext } = useAuth();
    const navigate = useNavigate();

    const handleChangeCompany = async (companyId: number, isNew?: boolean) => {
        await changeCompanyContext(companyId);

        if (isNew) {
            window.location.href = config.defaultPath;
        } else {
            navigate(0);
        }
    };

    return { handleChangeCompany };
};

export default useChangeCompany;
