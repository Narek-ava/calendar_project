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
    Divider,
    useMediaQuery,
    Chip
} from '@material-ui/core';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';

// project imports
import AddNewConversationDialog from './AddNewConversationDialog';
import MainCard from 'ui-component/cards/MainCard';
import { appDrawerWidth as drawerWidth, gridSpacing } from 'store/constant';
import { IInboxFolder, InboxDrawerProps } from './types';
import { DefaultRootStateProps } from 'types';

// assets
import MailTwoToneIcon from '@material-ui/icons/MailTwoTone';
import StarTwoToneIcon from '@material-ui/icons/StarTwoTone';
import MarkEmailReadTwoTone from '@material-ui/icons/MarkEmailReadTwoTone';
import HistoryEduTwoToneIcon from '@material-ui/icons/HistoryEduTwoTone';
import DeleteTwoToneIcon from '@material-ui/icons/DeleteTwoTone';
import NewReleasesTwoToneIcon from '@material-ui/icons/NewReleasesTwoTone';
import AlternateEmailTwoToneIcon from '@material-ui/icons/AlternateEmailTwoTone';
import DraftsTwoToneIcon from '@material-ui/icons/DraftsTwoTone';

import MailboxSwitcher from '../settings/MailboxSwitcher';
import { Link } from 'react-router-dom';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
// style constant
const useStyles = makeStyles((theme: Theme) => ({
    ScrollHeight: {
        overflowX: 'hidden',
        minHeight: '435px',
        [theme.breakpoints.down('lg')]: {
            height: 'calc(100vh - 115px)',
            minHeight: 0
        }
    }
}));
interface IRenderFolder {
    filterValue: IInboxFolder | undefined;
    folderElem: IInboxFolder;
    handleFilter: (arg: IInboxFolder) => void;
    getFilterIcon: (arg: string) => JSX.Element;
}

const renderFolder = ({ filterValue, getFilterIcon, handleFilter, folderElem }: IRenderFolder) => (
    <ListItemButton selected={filterValue?.name === folderElem.name} key={folderElem.id} onClick={() => handleFilter(folderElem)}>
        <ListItemIcon>{getFilterIcon(folderElem.name)}</ListItemIcon>
        <ListItemText primary={folderElem.name} />
        <Chip label={folderElem.total_count} size="small" />
    </ListItemButton>
);

// ==============================|| MAIL DRAWER ||============================== //

const InboxDrawer = ({ mailbox, switchMailbox, handleDrawerOpen, openMailSidebar, folder, handleFilter }: InboxDrawerProps) => {
    const classes = useStyles();
    const theme = useTheme();
    const customization = useSelector((state: DefaultRootStateProps) => state.customization);
    const matchDownSM = useMediaQuery(theme.breakpoints.down('lg'));
    const initialFolder = mailbox.folders.find((folderElem) => folderElem.type === 1);

    const getFilterIcon = (folderName: string) => {
        switch (folderName) {
            case 'Unassigned':
                return <DraftsTwoToneIcon />;
            case 'Starred':
                return <StarTwoToneIcon />;
            case 'Spam':
                return <NewReleasesTwoToneIcon />;
            case 'Drafts':
                return <HistoryEduTwoToneIcon />;
            case 'Deleted':
                return <DeleteTwoToneIcon />;
            case 'Closed':
                return <MarkEmailReadTwoTone />;
            case 'Assigned':
                return <AlternateEmailTwoToneIcon />;
            default:
                return <MailTwoToneIcon />;
        }
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
                        <Grid item xs={12} sx={{ mb: 4 }}>
                            <MailboxSwitcher mailbox={mailbox} onChange={switchMailbox} />
                        </Grid>
                        <Grid item xs={12}>
                            <AddNewConversationDialog mailbox={mailbox} />
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
                                    {mailbox.folders.map((folderElem) => {
                                        if (folderElem.name === 'Deleted' || folderElem.name === 'Spam') {
                                            return;
                                        }
                                        // eslint-disable-next-line consistent-return
                                        return renderFolder({
                                            folderElem,
                                            handleFilter,
                                            filterValue: folder || initialFolder,
                                            getFilterIcon
                                        });
                                    })}
                                    <Divider sx={{ my: 2 }} />
                                    {mailbox.folders.map((folderElem) => {
                                        if (folderElem.name === 'Deleted' || folderElem.name === 'Spam') {
                                            // eslint-disable-next-line consistent-return
                                            return renderFolder({
                                                folderElem,
                                                handleFilter,
                                                filterValue: folder || initialFolder,
                                                getFilterIcon
                                            });
                                        }
                                        return undefined;
                                    })}
                                </List>
                            </PerfectScrollbar>
                        </Grid>
                        <Grid item xs={4}>
                            <Tooltip title="Edit mailbox" placement="bottom">
                                <Link to={`/mailbox/settings/edit/${mailbox.id}`}>
                                    <Button variant="outlined" color="secondary">
                                        <SettingsOutlinedIcon sx={{ fill: 'gray' }} />
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

export default InboxDrawer;
