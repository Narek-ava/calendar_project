import {
    CardContent,
    Chip,
    ClickAwayListener,
    Divider,
    Grid,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    OutlinedInput,
    Paper,
    Popper,
    Stack,
    Typography
} from '@material-ui/core';
import { IconSearch, IconCheck } from '@tabler/icons';
import DoDisturbIcon from '@material-ui/icons/DoDisturb';
import Transitions from '../../../ui-component/extended/Transitions';
import MainCard from '../../../ui-component/cards/MainCard';
import PerfectScrollbar from 'react-perfect-scrollbar';
import React, { useEffect, useRef, useState } from 'react';
import { Theme, useTheme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/styles';
import StringAvatar from './StringAvatar';
import { throttle, filter, includes } from 'lodash';
import employeeAPI from '../../../services/EmployeeService';
import { IConversationAssigner } from './types';
import { IUser } from '../../../models/IUser';
import conversationAPI from '../../../services/ConversationService';
import { SNACKBAR_OPEN } from '../../../store/actions';
import { useAppDispatch } from '../../../hooks/redux';
import { IAssign, IAssignUser } from '../../../models/IConversation';
import mailboxAPI from '../../../services/MailboxService';

// style const
const useStyles = makeStyles((theme: Theme) => ({
    navContainer: {
        width: '100%',
        maxWidth: '350px',
        minWidth: '300px',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '10px',
        [theme.breakpoints.down('sm')]: {
            minWidth: '100%'
        }
    },
    profileChip: {
        color: theme.palette.grey['800'],
        border: '1px transparent',
        alignItems: 'center',
        borderRadius: '27px',
        transition: 'all .2s ease-in-out',
        '&[aria-controls="menu-list-grow"], &:hover': {
            borderColor: theme.palette.primary.main,
            background: `${theme.palette.primary.light}!important`,
            color: theme.palette.primary.main,
            '& svg': {
                stroke: theme.palette.primary.light
            }
        }
    },
    profileLabel: {
        lineHeight: 0,
        padding: '12px'
    },
    listItem: {
        marginTop: '5px'
    },
    cardContent: {
        padding: '16px 0 !important'
    },
    cardContainer: {
        padding: '0 16px !important'
    },
    searchControl: {
        width: '100%',
        paddingRight: '8px',
        paddingLeft: '16px',
        marginBottom: '16px',
        marginTop: '16px'
    },
    startAdornment: {
        fontSize: '1rem',
        color: theme.palette.grey[500]
    },
    flex: {
        display: 'flex'
    },
    ScrollHeight: {
        height: '100%',
        maxHeight: 'calc(100vh - 250px)',
        overflowX: 'hidden'
    }
}));

const ConversationAssigner = ({ conversation, handleBackToList }: IConversationAssigner) => {
    const dispatch = useAppDispatch();
    const anchorRef = useRef<any>(null);
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [filtered, setFiltered] = useState<IAssignUser[] | undefined>(undefined);
    const { data } = employeeAPI.useFetchAllEmployeesWithSearchQuery(
        {
            search
        },
        {
            refetchOnMountOrArgChange: true
        }
    );
    const [assignConversation] = conversationAPI.useAssignConversationMutation();
    const transformAssignee = (user: IUser): IAssignUser => ({
        ...user,
        firstName: user.firstname,
        lastName: user.lastname
    });

    const assigned: IUser | IAssignUser = conversation.assignee;

    const throttled = useRef(
        throttle((newValue) => {
            setSearch(newValue);
        }, 200)
    );

    useEffect(() => {
        if (data) {
            if (search) {
                const searched = filter(
                    data.data,
                    (row) =>
                        includes(row.user.firstname.toLowerCase(), search) ||
                        includes(row.user.lastname.toLowerCase(), search) ||
                        includes(row.user.email.toLowerCase(), search)
                ).map((employee) => transformAssignee(employee.user));
                setFiltered(searched);
            } else {
                setFiltered(undefined);
            }
        }
    }, [data, search]);

    const handleSearch = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | undefined) => {
        const newString = event?.target.value;
        throttled.current(newString?.toLowerCase());
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
        setSearch('');
    };

    const handleClose = (event: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };
    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current && !open) {
            anchorRef.current.focus();
        }

        prevOpen.current = open;
    }, [open]);
    const assignUser = (user: IUser | IAssignUser) => {
        const assignData: IAssign = {
            conversation,
            user_id: user.id
        };

        assignConversation(assignData)
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'User successfully assigned',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                dispatch(mailboxAPI.util.invalidateTags(['Mailbox']));
                handleToggle();
                handleBackToList();
            })
            .catch(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: "Error: User hasn't assigned",
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    const unAssign = () => {
        const assignData: IAssign = {
            conversation,
            user_id: -1
        };

        assignConversation(assignData)
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Conversation successfully unassigned',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                dispatch(mailboxAPI.util.invalidateTags(['Mailbox']));
                handleToggle();
                handleBackToList();
            })
            .catch(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: "Error: Conversation hasn't updated",
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    return (
        <Stack alignContent="center" justifyContent="center">
            <Chip
                classes={{ label: classes.profileLabel }}
                className={classes.profileChip}
                label="Assign"
                variant="outlined"
                ref={anchorRef}
                aria-controls={open ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                color="primary"
            />
            <Popper
                placement="bottom-end"
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                // disablePortal
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 14]
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
                                        <Grid container direction="column" spacing={0}>
                                            <Grid item className={classes.cardContainer}>
                                                <Typography variant="h4" textAlign="center">
                                                    Assign
                                                </Typography>
                                            </Grid>
                                            <Grid item className={classes.cardContainer}>
                                                <OutlinedInput
                                                    className={classes.searchControl}
                                                    id="input-search-profile"
                                                    value={search}
                                                    size="small"
                                                    onChange={handleSearch}
                                                    placeholder="Search"
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <IconSearch stroke={1.5} size="1.3rem" className={classes.startAdornment} />
                                                        </InputAdornment>
                                                    }
                                                    aria-describedby="search-helper-text"
                                                    inputProps={{
                                                        'aria-label': 'weight'
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                        <Divider />
                                        <Divider />
                                        <List component="nav" className={classes.navContainer}>
                                            {data && assigned ? (
                                                <Stack>
                                                    <ListItem key={assigned.id} className={classes.listItem} sx={{ width: '100%' }}>
                                                        <Stack
                                                            direction="row"
                                                            sx={{ width: '100%' }}
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                        >
                                                            <Stack direction="row">
                                                                <ListItemIcon>
                                                                    <StringAvatar
                                                                        name={
                                                                            'firstName' in assigned
                                                                                ? assigned.firstName
                                                                                : assigned.firstname
                                                                        }
                                                                    />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={
                                                                        <Typography variant="body2">
                                                                            {'firstName' in assigned
                                                                                ? assigned.firstName
                                                                                : assigned.firstname}{' '}
                                                                            {'lastName' in assigned ? assigned.lastName : assigned.lastname}
                                                                        </Typography>
                                                                    }
                                                                />
                                                            </Stack>
                                                            <IconCheck stroke={1.5} size="1.3rem" color={theme.palette.primary.main} />
                                                        </Stack>
                                                    </ListItem>
                                                    <ListItemButton className={classes.listItem} sx={{ width: '100%' }} onClick={unAssign}>
                                                        <Stack
                                                            direction="row"
                                                            sx={{ width: '100%' }}
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                        >
                                                            <ListItemIcon>
                                                                <DoDisturbIcon />
                                                            </ListItemIcon>
                                                            <ListItemText primary={<Typography variant="body2">Unassign</Typography>} />
                                                        </Stack>
                                                    </ListItemButton>
                                                </Stack>
                                            ) : (
                                                <ListItem className={classes.listItem} sx={{ width: '100%' }}>
                                                    <Stack
                                                        direction="row"
                                                        sx={{ width: '100%' }}
                                                        justifyContent="space-between"
                                                        alignItems="center"
                                                    >
                                                        <ListItemIcon>
                                                            <DoDisturbIcon />
                                                        </ListItemIcon>
                                                        <ListItemText primary={<Typography variant="body2">Unassigned</Typography>} />
                                                        <IconCheck stroke={1.5} size="1.3rem" color={theme.palette.primary.main} />
                                                    </Stack>
                                                </ListItem>
                                            )}
                                        </List>
                                        <Divider />
                                        <PerfectScrollbar className={classes.ScrollHeight}>
                                            {data && search.length > 0 && (
                                                <List>
                                                    <Typography
                                                        className={classes.cardContainer}
                                                        variant="body2"
                                                        sx={{
                                                            fontSize: 'sd',
                                                            opacity: 0.7
                                                        }}
                                                    >
                                                        Teammates
                                                    </Typography>
                                                    {filtered &&
                                                        filtered.map((user) => (
                                                            <ListItemButton
                                                                key={user.id}
                                                                className={classes.listItem}
                                                                sx={{ width: '100%' }}
                                                                onClick={() => assignUser(user)}
                                                            >
                                                                <Stack direction="row">
                                                                    <ListItemIcon>
                                                                        <StringAvatar name={user.firstName} />
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        primary={
                                                                            <Typography variant="body2">
                                                                                {user.firstName} {user.lastName}
                                                                            </Typography>
                                                                        }
                                                                    />
                                                                </Stack>
                                                            </ListItemButton>
                                                        ))}
                                                    {filtered?.length === 0 && (
                                                        <ListItem className={classes.listItem} sx={{ width: '100%' }}>
                                                            <Typography variant="body2">No users match your search</Typography>
                                                        </ListItem>
                                                    )}
                                                </List>
                                            )}
                                        </PerfectScrollbar>
                                    </CardContent>
                                </MainCard>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </Popper>
        </Stack>
    );
};

export default ConversationAssigner;
