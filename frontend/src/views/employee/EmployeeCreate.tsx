import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosServices } from 'utils/axios';

// material-ui
import MainCard from 'ui-component/cards/MainCard';
import { Button, Grid } from '@material-ui/core';
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';

// project imports
import employeeAPI from 'services/EmployeeService';
import { IEmployee, IEmployeePayload } from 'models/IEmployee';
import { colors, initSchedule } from '../../store/constant';
import EmployeeForm from './EmployeeForm';

const EmployeeCreate: React.FC = () => {
    const navigate = useNavigate();
    const { email, id, exist } = useParams();
    const [initValue, setInitValue] = useState<IEmployee | null>();
    const [createEmployee] = employeeAPI.useCreateEmployeeMutation();

    useEffect(() => {
        getInitValue();
    }, []);

    const getInitValue = async () => {
        if (Boolean(exist) && Boolean(id)) {
            try {
                const res = await axiosServices.post('/employees/invite', { email });
                const init = ({
                    user: res.data.user,
                    role: '',
                    profession_title: '',
                    locations: [],
                    services: [],
                    self_book: true,
                    background_color: colors.blue.value.replace('#', ''),
                    text_color: colors.white.value.replace('#', ''),
                    schedule: initSchedule,
                    is_shifts_enabled: false,
                    shifts: [],
                    settings: {
                        widget: {
                            use_location_schedule: true
                        }
                    }
                } as unknown) as IEmployee;
                setInitValue(init);
                return;
            } catch (error) {
                return;
            }
        }

        const init = ({
            user: {
                firstname: '',
                lastname: '',
                email,
                phone: ''
            },
            role: '',
            profession_title: '',
            locations: [],
            services: [],
            self_book: true,
            background_color: colors.blue.value.replace('#', ''),
            text_color: colors.white.value.replace('#', ''),
            schedule: initSchedule,
            is_shifts_enabled: false,
            shifts: [],
            settings: {
                widget: {
                    use_location_schedule: true
                }
            }
        } as unknown) as IEmployee;
        setInitValue(init);
    };

    const handleCreate = (employee: IEmployeePayload) => createEmployee(employee);

    return (
        <Grid>
            <MainCard
                title="New Staff"
                secondary={
                    <Button size="small" disableElevation onClick={() => navigate('/employee', { replace: true })}>
                        <ChevronLeftOutlinedIcon />
                        Go back
                    </Button>
                }
                contentSX={{ p: { xs: 1.5, sm: 3 } }}
            >
                {initValue && <EmployeeForm employee={initValue} save={handleCreate} isInvite={!!id && !!exist} />}
            </MainCard>
        </Grid>
    );
};

export default EmployeeCreate;
