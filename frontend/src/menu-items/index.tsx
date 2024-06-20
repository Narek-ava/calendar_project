import main from './main';
import settings from './settings';
import { NavItemType } from 'types';
// import useAuth from 'hooks/useAuth';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
    items: [main, settings]
};

export default menuItems;
