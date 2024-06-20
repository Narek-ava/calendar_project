// material-ui
import { Button, Grid } from '@material-ui/core';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate, useParams } from 'react-router';
import React, { useContext, useEffect, useState } from 'react';
// assets
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';
import employeeAPI from 'services/EmployeeService';
import { IEmployeePayload } from 'models/IEmployee';
import EmployeeForm from './EmployeeForm';
import InviteForm from './InviteForm';
import useMobileCreateButton from '../../hooks/useMobileCreateButton';
import { AbilityContext } from '../../utils/roles/Can';

const EmployeeEdit: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const ability = useContext(AbilityContext);

    // @ts-ignore
    const { data, isFetching } = employeeAPI.useGetEmployeeQuery(id, {
        refetchOnMountOrArgChange: true
    });
    const [updateEmployee] = employeeAPI.useUpdateEmployeeMutation();
    const [emailModal, setEmailModal] = useState<boolean>(false);

    const handleOpenEmailModal = () => setEmailModal(true);
    const handleCloseEmailModal = () => setEmailModal(false);

    useMobileCreateButton({
        action: handleOpenEmailModal,
        condition: ability.can('create', 'employee')
    });

    const handleUpdate = (arg: IEmployeePayload) => updateEmployee(arg);

    useEffect(() => {
        if (!isFetching && !data) {
            navigate('/employee', { replace: true });
        }
    }, [isFetching]);

    return (
        <>
            {!isFetching && data && (
                <Grid>
                    <MainCard
                        title={`${data.user?.firstname} ${data.user?.lastname}`}
                        secondary={
                            <Button size="small" disableElevation onClick={() => navigate(-1)}>
                                <ChevronLeftOutlinedIcon />
                                Go back
                            </Button>
                        }
                        contentSX={{ p: { xs: 1.5, sm: 3 } }}
                    >
                        <EmployeeForm employee={data} save={handleUpdate} isEdit />
                    </MainCard>
                </Grid>
            )}
            <InviteForm open={emailModal} onClose={handleCloseEmailModal} />
        </>
    );
};

export default EmployeeEdit;
