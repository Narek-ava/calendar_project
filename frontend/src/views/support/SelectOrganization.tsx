import { useEffect } from 'react';
import MainCard from '../../ui-component/cards/MainCard';
import { Button, Grid, MenuItem, Select, Typography, FormControl, InputLabel, Alert } from '@mui/material';
import { axiosServices } from '../../utils/axios';
import useAuth from '../../hooks/useAuth';
import companyAPI from '../../services/CompanyService';
import { useNavigate } from 'react-router';

const SelectOrganization = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.is_impersonated && !user?.select_company_required) navigate('/');
    }, [navigate, user]);

    const { data, isLoading } = companyAPI.useFetchAllCompaniesQuery({
        per_page: -1,
        page: 1
    });

    const handleSelect = (companyId: number) => {
        axiosServices
            .post('/account/impersonate', {
                company_id: companyId
            })
            .then(() => {
                window.location.reload();
            });
    };

    const handleLeave = () => {
        axiosServices.get('/account/impersonate-leave').then(() => {
            window.location.reload();
        });
    };

    return (
        <MainCard title="Select Organization to impersonate the organization's owner">
            <Grid container spacing={2} alignItems="center">
                {user?.is_impersonated && (
                    <Grid item xs={12} sm={12} md={12}>
                        <Alert severity="info">
                            You&apos;re impersonated as{' '}
                            <b>
                                {user?.firstname} {user?.lastname}
                            </b>
                            &nbsp;with <b>{user?.currentCompany.name}</b> as current organization
                        </Alert>
                    </Grid>
                )}
                <Grid item xs={12} sm={4} md={3}>
                    <FormControl fullWidth>
                        <InputLabel id="organizaton-select-label">Select Organization</InputLabel>
                        <Select
                            labelId="organizaton-select-label"
                            label="Select Organization"
                            onChange={(e) => handleSelect(Number(e.target.value))}
                            defaultValue=""
                        >
                            {!isLoading && data?.data ? (
                                data.data.map((organization) => (
                                    <MenuItem key={organization.id} value={organization.id}>
                                        {organization.name}, owner {organization.owner?.firstname} {organization.owner?.lastname}
                                    </MenuItem>
                                ))
                            ) : (
                                <Typography pl={2}>No options found</Typography>
                            )}
                        </Select>
                    </FormControl>
                </Grid>

                {!user?.select_company_required && user?.currentCompany && (
                    <>
                        <Grid item xs={12} sm={4} md={2}>
                            <Button onClick={handleLeave} variant="outlined" color="error" size="large" fullWidth>
                                Leave impersonation
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={4} md={2}>
                            <Button variant="outlined" size="large" fullWidth href="/calendar">
                                Return to calendar
                            </Button>
                        </Grid>
                    </>
                )}
            </Grid>
        </MainCard>
    );
};

export default SelectOrganization;
