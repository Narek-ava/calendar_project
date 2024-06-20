import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { useTheme, Theme } from '@material-ui/core/styles';
import Badge from '@mui/material/Badge';
import {
    Avatar,
    Box,
    ButtonBase,
    CardContent,
    Chip,
    ClickAwayListener,
    Divider,
    Grid,
    Paper,
    Popper,
    Stack,
    Typography,
    useMediaQuery
} from '@material-ui/core';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import NotificationList from './NotificationList';

// assets
import { IconBell } from '@tabler/icons';
import notificationAPI from 'services/NotificationService';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    ScrollHeight: {
        height: '100%',
        maxHeight: 'calc(100vh - 205px)',
        overflowX: 'hidden'
    },
    headerAvatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        transition: 'all .2s ease-in-out',
        background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
        color: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.secondary.dark,
        '&[aria-controls="menu-list-grow"],&:hover': {
            background: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.secondary.dark,
            color: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.secondary.light
        }
    },
    cardContent: {
        padding: '0px !important',
        overflowX: 'hidden'
    },
    notificationChip: {
        color: theme.palette.background.default,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.warning.dark
    },
    divider: {
        marginTop: 0,
        marginBottom: 0
    },
    cardAction: {
        padding: '10px',
        justifyContent: 'center'
    },
    paddingBottom: {
        paddingBottom: '16px'
    },
    box: {
        marginLeft: '16px',
        marginRight: '24px',
        [theme.breakpoints.down('sm')]: {
            marginRight: '16px'
        }
    },
    bodyPPacing: {
        padding: '16px 16px 0'
    },
    textBoxSpacing: {
        padding: '0px 16px'
    }
}));

// ==============================|| NOTIFICATION ||============================== //

const NotificationSection = () => {
    const classes = useStyles();
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down('sm'));

    const [open, setOpen] = React.useState(false);
    const [invisible, setInvisible] = React.useState(true);

    /**
     * anchorRef is used on different componets and specifying one type leads to other components throwing an error
     * */
    const anchorRef = React.useRef<any>(null);

    const { data } = notificationAPI.useGetAccountNotificationsQuery(null);
    const [markReadAll] = notificationAPI.useMarkAllNotificationsAsReadMutation();

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }
        prevOpen.current = open;
    }, [open]);

    const notificationsLength = useMemo(() => data?.length, [data]);
    const unreadNotificationsLength = useMemo(() => data?.filter((notification) => !notification.read_at).length, [data]);

    React.useEffect(() => {
        if (unreadNotificationsLength !== undefined) {
            if (unreadNotificationsLength > 0) {
                setInvisible(false);
            } else {
                setInvisible(true);
            }
        }
    }, [unreadNotificationsLength]);

    const onPressReadAll = () => {
        markReadAll(null);
    };

    return (
        <>
            <Box component="span" className={classes.box}>
                <ButtonBase sx={{ borderRadius: '12px' }}>
                    <Avatar
                        variant="rounded"
                        className={classes.headerAvatar}
                        ref={anchorRef}
                        aria-controls={open ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        onClick={handleToggle}
                        color="inherit"
                    >
                        <Badge
                            color="error"
                            overlap="circular"
                            variant="dot"
                            invisible={invisible}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <IconBell stroke={1.5} size="1.3rem" />
                        </Badge>
                    </Avatar>
                </ButtonBase>
            </Box>
            <Popper
                placement={matchesXs ? 'bottom' : 'bottom-end'}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [matchesXs ? 5 : 0, 20]
                            }
                        }
                    ]
                }}
            >
                {({ TransitionProps }) => (
                    <Transitions in={open} {...TransitionProps}>
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                                    <CardContent className={classes.cardContent}>
                                        <Grid container direction="column" spacing={2}>
                                            <Grid item xs={12}>
                                                <div className={classes.bodyPPacing}>
                                                    <Grid container alignItems="center" justifyContent="space-between">
                                                        <Grid item>
                                                            {notificationsLength ? (
                                                                <Stack direction="row" spacing={2}>
                                                                    <Typography variant="subtitle1">Notifications</Typography>
                                                                    <Chip
                                                                        size="small"
                                                                        label={unreadNotificationsLength}
                                                                        // className={classes.notificationChip}
                                                                        color={
                                                                            unreadNotificationsLength && unreadNotificationsLength > 0
                                                                                ? 'error'
                                                                                : 'warning'
                                                                        }
                                                                    />
                                                                </Stack>
                                                            ) : (
                                                                <Typography variant="subtitle1">No notifications yet</Typography>
                                                            )}
                                                        </Grid>
                                                        {!!unreadNotificationsLength && unreadNotificationsLength > 0 && (
                                                            <Grid item onClick={onPressReadAll}>
                                                                <Typography component={Link} to="#" variant="subtitle2" color="primary">
                                                                    Mark all as read
                                                                </Typography>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                </div>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <PerfectScrollbar className={classes.ScrollHeight} options={{ suppressScrollX: true }}>
                                                    <Grid container direction="column" spacing={2}>
                                                        {/* <Grid item xs={12}>
                                                            <div className={classes.textBoxSpacing}>
                                                                <TextField
                                                                    id="outlined-select-currency-native"
                                                                    select
                                                                    fullWidth
                                                                    value={value}
                                                                    onChange={handleChange}
                                                                    SelectProps={{
                                                                        native: true
                                                                    }}
                                                                >
                                                                    {status.map((option) => (
                                                                        <option key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </TextField>
                                                            </div>
                                                        </Grid> */}

                                                        {!!notificationsLength && notificationsLength > 0 && (
                                                            <>
                                                                <Grid item xs={12} p={0}>
                                                                    <Divider className={classes.divider} />
                                                                </Grid>
                                                                <Grid sx={{ padding: '0 0 0 16px' }}>
                                                                    <NotificationList notifications={data} setOpen={setOpen} />
                                                                </Grid>
                                                            </>
                                                        )}
                                                    </Grid>
                                                </PerfectScrollbar>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                    {/* <Divider />
                                    <CardActions className={classes.cardAction}>
                                        <Button size="small" disableElevation>
                                            View All
                                        </Button>
                                    </CardActions> */}
                                </MainCard>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </Popper>
        </>
    );
};

export default NotificationSection;
