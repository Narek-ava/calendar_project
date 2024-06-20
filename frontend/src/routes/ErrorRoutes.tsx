import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';

// sample page routing
const ErrorPage = Loadable(lazy(() => import('../views/Error')));

// ==============================|| MAIN ROUTING ||============================== //

const ErrorRoutes = {
    path: '*',
    element: <ErrorPage />
};

export default ErrorRoutes;
