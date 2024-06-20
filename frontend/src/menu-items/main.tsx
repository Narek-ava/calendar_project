// import {
//     // IconBuilding,
//     IconCalendar
//     // IconDashboard,
//     // IconMailbox,
//     // IconMap2
//     // IconUsers
// } from '@tabler/icons';
import { OverrideIcon } from 'types';
import AssignmentIndOutlined from '@material-ui/icons/AssignmentIndOutlined';
import EventNoteOutlined from '@material-ui/icons/EventNoteOutlined';
import LocationOnOutlined from '@material-ui/icons/LocationOnOutlined';
import PeopleAltOutlined from '@material-ui/icons/PeopleAltOutlined';
import WorkOutline from '@material-ui/icons/WorkOutline';

export interface MenuProps {
    id: string;
    title: React.ReactNode | string;
    type: string;
    children: {
        id: string;
        role_subject: string;
        title: React.ReactNode | string;
        type: string;
        url: string;
        icon: OverrideIcon;
        breadcrumbs: boolean;
    }[];
}

const main: MenuProps = {
    id: 'main',
    title: 'Main',
    type: 'group',
    children: [
        {
            id: 'calendar',
            role_subject: 'appointment',
            title: 'Calendar',
            type: 'item',
            url: '/calendar',
            // icon: IconCalendar,
            icon: EventNoteOutlined,
            breadcrumbs: false
        },
        // {
        //     id: 'dashboard',
        //     title: 'Dashboard',
        //     type: 'item',
        //     url: '/dashboard',
        //     icon: IconDashboard,
        //     breadcrumbs: false
        // },
        {
            id: 'location',
            role_subject: 'location',
            title: 'Locations',
            type: 'item',
            url: '/location',
            // icon: IconMap2,
            icon: LocationOnOutlined,
            breadcrumbs: false
        },
        {
            id: 'service',
            role_subject: 'service',
            title: 'Services',
            type: 'item',
            url: '/service',
            icon: WorkOutline,
            breadcrumbs: false
        },
        {
            id: 'employee',
            role_subject: 'employee',
            title: 'Staff',
            type: 'item',
            url: '/employee',
            icon: AssignmentIndOutlined,
            breadcrumbs: false
        },
        {
            id: 'customer',
            role_subject: 'customer',
            title: 'Customers',
            type: 'item',
            url: '/customer',
            icon: PeopleAltOutlined,
            // icon: IconUsers,
            breadcrumbs: false
        }
        // {
        //     id: 'organization',
        //     title: 'Organization',
        //     type: 'item',
        //     url: '/organization',
        //     icon: MeetingRoomOutlined,
        //     breadcrumbs: false
        // }
        // {
        //     id: 'mailbox',
        //     title: 'Mailboxes',
        //     type: 'item',
        //     url: '/mailbox',
        //     icon: IconMailbox,
        //     breadcrumbs: false
        // }
    ]
};

export default main;
