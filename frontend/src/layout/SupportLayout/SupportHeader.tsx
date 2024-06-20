import LogoSection from '../MainLayout/LogoSection';
import { Box, Button } from '@material-ui/core';
import useAuth from '../../hooks/useAuth';
import { useLocation } from 'react-router';

const SupportHeader = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error(err);
        }
        location.state = null;
    };

    return (
        <Box p={2} display="flex" alignItems="center" justifyContent="space-between">
            <LogoSection />
            Hello, {user?.impersonator?.firstname ?? user?.firstname} {user?.impersonator?.lastname ?? user?.lastname}
            <Button variant="outlined" onClick={handleLogout}>
                Logout
            </Button>
        </Box>
    );
};

export default SupportHeader;
