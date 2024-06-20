import { styled, Theme } from '@material-ui/core/styles';
import { appDrawerWidth as drawerWidth } from '../../store/constant';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }: { theme: Theme; open: boolean }) => ({
    width: 'calc(100% - 320px)',
    flexGrow: 1,
    paddingLeft: open ? theme.spacing(3) : 0,
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: `-${drawerWidth}px`,
    [theme.breakpoints.down('lg')]: {
        paddingLeft: 0,
        marginLeft: 0
    },
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        }),
        marginLeft: 0
    })
}));

export default Main;
