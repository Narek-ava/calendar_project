import { useLocation } from 'react-router-dom';
import { SettingsSelectorProps } from './types';
import MainCard from '../../../ui-component/cards/MainCard';
import { Box, CircularProgress } from '@material-ui/core';
import MailboxForm from '../MailboxForm';

const SettingsSelector = ({ data, isLoading, employees }: SettingsSelectorProps) => {
    const location = useLocation();
    let form = null;
    let title = '';

    if (location.pathname.includes('edit')) {
        form = <MailboxForm mailbox={data} employees={employees} />;
        title = 'Edit';
    }

    if (location.pathname.includes('connection')) {
        form = <h1>Connection settings Form</h1>;
        title = 'Connection';
    }

    if (location.pathname.includes('permissions')) {
        form = <h1>Permissions Form</h1>;
        title = 'Permissions';
    }

    if (location.pathname.includes('create')) {
        form = <MailboxForm mailbox={data} employees={employees} />;
        title = 'Edit';
    }

    return (
        <>
            {/* {!isLoading && title === 'create' && form} */}
            {!isLoading && data && <MainCard title={title}>{form}</MainCard>}
            {isLoading && (
                <MainCard>
                    <Box sx={{ mx: 'auto', mt: 1, width: 200 }}>
                        <CircularProgress />
                    </Box>
                </MainCard>
            )}
        </>
    );
};

export default SettingsSelector;
