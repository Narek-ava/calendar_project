import { useSelector } from 'react-redux';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Theme, useTheme } from '@material-ui/core/styles';
import {
    Button,
    CardContent,
    Drawer,
    Grid,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    useMediaQuery
} from '@material-ui/core';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { appDrawerWidth as drawerWidth, gridSpacing } from 'store/constant';
import { MailboxSettingsProps } from './types';
import { DefaultRootStateProps } from 'types';

// assets
import CheckBoxTwoToneIcon from '@material-ui/icons/CheckBoxTwoTone';
import EditTwoToneIcon from '@material-ui/icons/EditTwoTone';
import SyncAltTwoToneIcon from '@material-ui/icons/SyncAltTwoTone';
import MailboxSwitcher from './MailboxSwitcher';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import ForwardToInboxTwoTone from '@material-ui/icons/ForwardToInboxTwoTone';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    ScrollHeight: {
        // height: 'calc(100vh - 295px)',
        overflowX: 'hidden',
        minHeight: '435px',
        [theme.breakpoints.down('lg')]: {
            height: 'calc(100vh - 115px)',
            minHeight: 0
        }
    }
}));

// ==============================|| MAIL DRAWER ||============================== //

const SettingsDrawer = ({ handleDrawerOpen, openMailSidebar, mailbox, onChange }: MailboxSettingsProps) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const classes = useStyles();
    const theme = useTheme();
    const customization = useSelector((state: DefaultRootStateProps) => state.customization);
    const matchDownSM = useMediaQuery(theme.breakpoints.down('lg'));

    const handleOpenEdit = () => {
        navigate(`/mailbox/settings/edit/${id}`, { replace: true });
    };

    const handleOpenConnections = () => {
        navigate(`/mailbox/settings/connection/${id}`, { replace: true });
    };

    const handleOpenPermissions = () => {
        navigate(`/mailbox/settings/permissions/${id}`, { replace: true });
    };

    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                zIndex: { xs: 1200, lg: 0 },
                '& .MuiDrawer-paper': {
                    height: 'auto',
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    position: 'relative',
                    border: 'none',
                    borderRadius: matchDownSM ? 0 : `${customization.borderRadius}px`
                }
            }}
            variant={matchDownSM ? 'temporary' : 'persistent'}
            anchor="left"
            open={openMailSidebar}
            ModalProps={{ keepMounted: true }}
            onClose={handleDrawerOpen}
        >
            <MainCard
                sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'dark.main' : 'grey.50'
                }}
                border={!matchDownSM}
                content={false}
            >
                <CardContent sx={{ height: matchDownSM ? '100vh' : 'auto' }}>
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12}>
                            <MailboxSwitcher mailbox={mailbox} onChange={onChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <PerfectScrollbar className={classes.ScrollHeight}>
                                <List
                                    component="nav"
                                    sx={{
                                        '& .MuiListItem-root': {
                                            mb: 0.75,
                                            borderRadius: `${customization.borderRadius}px`,
                                            '& .MuiChip-root': {
                                                color:
                                                    theme.palette.mode === 'dark'
                                                        ? theme.palette.primary.main
                                                        : theme.palette.secondary.main,
                                                bgcolor:
                                                    theme.palette.mode === 'dark' ? theme.palette.dark.dark : theme.palette.secondary.light
                                            }
                                        },
                                        '& .MuiListItem-root.Mui-selected': {
                                            bgcolor:
                                                theme.palette.mode === 'dark' ? theme.palette.dark.dark : theme.palette.secondary.light,
                                            '& .MuiListItemText-primary': {
                                                color:
                                                    theme.palette.mode === 'dark'
                                                        ? theme.palette.primary.main
                                                        : theme.palette.secondary.main
                                            },
                                            '& .MuiChip-root': {
                                                color:
                                                    theme.palette.mode === 'dark'
                                                        ? theme.palette.primary.main
                                                        : theme.palette.secondary.light,
                                                bgcolor:
                                                    theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.main
                                            }
                                        }
                                    }}
                                >
                                    <ListItemButton selected={location.pathname.includes('edit')} onClick={handleOpenEdit}>
                                        <ListItemIcon>
                                            <EditTwoToneIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Edit Mailbox" />
                                    </ListItemButton>
                                    <ListItemButton selected={location.pathname.includes('connection')} onClick={handleOpenConnections}>
                                        <ListItemIcon>
                                            <SyncAltTwoToneIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Connection Settings" />
                                    </ListItemButton>
                                    <ListItemButton
                                        disabled
                                        selected={location.pathname.includes('permissions')}
                                        onClick={handleOpenPermissions}
                                    >
                                        <ListItemIcon>
                                            <CheckBoxTwoToneIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Permissions" />
                                    </ListItemButton>
                                </List>
                            </PerfectScrollbar>
                        </Grid>
                        <Grid item>
                            <Tooltip title="To inbox" placement="bottom">
                                <Link to={`/mailbox/${id}`}>
                                    <Button variant="contained">
                                        <ForwardToInboxTwoTone />
                                    </Button>
                                </Link>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </CardContent>
            </MainCard>
        </Drawer>
    );
};

export default SettingsDrawer;
