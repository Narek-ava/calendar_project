// material-ui
import { styled } from '@material-ui/core/styles';

// ==============================|| AUTHENTICATION 1 WRAPPER ||============================== //

const AuthWrapper = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary.light,
    minHeight: '100vh'
}));

export default AuthWrapper;
