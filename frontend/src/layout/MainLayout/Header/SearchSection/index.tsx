import { useState } from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, Box, ButtonBase, Card, CardContent, Grid, InputAdornment, OutlinedInput, Popper, Theme } from '@material-ui/core';

// third-party
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';

// project imports
import Transitions from 'ui-component/extended/Transitions';

// assets
import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    searchControl: {
        width: '434px',
        marginLeft: '16px',
        paddingRight: '16px',
        paddingLeft: '16px',
        '& input': {
            background: 'transparent !important',
            paddingLeft: '5px !important'
        },
        [theme.breakpoints.down('lg')]: {
            width: '250px'
        },
        [theme.breakpoints.down('md')]: {
            width: '100%',
            marginLeft: '4px',
            background: theme.palette.mode === 'dark' ? theme.palette.dark[800] : '#fff'
        }
    },
    startAdornment: {
        fontSize: '1rem',
        color: theme.palette.grey[500]
    },
    headerAvatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
        color: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark,
        '&:hover': {
            background: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark,
            color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.light
        }
    },
    closeAvatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.orange.light,
        color: theme.palette.orange.dark,
        '&:hover': {
            background: theme.palette.orange.dark,
            color: theme.palette.orange.light
        }
    },
    popperContainer: {
        zIndex: 1100,
        width: '99%',
        top: '-55px !important',
        padding: '0 12px',
        [theme.breakpoints.down('sm')]: {
            padding: '0 10px'
        }
    },
    cardContent: {
        padding: '12px !important'
    },
    card: {
        background: theme.palette.mode === 'dark' ? theme.palette.dark[900] : '#fff',
        [theme.breakpoints.down('sm')]: {
            border: 0,
            boxShadow: 'none'
        }
    }
}));

// ==============================|| SEARCH INPUT ||============================== //

const SearchSection = ({ theme }: { theme?: string }) => {
    const classes = useStyles();
    const [value, setValue] = useState('');

    return (
        <>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <PopupState variant="popper" popupId="demo-popup-popper">
                    {(popupState) => (
                        <>
                            <Box
                                sx={{
                                    ml: 2
                                }}
                            >
                                <ButtonBase sx={{ borderRadius: '12px' }}>
                                    <Avatar variant="rounded" className={classes.headerAvatar} {...bindToggle(popupState)}>
                                        <IconSearch stroke={1.5} size="1.2rem" />
                                    </Avatar>
                                </ButtonBase>
                            </Box>
                            <Popper {...bindPopper(popupState)} transition className={classes.popperContainer}>
                                {({ TransitionProps }) => (
                                    <>
                                        <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                                            <Card className={classes.card}>
                                                <CardContent className={classes.cardContent}>
                                                    <Grid container alignItems="center" justifyContent="space-between">
                                                        <Grid item xs>
                                                            <OutlinedInput
                                                                className={classes.searchControl}
                                                                id="input-search-header"
                                                                value={value}
                                                                onChange={(e) => setValue(e.target.value)}
                                                                placeholder="Search"
                                                                startAdornment={
                                                                    <InputAdornment position="start">
                                                                        <IconSearch
                                                                            stroke={1.5}
                                                                            size="1rem"
                                                                            className={classes.startAdornment}
                                                                        />
                                                                    </InputAdornment>
                                                                }
                                                                endAdornment={
                                                                    <InputAdornment position="end">
                                                                        <ButtonBase sx={{ borderRadius: '12px' }}>
                                                                            <Avatar variant="rounded" className={classes.headerAvatar}>
                                                                                <IconAdjustmentsHorizontal stroke={1.5} size="1.3rem" />
                                                                            </Avatar>
                                                                        </ButtonBase>
                                                                        <Box
                                                                            sx={{
                                                                                ml: 2
                                                                            }}
                                                                        >
                                                                            <ButtonBase sx={{ borderRadius: '12px' }}>
                                                                                <Avatar
                                                                                    variant="rounded"
                                                                                    className={classes.closeAvatar}
                                                                                    {...bindToggle(popupState)}
                                                                                >
                                                                                    <IconX stroke={1.5} size="1.3rem" />
                                                                                </Avatar>
                                                                            </ButtonBase>
                                                                        </Box>
                                                                    </InputAdornment>
                                                                }
                                                                aria-describedby="search-helper-text"
                                                                inputProps={{
                                                                    'aria-label': 'weight'
                                                                }}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                            </Card>
                                        </Transitions>
                                    </>
                                )}
                            </Popper>
                        </>
                    )}
                </PopupState>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <OutlinedInput
                    className={classes.searchControl}
                    id="input-search-header"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Search"
                    startAdornment={
                        <InputAdornment position="start">
                            <IconSearch stroke={1.5} size="1rem" className={classes.startAdornment} />
                        </InputAdornment>
                    }
                    endAdornment={
                        <InputAdornment position="end">
                            <ButtonBase sx={{ borderRadius: '12px' }}>
                                <Avatar variant="rounded" className={classes.headerAvatar}>
                                    <IconAdjustmentsHorizontal stroke={1.5} size="1.3rem" />
                                </Avatar>
                            </ButtonBase>
                        </InputAdornment>
                    }
                    aria-describedby="search-helper-text"
                    inputProps={{
                        'aria-label': 'weight'
                    }}
                />
            </Box>
        </>
    );
};

export default SearchSection;
