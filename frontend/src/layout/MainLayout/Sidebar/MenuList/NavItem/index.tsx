import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, Chip, ListItemButton, ListItemIcon, ListItemText, Theme, Typography, useMediaQuery } from '@material-ui/core';

// project imports
import { MENU_OPEN, SET_MENU } from 'store/actions';
import { DefaultRootStateProps, LinkTarget, NavItemType } from 'types';
import { clearDeactivationToggle } from 'store/slices/deactivationToggleSlice';

// assets
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    listIcon: {
        minWidth: '18px',
        marginTop: 'auto',
        marginBottom: 'auto'
    },
    menuIcon: {
        marginTop: 'auto',
        marginBottom: 'auto'
    },
    listCustomIcon: {
        marginTop: 'auto',
        marginBottom: 'auto'
    },
    listCustomIconSub: {
        width: '6px',
        height: '6px'
    },
    listCustomIconSubActive: {
        width: '8px',
        height: '8px'
    },
    listItem: {
        marginBottom: '5px',
        alignItems: 'center'
    },
    listItemNoBack: {
        marginBottom: '5px',
        backgroundColor: 'transparent !important',
        paddingTop: '8px',
        paddingBottom: '8px',
        alignItems: 'flex-start'
    },
    subMenuCaption: {
        ...theme.typography.subMenuCaption
    }
}));

// ==============================|| SIDEBAR MENU LIST ITEMS ||============================== //

export interface NavItemProps {
    item: NavItemType;
    level: number;
}

const NavItem = ({ item, level }: NavItemProps) => {
    const { pathname } = useLocation();
    const classes = useStyles();
    const dispatch = useDispatch();
    const customization = useSelector((state: DefaultRootStateProps) => state.customization);
    const matchesSM = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

    const Icon = item?.icon!;
    const itemIcon = item?.icon ? (
        <Icon stroke={1.5} size="1.3rem" />
    ) : (
        <FiberManualRecordIcon
            className={
                customization.isOpen.findIndex((id) => id === item?.id) > -1 ? classes.listCustomIconSubActive : classes.listCustomIconSub
            }
            fontSize={level > 0 ? 'inherit' : 'medium'}
        />
    );

    let itemIconClass = item?.icon ? classes.listIcon : classes.menuIcon;
    /**
     *nav-dark doesnt exist on navType
     *navType can only be 'light' | 'dark'
     */

    let itemTarget: LinkTarget = '_self';
    if (item.target) {
        itemTarget = '_blank';
    }

    itemIconClass = customization.navType === 'dark' ? [itemIconClass, classes.listCustomIcon].join(' ') : itemIconClass;

    let listItemProps: {
        component: React.ForwardRefExoticComponent<React.RefAttributes<HTMLAnchorElement>> | string;
        href?: string;
        target?: LinkTarget;
    } = { component: React.forwardRef((props, ref) => <Link {...props} to={item.url!} target={itemTarget} />) };
    if (item?.external) {
        listItemProps = { component: 'a', href: item.url, target: itemTarget };
    }

    const itemHandler = (id: string) => {
        dispatch({ type: MENU_OPEN, id });
        matchesSM && dispatch({ type: SET_MENU, opened: false });
    };

    // active menu item on page load
    React.useEffect(() => {
        // console.log(pathname);
        if (pathname === '/profile') {
            dispatch({ type: MENU_OPEN, id: null });
            return;
        }
        const currentIndex = pathname
            .toString()
            .split('/')
            .findIndex((id) => id === item.id);
        if (currentIndex > -1) {
            dispatch({ type: MENU_OPEN, id: item.id });
        }
        // eslint-disable-next-line
    }, [pathname]);

    return (
        <ListItemButton
            {...listItemProps}
            disabled={item.disabled}
            className={level > 1 ? classes.listItemNoBack : classes.listItem}
            sx={{ borderRadius: `${customization.borderRadius}px` }}
            selected={customization.isOpen.findIndex((id) => id === item.id) > -1}
            onClick={() => {
                itemHandler(item.id!);
                dispatch(clearDeactivationToggle());
            }}
            style={{ paddingLeft: `${level * 23}px` }}
        >
            <ListItemIcon className={itemIconClass} style={{ minWidth: level > 1 ? 18 : 36 }}>
                {itemIcon}
            </ListItemIcon>
            <ListItemText
                primary={
                    <Typography variant={customization.isOpen.findIndex((id) => id === item.id) > -1 ? 'h5' : 'body1'} color="inherit">
                        {item.title}
                    </Typography>
                }
                secondary={
                    item.caption && (
                        <Typography variant="caption" className={classes.subMenuCaption} display="block" gutterBottom>
                            {item.caption}
                        </Typography>
                    )
                }
            />
            {item.chip && (
                <Chip
                    color={item.chip.color}
                    variant={item.chip.variant}
                    size={item.chip.size}
                    label={item.chip.label}
                    avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
                />
            )}
        </ListItemButton>
    );
};

export default NavItem;
