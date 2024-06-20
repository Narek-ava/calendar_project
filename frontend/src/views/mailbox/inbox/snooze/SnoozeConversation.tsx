import React, { useEffect, useRef, useState } from 'react';

// mui imports
import { IconButton, Stack, Tooltip } from '@material-ui/core';
import AlarmTwoTone from '@material-ui/icons/AlarmTwoTone';
import { Theme, useTheme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/styles';

// project imports
import SnoozeMain from './SnoozeMain';
import SnoozeByDateTimePick from './SnoozeByDateTimePick';
import conversationAPI from '../../../../services/ConversationService';
import { SNACKBAR_OPEN } from '../../../../store/actions';
import { useAppDispatch } from '../../../../hooks/redux';
import mailboxAPI from '../../../../services/MailboxService';
import { ISnoozeConversationProps } from '../types';
import { snoozePresets, statuses } from '../../../../store/constant';
import { ISnoozePayload } from '../../../../models/IConversation';
import moment from 'moment';

// style const
export const usePopperStyles = makeStyles((theme: Theme) => ({
    navContainer: {
        width: '100%',
        maxWidth: '350px',
        minWidth: '320px',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '10px',
        [theme.breakpoints.down('sm')]: {
            minWidth: '100%'
        }
    },
    profileChip: {
        transition: 'all .2s ease-in-out',
        '&[aria-controls="menu-list-grow"], &:hover': {
            // borderColor: theme.palette.primary.main,
            background: `${theme.palette.primary.light}!important`,
            color: theme.palette.primary.main,
            '& svg': {
                // stroke: theme.palette.primary.light
            }
        }
    },
    listItemButton: {
        paddingTop: 0.7,
        paddingBottom: 0.7
    },
    profileLabel: {
        lineHeight: 0,
        padding: '12px'
    },
    cardContent: {
        padding: '16px 0 !important'
    }
}));

const SnoozeConversation = ({ conversation, handleBackToList }: ISnoozeConversationProps) => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const classes = usePopperStyles();
    const anchorRef = useRef<any>(null);
    const [openMainPopper, setOpenMainPopper] = useState(false);
    const [openDateTimePopper, setOpenDateTimePopper] = useState(false);
    const [snoozeConversation, { isLoading }] = conversationAPI.useSnoozeConversationMutation();

    const isSnoozed = conversation.status === statuses.snoozed.name;
    const snoozedUntil = isSnoozed ? moment(conversation.snoozedAt).format('lll') : null;
    const initialDate = snoozedUntil || snoozePresets.find((preset) => preset.title === 'Tomorrow')?.date;

    const handleToggleMainPopper = () => {
        if (isSnoozed) {
            setOpenDateTimePopper((prevOpen) => !prevOpen);
            return;
        }

        if (openDateTimePopper) {
            setOpenDateTimePopper(false);
            return;
        }
        setOpenMainPopper((prevOpen) => !prevOpen);
    };

    const handleCloseMainPopper = (event: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpenMainPopper(false);
    };

    const handleCloseDateTimePopper = (event: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpenDateTimePopper(false);
    };

    const mainPrevOpen = useRef(openMainPopper);
    const dateTimePrevOpen = useRef(openDateTimePopper);

    useEffect(() => {
        if (mainPrevOpen.current && !openMainPopper) {
            anchorRef.current.focus();
        }

        mainPrevOpen.current = openMainPopper;
    }, [openMainPopper]);

    useEffect(() => {
        if (dateTimePrevOpen.current && !openDateTimePopper) {
            anchorRef.current.focus();
        }

        dateTimePrevOpen.current = openDateTimePopper;
    }, [openDateTimePopper]);

    const handleSnoozeConversation = (dateTime: ISnoozePayload['snoozed_at']) => {
        if (dateTime) {
            snoozeConversation({
                conversation,
                data: {
                    status: statuses.snoozed.status,
                    snoozed_at: dateTime
                }
            })
                .unwrap()
                .then(() => {
                    dispatch({
                        type: SNACKBAR_OPEN,
                        open: true,
                        message: 'Conversation successfully snoozed',
                        variant: 'alert',
                        alertSeverity: 'success',
                        anchorOrigin: { vertical: 'top', horizontal: 'center' }
                    });
                    setOpenMainPopper(false);
                    setOpenDateTimePopper(false);
                    dispatch(conversationAPI.util.invalidateTags(['Conversation']));
                    dispatch(mailboxAPI.util.invalidateTags(['Mailbox']));
                    handleBackToList();
                })
                .catch(() => {
                    dispatch({
                        type: SNACKBAR_OPEN,
                        open: true,
                        message: "Error: Conversation hasn't snoozed.",
                        variant: 'alert',
                        alertSeverity: 'error',
                        anchorOrigin: { vertical: 'top', horizontal: 'center' }
                    });
                });
        }
    };

    const unSnooze = () => {
        snoozeConversation({
            conversation,
            data: {
                status: statuses.active.status,
                snoozed_at: null
            }
        })
            .unwrap()
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Conversation Successfully Unsnoozed',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                setOpenDateTimePopper(false);
                dispatch(conversationAPI.util.invalidateTags(['Conversation']));
                dispatch(mailboxAPI.util.invalidateTags(['Mailbox']));
                handleBackToList();
            })
            .catch(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: "Error: Conversation hasn't Unsnoozed.",
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    return (
        <Stack alignContent="center" justifyContent="center">
            <Tooltip title={isSnoozed ? `Snoozed until ${snoozedUntil}` : 'Snooze'} placement="top">
                <IconButton
                    className={classes.profileChip}
                    aria-controls={openMainPopper ? 'menu-list-grow' : undefined}
                    aria-haspopup="true"
                    ref={anchorRef}
                    onClick={handleToggleMainPopper}
                >
                    <AlarmTwoTone fontSize="medium" sx={{ color: isSnoozed ? theme.palette.success.dark : undefined }} />
                </IconButton>
            </Tooltip>
            {openMainPopper && (
                <SnoozeMain
                    open={openMainPopper}
                    isLoading={isLoading}
                    anchorRef={anchorRef}
                    handleClose={handleCloseMainPopper}
                    snoozeConversation={handleSnoozeConversation}
                    setOpenDateTimePopper={setOpenDateTimePopper}
                />
            )}
            {openDateTimePopper && initialDate && (
                <SnoozeByDateTimePick
                    unSnooze={unSnooze}
                    isSnoozed={isSnoozed}
                    isLoading={isLoading}
                    initialDate={initialDate}
                    open={openDateTimePopper}
                    anchorRef={anchorRef}
                    handleClose={handleCloseDateTimePopper}
                    snoozeConversation={handleSnoozeConversation}
                />
            )}
        </Stack>
    );
};

export default SnoozeConversation;
