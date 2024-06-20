import { Link } from 'react-router-dom';

// material-ui
import { Box, Tab, Tabs } from '@mui/material';

// project imports
import Profile from './profile/Profile';
import SecurityForm from './SecurityForm';
// import Notifications from './Notifications';
import MainCard from 'ui-component/cards/MainCard';
import { TabsProps } from 'types';
import AccountCircleTwoTone from '@material-ui/icons/AccountCircleTwoTone';
import LockTwoTone from '@material-ui/icons/LockTwoTone';
import IntegrationInstructionsTwoToneIcon from '@material-ui/icons/IntegrationInstructionsTwoTone';
import { useTheme } from '@material-ui/core/styles';
import { useState } from 'react';
import Integrations from './Integrations';

// tabs
function TabPanel({ children, value, index, ...other }: TabsProps) {
    return (
        <div role="tabpanel" hidden={value !== index} id={`profile-tabpanel-${index}`} aria-labelledby={`profile-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `profile-tab-${index}`,
        'aria-controls': `profile-tabpanel-${index}`
    };
}

const AccountSettings = () => {
    const theme = useTheme();
    const [value, setValue] = useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <MainCard>
            <div>
                <Tabs
                    value={value}
                    indicatorColor="primary"
                    onChange={handleChange}
                    sx={{
                        mb: 3,
                        '& a': {
                            minHeight: 'auto',
                            minWidth: 10,
                            py: 1.5,
                            px: 1,
                            mr: 2.25,
                            color: theme.palette.grey[600],
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        '& a.Mui-selected': {
                            color: theme.palette.primary.main
                        },
                        '& .MuiTabs-indicator': {
                            bottom: 2
                        },
                        '& a > svg': {
                            marginBottom: '0px !important',
                            mr: 1.25
                        }
                    }}
                    aria-label="profile tabs"
                    variant="scrollable"
                >
                    <Tab component={Link} to="#" icon={<AccountCircleTwoTone />} label="Profile" {...a11yProps(0)} />
                    <Tab component={Link} to="#" label="Password" icon={<LockTwoTone />} {...a11yProps(1)} />
                    <Tab component={Link} to="#" label="Integrations" icon={<IntegrationInstructionsTwoToneIcon />} {...a11yProps(2)} />
                    {/*
                    <Tab component={Link} to="#" label="Notifications" {...a11yProps(2)} disabled />
                    */}
                </Tabs>
                <TabPanel value={value} index={0}>
                    <Profile />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <SecurityForm setValue={setValue} />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <Integrations />
                </TabPanel>
                {/*
                <TabPanel value={value} index={2}>
                    <Notifications />
                </TabPanel>
                */}
            </div>
        </MainCard>
    );
};

export default AccountSettings;
