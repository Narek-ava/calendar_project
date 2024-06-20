import FeedOutlined from '@material-ui/icons/FeedOutlined';
import MeetingRoomOutlined from '@material-ui/icons/MeetingRoomOutlined';
import FactCheck from '@material-ui/icons/FactCheck';
import Settings from '@material-ui/icons/Settings';
import Receipt from '@material-ui/icons/Receipt';
import { MenuProps } from './main';

const settings: MenuProps = {
    id: 'settings',
    title: 'Settings',
    type: 'group',
    children: [
        {
            id: 'organization',
            role_subject: 'company',
            title: 'Organization',
            type: 'item',
            url: '/organization',
            icon: MeetingRoomOutlined,
            breadcrumbs: false
        },
        {
            id: 'reports',
            role_subject: 'company',
            title: 'Reports',
            type: 'item',
            url: '/reports',
            icon: FeedOutlined,
            breadcrumbs: false
        },
        {
            id: 'settings',
            role_subject: 'company',
            title: 'Settings',
            type: 'item',
            url: '/settings',
            icon: Settings,
            breadcrumbs: false
        },
        {
            id: 'widget-settings',
            role_subject: 'company',
            title: 'Booking Widget',
            type: 'item',
            url: '/widget-settings',
            icon: FactCheck,
            breadcrumbs: false
        },
        {
            id: 'waiver',
            role_subject: 'company',
            title: 'Waiver',
            type: 'item',
            url: '/waiver',
            icon: Receipt,
            breadcrumbs: false
        }
    ]
};

export default settings;
