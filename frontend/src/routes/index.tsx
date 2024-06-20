import { useRoutes } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import AuthenticationRoutes from './AuthenticationRoutes';
import ErrorRoutes from './ErrorRoutes';
import PublicRoutes from './PublicRoutes';
import SupportRoutes from './SupportRoutes';

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
    return useRoutes([...AuthenticationRoutes, MainRoutes, SupportRoutes, ErrorRoutes, ...PublicRoutes]);
}
