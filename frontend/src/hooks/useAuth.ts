import { useContext } from 'react';

// auth provider
import SanctumContext from '../contexts/SanctumContext';

// ==============================|| AUTH HOOKS ||============================== //

const useAuth = () => useContext(SanctumContext);

export default useAuth;
