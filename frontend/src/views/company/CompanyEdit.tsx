// material-ui
import { Button, Grid } from '@material-ui/core';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import companyAPI from '../../services/CompanyService';
import { useNavigate } from 'react-router';
import useAuth from 'hooks/useAuth';
import CompanyForm from './CompanyForm';

// assets
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';

const CompanyEdit = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // @ts-ignore
    const { data, isFetching } = companyAPI.useGetCompanyQuery(user?.currentCompany.id, {
        refetchOnMountOrArgChange: true
    });

    return (
        <>
            {!isFetching && data && (
                <Grid>
                    <MainCard
                        title="Organization"
                        secondary={
                            <Button size="small" disableElevation onClick={() => navigate(-1)}>
                                <ChevronLeftOutlinedIcon />
                                Go back
                            </Button>
                        }
                    >
                        <CompanyForm company={data} isEdit />
                    </MainCard>
                </Grid>
            )}
        </>
    );
};

export default CompanyEdit;
