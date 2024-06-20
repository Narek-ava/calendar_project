import { lazy } from 'react';

import AuthGuard from 'utils/route-guard/AuthGuard';
import { WebsocketProvider } from '../contexts/WebsocketContext';
import Loadable from 'ui-component/Loadable';
import SupportLayout from '../layout/SupportLayout';

const SelectOrganization = Loadable(lazy(() => import('../views/support/SelectOrganization')));

const SupportRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <WebsocketProvider>
                <SupportLayout />
            </WebsocketProvider>
        </AuthGuard>
    ),
    children: [
        {
            path: '/select-organization',
            element: (
                <>
                    <SelectOrganization />
                </>
            )
        }
    ]
};

export default SupportRoutes;
