import MinimalLayout from '../layout/MinimalLayout';
import Loadable from '../ui-component/Loadable';
import { lazy } from 'react';
import GuestGuard from '../utils/route-guard/GuestGuard';
import NavMotion from '../layout/NavMotion';
import Head from '../utils/head';
import ThankYouPage from '../views/authentication/ThankYouPage';
import Register from 'views/authentication/Register';

const ForgotPassword = Loadable(lazy(() => import('../views/authentication/ForgotPassword')));
const ResetPassword = Loadable(lazy(() => import('../views/authentication/ResetPassword')));
const Login = Loadable(lazy(() => import('../views/authentication/Login')));
const CheckMail = Loadable(lazy(() => import('../views/authentication/CheckMail')));
const Invite = Loadable(lazy(() => import('../views/invite/Invite')));
const OuterAppointment = Loadable(lazy(() => import('views/calendar/components/OuterAppointment')));

const AuthenticationRoutes = [
    {
        path: 'login',
        element: (
            <>
                <Head title="Log In |" />
                <MinimalLayout />
            </>
        ),
        children: [
            {
                path: '/login/',
                element: (
                    <NavMotion>
                        <GuestGuard>
                            <Login />
                        </GuestGuard>
                    </NavMotion>
                )
            }
        ]
    },
    {
        path: 'register',
        element: (
            <>
                <Head title="Register |" />
                <MinimalLayout />
            </>
        ),
        children: [
            {
                path: '/register',
                element: (
                    <NavMotion>
                        <GuestGuard>
                            <Register />
                        </GuestGuard>
                    </NavMotion>
                )
            }
        ]
    },
    {
        path: 'register-trial',
        element: (
            <>
                <Head title="Trial Registration |" metaTags={[{ name: 'robots', value: 'noindex' }]} />
                <MinimalLayout />
            </>
        ),
        children: [
            {
                path: '/register-trial',
                element: (
                    <NavMotion>
                        <GuestGuard>
                            <Register isTrial />
                        </GuestGuard>
                    </NavMotion>
                )
            }
        ]
    },
    {
        path: 'subscribe-success',
        element: (
            <>
                <Head title="Thanks for your order |" />
                <MinimalLayout />
            </>
        ),
        children: [
            {
                path: '/subscribe-success',
                element: (
                    <NavMotion>
                        <GuestGuard>
                            <ThankYouPage />
                        </GuestGuard>
                    </NavMotion>
                )
            }
        ]
    },
    {
        path: 'forgot-password',
        element: (
            <>
                <Head title="Can't log in? |" />
                <MinimalLayout />
            </>
        ),
        children: [
            {
                path: '/forgot-password',
                element: (
                    <NavMotion>
                        <GuestGuard>
                            <ForgotPassword />
                        </GuestGuard>
                    </NavMotion>
                )
            }
        ]
    },
    {
        path: 'reset-password',
        element: <MinimalLayout />,
        children: [
            {
                path: '/reset-password',
                element: (
                    <NavMotion>
                        <GuestGuard>
                            <ResetPassword />
                        </GuestGuard>
                    </NavMotion>
                )
            }
        ]
    },
    {
        path: 'check-mail',
        element: <MinimalLayout />,
        children: [
            {
                path: '/check-mail',
                element: (
                    <NavMotion>
                        <GuestGuard>
                            <CheckMail />
                        </GuestGuard>
                    </NavMotion>
                )
            }
        ]
    },
    {
        path: '/invite/:companyId/:email/',
        element: <Invite />
    },
    {
        path: '/invite/:companyId/:email/:token',
        element: <Invite />
    },
    {
        path: '/calendar/organization/:companyId/appointment/:eventId/email/:email',
        element: <OuterAppointment />
    },
    {
        path: '/calendar/organization/:companyId/appointment/:eventId/',
        element: <OuterAppointment />
    }
];

export default AuthenticationRoutes;
