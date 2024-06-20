// material-ui
import { Button, Grid } from '@material-ui/core';

// assets
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import CompanyForm, { initialAddress } from './CompanyForm';
import React from 'react';
import { ICompany } from '../../models/ICompany';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import moment from 'moment-timezone';

const CompanyCreate: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const initValue = ({
        name: '',
        ...(user && { owner_id: user.id }),
        category: '',
        description: '',
        email: '',
        phone: '',
        site: '',
        address: initialAddress,
        time_zone: moment.tz.guess(true),
        logo: null,
        settings: {
            notifications: {
                enabled: true
            },
            appointments: {
                autocomplete: {
                    enabled: false,
                    interval: null
                },
                completed_notify_customers: false
            }
        }
    } as unknown) as ICompany;

    return (
        <Grid>
            <MainCard
                title="Create Organization"
                secondary={
                    <Button size="small" disableElevation onClick={() => navigate(-1)}>
                        <ChevronLeftOutlinedIcon />
                        Go back
                    </Button>
                }
            >
                <CompanyForm company={initValue} />
            </MainCard>
        </Grid>
    );
};

export default CompanyCreate;
