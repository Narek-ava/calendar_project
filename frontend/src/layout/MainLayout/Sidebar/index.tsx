// material-ui
import { makeStyles } from '@material-ui/styles';
import { useTheme, Theme } from '@material-ui/core/styles';
import { Box, Drawer, useMediaQuery } from '@material-ui/core';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import { BrowserView, MobileView } from 'react-device-detect';

// project imports
import MenuList from './MenuList';
import LogoSection from '../LogoSection';
import { drawerWidth } from 'store/constant';
import { Divider, Stack } from '@mui/material';
import WidgetLink from '../Header/WidgetLink';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    drawer: {
        [theme.breakpoints.up('md')]: {
            width: drawerWidth,
            flexShrink: 0
        }
    },
    drawerPaper: {
        width: drawerWidth,
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderRight: 'none',
        [theme.breakpoints.up('md')]: {
            top: '88px'
        }
    },
    ScrollHeight: {
        height: 'calc(100vh - 88px)',
        paddingLeft: '16px',
        paddingRight: '16px',
        [theme.breakpoints.down('sm')]: {
            height: 'calc(100vh - 56px)'
        }
    },
    boxContainer: {
        display: 'flex',
        padding: '16px',
        marginLeft: 'auto',
        marginRight: 'auto'
    }
}));

// ==============================|| SIDEBAR DRAWER ||============================== //

export interface SidebarProps {
    drawerOpen?: boolean;
    drawerToggle?: () => void;
    window?: Window;
    matchSm: boolean;
}

const Sidebar = ({ drawerOpen, drawerToggle, window, matchSm }: SidebarProps) => {
    const classes = useStyles();
    const theme = useTheme();
    const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));

    const drawer = (
        <>
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
                <div className={classes.boxContainer}>
                    <LogoSection />
                </div>
            </Box>
            {matchSm && (
                <>
                    <Stack alignItems="flex-start" spacing={2} sx={{ width: '100%', p: '0 16px', mb: 2 }}>
                        <WidgetLink />
                    </Stack>
                    <Divider />
                </>
            )}
            <BrowserView>
                <PerfectScrollbar component="div" className={classes.ScrollHeight} id="sidebar_wrapper">
                    <MenuList />
                </PerfectScrollbar>
            </BrowserView>
            <MobileView>
                <Box sx={{ px: 2 }}>
                    <MenuList />
                </Box>
            </MobileView>
        </>
    );

    const container = window !== undefined ? () => window.document.body : undefined;

    return (
        <nav className={classes.drawer} aria-label="mailbox folders">
            <Drawer
                container={container}
                variant={matchUpMd ? 'persistent' : 'temporary'}
                anchor="left"
                open={drawerOpen}
                onClose={drawerToggle}
                classes={{
                    paper: classes.drawerPaper
                }}
                ModalProps={{ keepMounted: true }}
                color="inherit"
            >
                {drawer}
            </Drawer>
        </nav>
    );
};

export default Sidebar;
