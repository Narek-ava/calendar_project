import { lazy } from 'react';

import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';
import ServiceList from 'views/service/ServiceList';
import ServiceEdit from 'views/service/ServiceEdit';
import ServiceCreate from 'views/service/ServiceCreate';
import EmployeeList from 'views/employee/EmployeeList';
import EmployeeEdit from 'views/employee/EmployeeEdit';
import EmployeeCreate from 'views/employee/EmployeeCreate';
import CustomerTabs from 'views/customer/CustomerTabs';
import CustomerEdit from 'views/customer/CustomerEdit';
import CustomerCreate from '../views/customer/CustomerCreate';
import RoleGuard from '../utils/route-guard/RoleGuard';
import Head from '../utils/head/index';
import { WebsocketProvider } from '../contexts/WebsocketContext';
import { UserRoleProvider } from '../contexts/UserRolesContext';
import MailboxList from '../views/mailbox/MailboxList';
import MailboxSettings from '../views/mailbox/settings/MailboxSettings';
import Inbox from '../views/mailbox/inbox/Inbox';
import TestForm from '../views/test';
import WidgetSettings from '../views/widget-settings/WidgetSettings';
import Settings from '../views/settings/Settings';
import WaiverCreate from 'views/waiver/WaiverCreate';

// const Dashboard = Loadable(lazy(() => import('../views/dashboard')));
// const CompanyList = Loadable(lazy(() => import('../views/company/CompanyList')));
const CompanyEdit = Loadable(lazy(() => import('../views/company/CompanyEdit')));
const CompanyCreate = Loadable(lazy(() => import('../views/company/CompanyCreate')));
const LocationList = Loadable(lazy(() => import('../views/location/LocationList')));
const AccountProfile = Loadable(lazy(() => import('../views/account-profile/index')));
const LocationEdit = Loadable(lazy(() => import('../views/location/LocationEdit')));
const LocationCreate = Loadable(lazy(() => import('../views/location/LocationCreate')));
const VerificationMail = Loadable(lazy(() => import('../views/authentication/VerificationMail')));
const Calendar = Loadable(lazy(() => import('../views/calendar')));
const Reports = Loadable(lazy(() => import('../views/reports/Reports')));

const MainRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <WebsocketProvider>
                <UserRoleProvider>
                    <MainLayout />
                </UserRoleProvider>
            </WebsocketProvider>
        </AuthGuard>
    ),
    children: [
        // {
        //     path: '/dashboard',
        //     element: <Dashboard />
        // },
        {
            path: '/',
            element: <Calendar />
        },
        {
            path: '/organization',
            element: (
                <>
                    <Head title="Organization |" />
                    <RoleGuard action="update" subject="company">
                        <CompanyEdit />
                    </RoleGuard>
                </>
            )
        },

        {
            path: '/widget-settings',
            element: (
                <>
                    <Head title="Booking Widget |" />
                    <RoleGuard action="update" subject="company">
                        <WidgetSettings />
                    </RoleGuard>
                </>
            )
        },
        // {
        //     path: '/organization/:id',
        //     element: (
        //         <>
        //             <Head title="Organization |" />
        //             <RoleGuard action="update" subject="company">
        //                 <CompanyEdit />
        //             </RoleGuard>
        //         </>
        //     )
        // },
        {
            path: '/organization/create',
            element: (
                <>
                    <Head title="Organization |" />
                    <RoleGuard action="create" subject="company">
                        <CompanyCreate />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/reports',
            element: (
                <>
                    <Head title="Organization Reports |" />
                    <RoleGuard action="view" subject="company">
                        <Reports />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/settings',
            element: (
                <>
                    <Head title="Organization Settings |" />
                    <RoleGuard action="update" subject="company">
                        <Settings />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/location',
            element: (
                <>
                    <Head title="Locations |" />
                    <RoleGuard action="list" subject="location">
                        <LocationList />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/location/:id',
            element: (
                <>
                    <Head title="Locations |" />
                    <RoleGuard action="update" subject="location">
                        <LocationEdit />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/location/create',
            element: (
                <>
                    <Head title="Locations |" />
                    <RoleGuard action="create" subject="location">
                        <LocationCreate />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/service',
            element: (
                <>
                    <Head title="Services |" />
                    <RoleGuard action="list" subject="service">
                        <ServiceList />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/service/:id',
            element: (
                <>
                    <Head title="Services |" />
                    <RoleGuard action="update" subject="service">
                        <ServiceEdit />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/service/create',
            element: (
                <>
                    <Head title="Services |" />
                    <RoleGuard action="create" subject="service">
                        <ServiceCreate />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/employee',
            element: (
                <>
                    <Head title="Staff |" />
                    <RoleGuard action="list" subject="employee">
                        <EmployeeList />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/employee/:id',
            element: (
                <>
                    <Head title="Staff |" />
                    <RoleGuard action="update" subject="employee">
                        <EmployeeEdit />
                    </RoleGuard>
                </>
            )
        },
        {
            // path: '/employee/create/:email/:exist/:id',
            path: '/employee/invite/:email/:exist/:id',
            element: (
                <>
                    <Head title="Staff |" />
                    <RoleGuard action="create" subject="employee">
                        <EmployeeCreate />
                    </RoleGuard>
                </>
            )
        },

        {
            path: '/employee/invite/:email/:exist',
            element: (
                <>
                    <Head title="Staff |" />
                    <RoleGuard action="create" subject="employee">
                        <EmployeeCreate />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/employee/create/:email',
            element: (
                <>
                    <Head title="Staff |" />
                    <RoleGuard action="create" subject="employee">
                        <EmployeeCreate />
                    </RoleGuard>
                </>
            )
        },
        {
            path: 'email/verify/:id',
            element: (
                <>
                    <Head title="Staff |" />
                    <VerificationMail />
                </>
            )
        },
        {
            path: '/customer',
            element: (
                <>
                    <Head title="Customers |" />
                    <RoleGuard action="list" subject="customer">
                        <CustomerTabs />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/customer/:id',
            element: (
                <>
                    <Head title="Customers |" />
                    <RoleGuard action="update" subject="customer">
                        <CustomerEdit />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/customer/create/',
            element: (
                <>
                    <Head title="Customers |" />
                    <RoleGuard action="create" subject="customer">
                        <CustomerCreate />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/waiver',
            element: (
                <>
                    <Head title="Waiver |" />
                    <RoleGuard action="update" subject="company">
                        <WaiverCreate />
                    </RoleGuard>
                </>
            )
        },
        {
            path: '/mailbox',
            element: <MailboxList />
        },
        {
            path: '/mailbox/settings/:id',
            element: <MailboxSettings />
        },
        {
            path: '/mailbox/settings/edit/:id',
            element: <MailboxSettings />
        },
        {
            path: '/mailbox/settings/connection/:id',
            element: <MailboxSettings />
        },
        {
            path: '/mailbox/settings/permissions/:id',
            element: <MailboxSettings />
        },
        {
            path: '/mailbox/create/:email/:id',
            element: <MailboxSettings />
        },
        {
            path: '/mailbox/create/:email',
            element: <MailboxSettings />
        },
        {
            path: '/mailbox/:id',
            element: <Inbox />
        },
        {
            path: '/mailbox/:id/conversations/:id/threads',
            element: <Inbox />
        },
        {
            path: '/calendar',
            element: (
                <>
                    <Head title="Calendar |" />
                    <Calendar />
                </>
            )
        },
        {
            path: '/profile',
            element: (
                <>
                    <Head title="Profile Settings |" />
                    <AccountProfile />
                </>
            )
        },
        {
            path: '/test-page',
            element: (
                <>
                    <Head title="Test Form Header" />
                    <TestForm />
                </>
            )
        }
    ]
};

export default MainRoutes;
