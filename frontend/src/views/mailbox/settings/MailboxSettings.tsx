import React from 'react';
import { useDispatch } from 'react-redux';

// material-ui
import { useTheme } from '@material-ui/core/styles';
import { Box, Button, CircularProgress, Grid, useMediaQuery } from '@material-ui/core';
// project imports
import SettingsDrawer from './SettingsDrawer';
import { SET_MENU } from 'store/actions';
import { gridSpacing } from 'store/constant';
import MainCard from '../../../ui-component/cards/MainCard';
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';
import { useParams } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom';
import mailboxAPI from '../../../services/MailboxService';
import SettingsContent from './SettingsContent';
import Main from '../MailboxDrawerElement';
import employeeAPI from '../../../services/EmployeeService';

const MailboxSettings = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // @ts-ignore
    const { data, isLoading } = mailboxAPI.useGetMailboxQuery(id, {
        refetchOnMountOrArgChange: true
    });
    const { data: employees } = employeeAPI.useFetchAllEmployeesQuery({});

    const theme = useTheme();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('lg'));

    const handleSwitchMailbox = (newId: number) => {
        const basePath = location.pathname.replace(/\/([0-9]+)(?=[^/]*$)/, '');
        navigate(`${basePath}/${newId}`, { replace: true });
    };

    const [openMailSidebar, setOpenMailSidebar] = React.useState(true);
    const handleDrawerOpen = () => {
        setOpenMailSidebar((prevState) => !prevState);
    };

    React.useEffect(() => {
        if (matchDownSM) {
            setOpenMailSidebar(false);
        } else {
            setOpenMailSidebar(true);
        }
    }, [matchDownSM]);

    React.useEffect(() => {
        // hide left drawer when email app opens
        dispatch({ type: SET_MENU, opened: false });
    }, [dispatch]);

    return (
        <Grid>
            {!isLoading && data && employees && (
                <MainCard
                    title="Settings"
                    secondary={
                        <Button size="small" disableElevation onClick={() => navigate('/mailbox')}>
                            <ChevronLeftOutlinedIcon />
                            To mailboxes
                        </Button>
                    }
                >
                    <Box sx={{ display: 'flex' }}>
                        <SettingsDrawer
                            mailbox={data}
                            onChange={handleSwitchMailbox}
                            openMailSidebar={openMailSidebar}
                            handleDrawerOpen={handleDrawerOpen}
                        />
                        <Main theme={theme} open={openMailSidebar}>
                            <Grid container spacing={gridSpacing}>
                                <Grid item xs={12}>
                                    {/* drill cause of the same async move in component */}
                                    <SettingsContent
                                        data={data}
                                        employees={employees.data}
                                        isLoading={isLoading}
                                        handleDrawerOpen={handleDrawerOpen}
                                    />
                                </Grid>
                            </Grid>
                        </Main>
                    </Box>
                </MainCard>
            )}
            {isLoading && (
                <Box sx={{ mx: 'auto', mt: 1, width: 200 }}>
                    <CircularProgress />
                </Box>
            )}
        </Grid>
    );
};

export default MailboxSettings;
