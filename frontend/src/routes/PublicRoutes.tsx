import MinimalLayout from '../layout/MinimalLayout';
import Loadable from '../ui-component/Loadable';
import { lazy } from 'react';
// import GuestGuard from '../utils/route-guard/GuestGuard';
import NavMotion from '../layout/NavMotion';
import WidgetError from '../views/scheduling-widget/widget-wizard/WidgetError';
import config from '../config';
import EmbeddedWidget from '../views/scheduling-widget/embedded/EmbeddedWidget';
import Widget from '../views/scheduling-widget/Widget';

const AppointmentsWidget = Loadable(lazy(() => import('../views/customer-appointments-widget/AppointmentsWidget')));

const PublicRoutes = [
    {
        path: 'cal',
        element: <MinimalLayout />,
        children: [
            {
                path: config.publicPath,
                element: <WidgetError />
            },
            {
                path: `${config.publicPath}:company_slug/*`,
                element: (
                    <NavMotion>
                        <Widget />
                    </NavMotion>
                )
            },
            {
                path: `${config.publicPath}/embed/:company_slug/*`,
                element: <EmbeddedWidget />
            },
            {
                path: `${config.publicPath}:company_slug/booking/:appointment_uuid`,
                element: (
                    <NavMotion>
                        <AppointmentsWidget />
                    </NavMotion>
                )
            }
        ]
    }
];

export default PublicRoutes;
