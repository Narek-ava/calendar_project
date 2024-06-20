import React from 'react';
import { Link } from 'react-router-dom';

// mui
import { Box, Tab, Tabs } from '@mui/material';
import FileDownloadTwoTone from '@material-ui/icons/FileDownloadTwoTone';
import PeopleAltOutlined from '@material-ui/icons/PeopleAltOutlined';
import { useTheme } from '@mui/material/styles';

// project imports
import { TabsProps } from '../../types';
import MainCard from '../../ui-component/cards/MainCard';
import CustomerList from './CustomerList';
import CustomerExport from './CustomerExport';
import useAuth from '../../hooks/useAuth';
import { UserRole } from '../../models/IEmployee';

// tabs
function TabPanel({ children, value, index, ...other }: TabsProps) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`customer-tabpanel-${index}`}
            aria-labelledby={`customer-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `customer-tab-${index}`,
        'aria-controls': `customer-tabpanel-${index}`
    };
}

const CustomerTabs = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const [value, setValue] = React.useState(0);

    const isAdminOrOwner = user?.employee.role.name === UserRole.Owner || user?.employee.role.name === UserRole.Admin;

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <MainCard title="Customers" content={false}>
            <div>
                <Tabs
                    value={value}
                    indicatorColor="primary"
                    onChange={handleChange}
                    sx={{
                        pl: 3,
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
                    <Tab component={Link} to="#" icon={<PeopleAltOutlined />} label="List" {...a11yProps(0)} />
                    {isAdminOrOwner && <Tab component={Link} to="#" label="Export" icon={<FileDownloadTwoTone />} {...a11yProps(1)} />}
                </Tabs>
                <TabPanel value={value} index={0}>
                    <CustomerList />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <CustomerExport />
                </TabPanel>
            </div>
        </MainCard>
    );
};

export default CustomerTabs;
