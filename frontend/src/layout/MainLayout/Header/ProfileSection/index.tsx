import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { IconLogout, IconSettings, IconCurrencyDollar } from '@tabler/icons';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Theme, useTheme } from '@material-ui/core/styles';
import {
    Avatar,
    CardContent,
    Chip,
    Divider,
    Grid,
    Link,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    Typography
} from '@material-ui/core';
import ManageAccounts from '@material-ui/icons/ManageAccounts';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import useAuth from 'hooks/useAuth';

import { DefaultRootStateProps } from 'types';

// assets
import NotificationSection from '../NotificationSection';
import OrganizationSwitcher from '../../OrganizationSwitcher';
import { colors } from '../../../../store/constant';
import { replaceMinioToLocalhost } from '../../../../utils/functions/uploading-images-helpers';

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
    headerAvatar: {
        cursor: 'pointer',
        ...theme.typography.mediumAvatar,
        margin: '8px 0 8px 8px !important',
        [theme.breakpoints.down('md')]: {
            width: '26px',
            height: '26px',
            margin: '3px 0 3px 8px !important'
        }
    },
    profileChip: {
        height: '48px',
        alignItems: 'center',
        borderRadius: '27px',
        transition: 'all .2s ease-in-out',
        borderColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
        '&[aria-controls="menu-list-grow"], &:hover': {
            borderColor: theme.palette.secondary.main,
            background: `${theme.palette.secondary.main}!important`,
            color: theme.palette.secondary.light,
            '& svg': {
                stroke: theme.palette.secondary.light
            }
        },
        [theme.breakpoints.down('md')]: {
            height: '36px'
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
        padding: '16px !important'
    },
    card: {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark[800] : theme.palette.primary.light,
        marginBottom: '16px',
        marginTop: '16px'
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
    name: {
        marginLeft: '2px',
        fontWeight: 400
    },
    ScrollHeight: {
        height: '100%',
        maxHeight: 'calc(100vh - 250px)',
        overflowX: 'hidden'
    },
    badgeWarning: {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.dark : theme.palette.warning.dark,
        color: '#fff'
    },
    logo: {
        ...theme.typography.mediumAvatar
    }
}));

// ==============================|| PROFILE MENU ||============================== //

const ProfileSection = ({ isMobile }: { isMobile: boolean }) => {
    const classes = useStyles();
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const customization = useSelector((state: DefaultRootStateProps) => state.customization);
    const [selectedIndex] = React.useState(1);
    const { logout, user } = useAuth();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const openMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const closeMenu = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error(err);
        }
        location.state = null;
    };

    const handleOpenSettings = () => {
        navigate('/profile');
    };

    const getLogo = useCallback((avatar) => replaceMinioToLocalhost(avatar ? avatar.url : ''), []);

    return (
        <>
            {user && (
                <>
                    {!isMobile && <OrganizationSwitcher />}
                    <NotificationSection />
                    <Chip
                        classes={{ label: classes.profileLabel }}
                        className={classes.profileChip}
                        size="small"
                        icon={
                            <Avatar
                                src={getLogo(user.avatar)}
                                className={classes.headerAvatar}
                                aria-controls={anchorEl ? 'menu-list-grow' : undefined}
                                aria-haspopup="true"
                                color="inherit"
                                // src={getLogo(company.logo)}
                                sx={{
                                    backgroundColor: user.employee.background_color
                                        ? `#${user.employee.background_color}`
                                        : colors.blue.value
                                }}
                            >
                                <Typography
                                    fontSize="inherit"
                                    sx={{
                                        color: theme.palette.getContrastText(
                                            user.employee.background_color ? `#${user.employee.background_color}` : colors.blue.value
                                        )
                                    }}
                                >
                                    {user.firstname.charAt(0).toUpperCase()}
                                </Typography>
                            </Avatar>
                        }
                        label={<IconSettings stroke={1.5} size="1.5rem" color={theme.palette.secondary.main} />}
                        variant="outlined"
                        aria-controls={anchorEl ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        onClick={openMenu}
                        color="secondary"
                    />
                    <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={closeMenu}>
                        <MainCard border={false} elevation={16} content={false} sx={{ boxShadow: 'none !important' }}>
                            <CardContent className={classes.cardContent}>
                                <Grid container direction="column" spacing={0}>
                                    <Grid item className={classes.flex}>
                                        <Typography variant="h4" className={classes.name} maxWidth={400}>
                                            {user?.firstname} {user?.lastname}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="subtitle2">{user.employee.role.name}</Typography>
                                    </Grid>
                                </Grid>
                                {isMobile && (
                                    <>
                                        <OrganizationSwitcher sx={{ m: '10px 0', width: '100%' }} />
                                        <Divider />
                                    </>
                                )}
                                <List component="nav" className={classes.navContainer}>
                                    <ListItemButton
                                        className={classes.listItem}
                                        sx={{ borderRadius: `${customization.borderRadius}px` }}
                                        selected={selectedIndex === 4}
                                        onClick={handleOpenSettings}
                                    >
                                        <ListItemIcon>
                                            <ManageAccounts />
                                        </ListItemIcon>
                                        <ListItemText primary={<Typography variant="body2">Profile Settings</Typography>} />
                                    </ListItemButton>
                                    {user.stripe_billing_portal_url && (
                                        <>
                                            <Divider sx={{ my: 1 }} />
                                            <Link href={user.stripe_billing_portal_url} target="_blank" underline="none">
                                                <ListItemButton
                                                    className={classes.listItem}
                                                    sx={{ borderRadius: `${customization.borderRadius}px` }}
                                                >
                                                    <ListItemIcon>
                                                        <IconCurrencyDollar stroke={1.5} size="1.3rem" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={<Typography variant="body2">Billing Portal</Typography>} />
                                                </ListItemButton>
                                            </Link>
                                        </>
                                    )}
                                    <Divider sx={{ my: 1 }} />
                                    <ListItemButton
                                        className={classes.listItem}
                                        sx={{ borderRadius: `${customization.borderRadius}px` }}
                                        selected={selectedIndex === 4}
                                        onClick={handleLogout}
                                    >
                                        <ListItemIcon>
                                            <IconLogout stroke={1.5} size="1.3rem" />
                                        </ListItemIcon>
                                        <ListItemText primary={<Typography variant="body2">Logout</Typography>} />
                                    </ListItemButton>
                                </List>
                            </CardContent>
                        </MainCard>
                    </Menu>
                </>
            )}
        </>
    );
};

export default ProfileSection;
