import MainCard from '../../ui-component/cards/MainCard';
import ReportsForm from './ReportsForm';
import { Box, CircularProgress } from '@material-ui/core';
import locationAPI from '../../services/LocationService';
import useAuth from '../../hooks/useAuth';
import employeeAPI from '../../services/EmployeeService';

export interface ReportPayload {
    date_from: string;
    date_to: string;
    locations: string;
    company_id: string;
}

const Reports = () => {
    const { user } = useAuth();
    const { data: locations, isLoading: isLoadingLocations } = locationAPI.useFetchAllLocationsQuery({});
    const { data: staff, isLoading: isLoadingStaff } = employeeAPI.useFetchAllEmployeesQuery({});

    return (
        <MainCard title={`Reports | ${user?.currentCompany.name}`}>
            {(isLoadingStaff || isLoadingLocations) && (
                <Box sx={{ mx: 'auto', mt: 1, width: 200 }}>
                    <CircularProgress />
                </Box>
            )}
            {!isLoadingStaff && !isLoadingLocations && locations && staff && user && (
                <ReportsForm locations={locations.data} staff={staff.data} company_id={user.currentCompany.id} />
            )}
        </MainCard>
    );
};

export default Reports;
