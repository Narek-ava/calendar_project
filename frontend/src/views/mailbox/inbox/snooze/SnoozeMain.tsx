import React from 'react';
import Transitions from '../../../../ui-component/extended/Transitions';
import {
    CardContent,
    CircularProgress,
    ClickAwayListener,
    Divider,
    Grid,
    List,
    ListItemButton,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    Popper,
    Typography
} from '@material-ui/core';
import AlarmTwoTone from '@material-ui/icons/AlarmTwoTone';
import ChevronRight from '@material-ui/icons/ChevronRight';
import { useTheme } from '@material-ui/core/styles';

import MainCard from '../../../../ui-component/cards/MainCard';
import { usePopperStyles } from './SnoozeConversation';
import { ISnoozePayload } from '../../../../models/IConversation';
import { snoozePresets } from '../../../../store/constant';

interface ISnoozeMain {
    open: boolean;
    anchorRef: any;
    handleClose: (event: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => void;
    snoozeConversation: (date: ISnoozePayload['snoozed_at']) => void;
    setOpenDateTimePopper: (arg: boolean) => void;
    isLoading: boolean;
}

const SnoozeMain = ({ open, anchorRef, handleClose, snoozeConversation, setOpenDateTimePopper, isLoading }: ISnoozeMain) => {
    const classes = usePopperStyles();
    const theme = useTheme();
    const openDateTimePopper = (e: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
        handleClose(e);
        setOpenDateTimePopper(true);
    };

    return (
        <Popper
            placement="bottom-end"
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
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
                                    <Grid
                                        container
                                        spacing={2}
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{ p: '0 16px 10px' }}
                                    >
                                        {isLoading && (
                                            <Grid item>
                                                <CircularProgress />
                                            </Grid>
                                        )}
                                        <Grid item>
                                            <AlarmTwoTone fontSize="medium" />
                                        </Grid>
                                        <Grid item zeroMinWidth>
                                            <Typography component="span" align="left" variant="subtitle1">
                                                Snooze
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Divider />
                                    <List component="nav" className={classes.navContainer}>
                                        {snoozePresets.map((preset) => (
                                            <ListItemButton
                                                key={preset.id}
                                                className={classes.listItemButton}
                                                onClick={() => snoozeConversation(preset.date)}
                                            >
                                                <ListItemText primary={<Typography variant="subtitle1">{preset.title}</Typography>} />
                                                <ListItemSecondaryAction>
                                                    <Typography variant="subtitle2" align="right">
                                                        {preset.dateTitle}
                                                    </Typography>
                                                </ListItemSecondaryAction>
                                            </ListItemButton>
                                        ))}
                                    </List>
                                    <Divider />
                                    <ListItemButton className={classes.listItemButton} onClick={(e) => openDateTimePopper(e)}>
                                        <ListItemText primary={<Typography variant="subtitle1">Day & Time</Typography>} />
                                        <ListItemSecondaryAction>
                                            <ChevronRight fontSize="medium" />
                                        </ListItemSecondaryAction>
                                    </ListItemButton>
                                </CardContent>
                            </MainCard>
                        </ClickAwayListener>
                    </Paper>
                </Transitions>
            )}
        </Popper>
    );
};

export default SnoozeMain;
