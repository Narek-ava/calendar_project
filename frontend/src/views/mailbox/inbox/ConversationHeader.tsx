// material-ui
import { Grid, IconButton, Stack, Tooltip, Typography, useMediaQuery } from '@material-ui/core';
// assets
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
// project imports
import { ConversationHeaderProps } from './types';
import { Theme } from '@material-ui/core/styles';
import KeyboardArrowLeftTwoToneIcon from '@material-ui/icons/KeyboardArrowLeftTwoTone';
import CopyToClipboard from 'react-copy-to-clipboard';
import { SNACKBAR_OPEN } from '../../../store/actions';
import { useAppDispatch } from '../../../hooks/redux';
import Chip from '../../../ui-component/extended/Chip';
import ConversationControls from './ConversationControls';
import ConversationAssigner from './ConversationAssigner';
import SnoozeConversation from './snooze/SnoozeConversation';

const ConversationHeader = ({ conversation, subject, handleDrawerOpen, handleBackToList }: ConversationHeaderProps) => {
    const matchDownSM = useMediaQuery((themeSM: Theme) => themeSM.breakpoints.down('sm'));
    const dispatch = useAppDispatch();
    return (
        <Grid container direction="column" alignItems="flex-start" sx={{ mb: 3 }}>
            <Grid item sx={{ width: '100%', mb: 2 }}>
                <Stack spacing={1.5} direction="row" alignItems="center" justifyContent="space-between">
                    <Tooltip title="toggle folders" placement="bottom">
                        <IconButton onClick={handleDrawerOpen} size="small">
                            <MenuRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <CopyToClipboard
                        text={`${conversation.id}`}
                        onCopy={() =>
                            dispatch({
                                type: SNACKBAR_OPEN,
                                open: true,
                                message: 'Conversation ID Copied',
                                variant: 'alert',
                                alertSeverity: 'success',
                                anchorOrigin: { vertical: 'top', horizontal: 'center' }
                            })
                        }
                    >
                        <Chip label={`Conversation ID: ${conversation.id}`} variant="outlined" chipcolor="secondary" />
                    </CopyToClipboard>
                </Stack>
            </Grid>
            <Grid item sx={{ width: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={2} justifyContent="flex-end">
                    <ConversationAssigner conversation={conversation} handleBackToList={handleBackToList} />
                    <SnoozeConversation conversation={conversation} handleBackToList={handleBackToList} />
                    <ConversationControls target={conversation} handleBackToList={handleBackToList} />
                </Stack>
            </Grid>
            <Grid item>
                <Stack direction="row" alignItems="center">
                    <Grid item sx={{ mr: 2 }}>
                        <Tooltip title="back to list" placement="bottom">
                            <IconButton onClick={handleBackToList} size="small">
                                <KeyboardArrowLeftTwoToneIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                    <Grid item xs>
                        <Typography variant={matchDownSM ? 'h4' : 'h3'} sx={{ textAlign: 'justify' }}>
                            {subject}
                        </Typography>
                    </Grid>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default ConversationHeader;
