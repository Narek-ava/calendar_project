import { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { useTheme, Theme } from '@material-ui/core/styles';
import { AppBar, CssBaseline, Toolbar, useMediaQuery, Alert, Link, Box } from '@material-ui/core';

// third-party
import clsx from 'clsx';
import { hotjar } from 'react-hotjar';

// project imports
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Header from './Header';
import Sidebar from './Sidebar';
import navigation from 'menu-items';
import { drawerWidth } from 'store/constant';
import { SET_MENU } from 'store/actions';
import { DefaultRootStateProps } from 'types';

// assets
import { IconChevronRight } from '@tabler/icons';
import useAuth from '../../hooks/useAuth';

// casl
import { AbilityContext } from '../../utils/roles/Can';
import { Ability, AbilityBuilder } from '@casl/ability';
import { baseUserActions } from '../../utils/roles/ability';
import { IUser, UserPermission } from '../../models/IUser';
import { useLocation, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import config from '../../config';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'flex'
    },
    appBar: {
        backgroundColor: theme.palette.background.default
    },
    appBarWidth: {
        transition: theme.transitions.create('width'),
        backgroundColor: theme.palette.background.default
    },
    content: {
        ...theme.typography.mainContent,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        [theme.breakpoints.up('md')]: {
            marginLeft: -(drawerWidth - 20),
            width: `calc(100% - ${drawerWidth}px)`
        },
        [theme.breakpoints.down('md')]: {
            marginLeft: '20px',
            width: `calc(100% - ${drawerWidth}px)`,
            padding: '16px'
        },
        '@media(max-width:768px)': {
            padding: '0'
        },
        [theme.breakpoints.down('sm')]: {
            marginLeft: 0,
            // width: `calc(100% - ${drawerWidth}px)`,
            // padding: '16px',
            // padding: '0',
            marginRight: 0
        },
        '& > div': {
            border: 'none'
        },
        paddingBottom: 0
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        }),
        marginLeft: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        [theme.breakpoints.down('md')]: {
            marginLeft: '20px'
        },
        [theme.breakpoints.down('sm')]: {
            marginLeft: '10px'
        }
    }
}));

const updateAbility = (ability: Ability, user: IUser) => {
    const {
        employee: {
            role: { permissions }
        }
    } = user;
    const { can, rules } = new AbilityBuilder(Ability);

    permissions.forEach(({ action, subject }: UserPermission) => {
        if (action === '*') {
            baseUserActions.forEach((baseAction) => {
                can(baseAction, subject);
            });
        } else {
            can(action, subject);
        }
    });

    ability.update(rules);
};

declare global {
    interface Window {
        // $crisp: any;
        // CRISP_WEBSITE_ID: string;
        LiveAgent: any;
    }
}

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useStyles();
    const { user } = useAuth();
    const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
    const matchSm = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('sm'));
    const { showSupportWidget } = useAppSelector((state) => state.layout);

    useEffect(() => {
        // if (!companyId) {
        if (location.pathname === '/') {
            navigate(config.defaultPath, { replace: true });
        }
    }, [location]);
    // Handle left drawer
    const leftDrawerOpened = useSelector((state: DefaultRootStateProps) => state.customization.opened);
    const handleLeftDrawerToggle = () => {
        dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
    };

    const ability = useContext(AbilityContext);

    useEffect(() => {
        dispatch({ type: SET_MENU, opened: !matchDownMd });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchDownMd]);

    useEffect(() => {
        if (user) {
            updateAbility(ability, user);
        }
    }, [user, user?.employee.role.name]);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return;

        hotjar.initialize(3409396, 6);

        (function () {
            const s = document.createElement('script');
            s.src = 'https://chilledbutter.ladesk.com/scripts/track.js';
            s.id = 'la_x2s6df8d';
            s.type = 'text/javascript';
            s.async = true;
            s.onload = () => {
                window.LiveAgent.clearAllUserDetails();
                window.LiveAgent.setUserDetails(user?.email, user?.firstname, user?.lastname, user?.phone);
                window.LiveAgent.createButton('p2umaul7', document.getElementById('LiveAgent-chatButton'));
            };
            document.getElementsByTagName('head')[0].appendChild(s);
        })();
    }, [user]);

    return (
        <div className={classes.root}>
            <CssBaseline />
            {/* header */}
            <AppBar
                enableColorOnDark
                position="fixed"
                color="inherit"
                elevation={0}
                className={leftDrawerOpened ? classes.appBarWidth : classes.appBar}
            >
                <Toolbar sx={{ pl: matchSm ? '24px !important' : '16px !important' }}>
                    <Header handleLeftDrawerToggle={handleLeftDrawerToggle} matchSm={matchSm} />
                </Toolbar>
            </AppBar>

            {/* drawer */}
            <Sidebar drawerOpen={leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} matchSm={matchSm} />

            {/* main content */}
            <main
                className={clsx([
                    classes.content,
                    {
                        [classes.contentShift]: leftDrawerOpened
                    }
                ])}
            >
                {user?.is_impersonated && (
                    <Alert severity="error" sx={{ marginBottom: theme.spacing(1), borderRadius: '8px' }}>
                        You&apos;re in the impersonate mode, <Link href="/select-organization">select another organization.</Link>
                    </Alert>
                )}
                {/* breadcrumb */}
                <Breadcrumbs separator={IconChevronRight} navigation={navigation} icon title rightAlign />
                <Outlet />
            </main>
            <Box sx={{ display: showSupportWidget ? 'inherit' : 'none' }}>
                <div id="LiveAgent-chatButton" />
            </Box>
        </div>
    );
};

export default MainLayout;
