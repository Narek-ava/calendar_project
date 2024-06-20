// import { useState } from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, Box, ButtonBase, Theme } from '@material-ui/core';

// project imports
import LogoSection from '../LogoSection';
// import SearchSection from './SearchSection';
import ProfileSection from './ProfileSection';
import WidgetLink from './WidgetLink';

// assets
import { IconMenu2 } from '@tabler/icons';
import SupportWidget from './SupportWidget';
import SearchFilter from '../../../views/calendar/filters/SearchFilter';
import MobileCreateButton from './MobileCreateButton';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    grow: {
        flexGrow: 1
    },
    headerAvatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        transition: 'all .2s ease-in-out',
        background: theme.palette.mode === 'dark' ? theme.palette.dark.light : theme.palette.secondary.light,
        color: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark,
        '&:hover': {
            background: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark,
            color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.light
        }
    },
    boxContainer: {
        width: '228px',
        display: 'flex',
        [theme.breakpoints.down('md')]: {
            width: 'auto'
        }
    }
}));

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

export interface HeaderProps {
    handleLeftDrawerToggle: () => void;
    matchSm: boolean;
}

const Header = ({ handleLeftDrawerToggle, matchSm }: HeaderProps) => {
    const classes = useStyles();
    return (
        <>
            {/* logo & toggler button */}
            <div className={classes.boxContainer}>
                <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
                    <LogoSection />
                </Box>
                <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <Avatar variant="rounded" className={classes.headerAvatar} onClick={handleLeftDrawerToggle} color="inherit">
                        <IconMenu2 stroke={1.5} size="1.3rem" />
                    </Avatar>
                </ButtonBase>
            </div>
            {!matchSm && (
                <Box ml={2}>
                    <SearchFilter />
                </Box>
            )}
            <div className={classes.grow} />
            <div className={classes.grow} />
            <MobileCreateButton />
            <SupportWidget />
            {!matchSm && <WidgetLink />}
            <ProfileSection isMobile={matchSm} />
        </>
    );
};

export default Header;
