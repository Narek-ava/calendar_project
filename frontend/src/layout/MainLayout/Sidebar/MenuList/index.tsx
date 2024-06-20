// material-ui
import { Typography } from '@material-ui/core';

// project imports
import useAuth from 'hooks/useAuth';
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import { UserRole } from '../../../../models/IEmployee';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
    const { user } = useAuth();
    let filteredItem = [];
    if (user?.employee.role.name !== UserRole.Owner && user?.employee.role.name !== UserRole.Admin) {
        filteredItem = menuItem.items.filter((objOfItem) => objOfItem.title === 'Main');
    } else {
        filteredItem = menuItem.items.map((objOfItem) => objOfItem);
    }
    const navItems = filteredItem.map((item) => {
        switch (item.type) {
            case 'group':
                return <NavGroup key={item.id} item={item} />;
            default:
                return (
                    <Typography key={item.id} variant="h6" color="error" align="center">
                        Menu Items Error
                    </Typography>
                );
        }
    });
    return <>{navItems}</>;
};

export default MenuList;
