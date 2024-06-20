import { IconButton, Stack, Tooltip } from '@material-ui/core';
import NewReleasesTwoToneIcon from '@material-ui/icons/NewReleasesTwoTone';
import MarkEmailReadTwoTone from '@material-ui/icons/MarkEmailReadTwoTone';
import MarkEmailUnreadTwoTone from '@material-ui/icons/MarkEmailUnreadTwoTone';
import DeleteTwoToneIcon from '@material-ui/icons/DeleteTwoTone';
import { IConversation } from '../../../models/IConversation';
import { closeConfirmPopup, openConfirmPopup } from '../../../store/confirmPopupSlice';
import { useAppDispatch } from '../../../hooks/redux';
import { SNACKBAR_OPEN } from '../../../store/actions';
import conversationAPI from '../../../services/ConversationService';
import { clearSelectedConversations } from '../../../store/slices/selectConversationsSlice';
import { IConversationsControlsProps } from './types';
import mailboxAPI from '../../../services/MailboxService';
import { inboxFolderTypes, statuses } from '../../../store/constant';

interface IHandleSelectedConversations {
    actionType: string;
    selected: IConversation[];
}

const ConversationControls = ({ target, handleBackToList, folder }: IConversationsControlsProps) => {
    const dispatch = useAppDispatch();
    const [deleteConversation] = conversationAPI.useDeleteConversationMutation();
    const [unreadConversation] = conversationAPI.useUnreadConversationMutation();
    const [moveToSpam] = conversationAPI.useMoveToSpamMutation();
    const [makeConversationActive] = conversationAPI.useMakeConversationActiveMutation();
    const [closeConversation] = conversationAPI.useCloseConversationMutation();
    const isInSpam = (!Array.isArray(target) && target.status === statuses.spam.name) || (folder && folder.type === inboxFolderTypes.spam);
    const isClosed =
        (!Array.isArray(target) && target.status === statuses.closed.name) || (folder && folder.type === inboxFolderTypes.closed);
    const handleCloseConfirm = () => {
        dispatch(closeConfirmPopup());
    };

    const handleCloseConversation = (conversation: IConversation) => {
        closeConversation(conversation)
            .unwrap()
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Conversation closed',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                dispatch(mailboxAPI.util.invalidateTags(['Mailbox']));
            })
            .catch(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: "Error: Conversation hasn't closed",
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    const handleOpenConversation = (conversation: IConversation) => {
        makeConversationActive(conversation)
            .unwrap()
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Conversation opened',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                dispatch(mailboxAPI.util.invalidateTags(['Mailbox']));
            })
            .catch(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: "Error: Conversation hasn't opened",
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    const handleRemoveFromSpam = (conversation: IConversation) => {
        makeConversationActive(conversation)
            .unwrap()
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Conversation removed from spam',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                dispatch(mailboxAPI.util.invalidateTags(['Mailbox']));
            })
            .catch(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: "Error: Conversation hasn't removed from spam",
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    const handleMarkAsSpam = (conversation: IConversation) => {
        moveToSpam(conversation)
            .unwrap()
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Conversation moved to spam',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                dispatch(mailboxAPI.util.invalidateTags(['Mailbox']));
            })
            .catch(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: "Error: Conversation hasn't moved to spam",
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    const handleDeleteConversation = (conversation: IConversation) => {
        deleteConversation(conversation)
            .unwrap()
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Conversation deleted',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                dispatch(mailboxAPI.util.invalidateTags(['Mailbox']));
            })
            .catch(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: "Error: Conversation hasn't deleted",
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    const handleUnreadConversation = (conversation: IConversation) => {
        if (handleBackToList !== undefined) {
            handleBackToList();
        }
        unreadConversation(conversation)
            .unwrap()
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Conversation marked as unread',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                dispatch(clearSelectedConversations());
            })
            .catch(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: "Error: Conversation hasn't marked as unread",
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    const handleSelectedConversations = ({ actionType, selected }: IHandleSelectedConversations) => {
        // TODO add bulk methods
        let handleFunction: (arg: IConversation) => void;
        switch (actionType) {
            case 'delete':
                handleFunction = handleDeleteConversation;
                break;
            case 'close':
                handleFunction = handleCloseConversation;
                break;
            case 'open':
                handleFunction = handleOpenConversation;
                break;
            case 'to spam':
                handleFunction = handleMarkAsSpam;
                break;
            case 'from spam':
                handleFunction = handleRemoveFromSpam;
                break;
            case 'unread':
                handleFunction = handleUnreadConversation;
        }
        selected.forEach((conversation) => {
            handleFunction(conversation);
        });
        dispatch(clearSelectedConversations());
    };

    const onClose = (arg: IConversationsControlsProps['target']) => {
        let text: string;
        let closeFunc;
        if (Array.isArray(arg)) {
            text = arg.length > 1 ? 'Close selected Conversations?' : 'Close selected Conversation?';
            closeFunc = () =>
                handleSelectedConversations({
                    actionType: 'close',
                    selected: arg
                });
        } else {
            text = 'Close this Conversation?';
            closeFunc = () => handleCloseConversation(arg);
        }
        dispatch(
            openConfirmPopup({
                onConfirm: closeFunc,
                onClose: handleCloseConfirm,
                confirmText: `Close`,
                text
            })
        );
    };

    const onOpen = (arg: IConversationsControlsProps['target']) => {
        let text: string;
        let openFunc;
        if (Array.isArray(arg)) {
            text = arg.length > 1 ? 'Open selected Conversations?' : 'Open selected Conversation?';
            openFunc = () =>
                handleSelectedConversations({
                    actionType: 'open',
                    selected: arg
                });
        } else {
            text = 'Open this Conversation?';
            openFunc = () => handleOpenConversation(arg);
        }
        dispatch(
            openConfirmPopup({
                onConfirm: openFunc,
                onClose: handleCloseConfirm,
                confirmText: `Open`,
                text
            })
        );
    };

    const onDelete = (arg: IConversationsControlsProps['target']) => {
        let text: string;
        let deleteFunc;
        if (Array.isArray(arg)) {
            text = arg.length > 1 ? 'Delete selected Conversations?' : 'Delete selected Conversation?';
            deleteFunc = () =>
                handleSelectedConversations({
                    actionType: 'delete',
                    selected: arg
                });
        } else {
            text = 'Delete this Conversation?';
            deleteFunc = () => handleDeleteConversation(arg);
        }
        dispatch(
            openConfirmPopup({
                onConfirm: deleteFunc,
                onClose: handleCloseConfirm,
                confirmText: 'Delete',
                text
            })
        );
    };

    const onRemoveFromSpam = (arg: IConversationsControlsProps['target']) => {
        let text: string;
        let func;
        if (Array.isArray(arg)) {
            text = arg.length > 1 ? 'Remove selected Conversations from Spam?' : 'Remove selected Conversation from Spam?';
            func = () =>
                handleSelectedConversations({
                    actionType: 'from spam',
                    selected: arg
                });
        } else {
            text = 'Are you sure to remove this Conversation from Spam?';
            func = () => handleRemoveFromSpam(arg);
        }
        dispatch(
            openConfirmPopup({
                onConfirm: func,
                onClose: handleCloseConfirm,
                confirmText: 'Remove',
                text
            })
        );
    };

    const onSpam = (arg: IConversationsControlsProps['target']) => {
        let text: string;
        let spamFunc;
        if (Array.isArray(arg)) {
            text = arg.length > 1 ? 'Move selected Conversations to Spam?' : 'Move selected Conversation to Spam?';
            spamFunc = () =>
                handleSelectedConversations({
                    actionType: 'to spam',
                    selected: arg
                });
        } else {
            text = 'Move this Conversation to Spam?';
            spamFunc = () => handleMarkAsSpam(arg);
        }
        dispatch(
            openConfirmPopup({
                onConfirm: spamFunc,
                onClose: handleCloseConfirm,
                confirmText: 'to Spam',
                text
            })
        );
    };
    const onUnread = (arg: IConversationsControlsProps['target']) => {
        let text: string;
        let unreadFunc;
        if (Array.isArray(arg)) {
            text = arg.length > 1 ? 'Mark selected Conversations as Unread?' : 'Mark selected Conversation as Unread?';
            unreadFunc = () =>
                handleSelectedConversations({
                    actionType: 'unread',
                    selected: arg
                });
        } else {
            text = 'Mark this Conversation as Unread?';
            unreadFunc = () => handleUnreadConversation(arg);
        }
        dispatch(
            openConfirmPopup({
                onConfirm: unreadFunc,
                onClose: handleCloseConfirm,
                confirmText: 'Unread',
                text
            })
        );
    };
    return (
        <Stack direction="row" justifyContent="flex-end" alignContent="center" spacing={2}>
            <Tooltip title="Mark as unread" placement="top">
                <IconButton onClick={() => onUnread(target)}>
                    <MarkEmailUnreadTwoTone fontSize="medium" />
                </IconButton>
            </Tooltip>
            <Tooltip title={isInSpam ? 'Remove from spam' : 'Move to spam'} placement="top">
                <IconButton onClick={isInSpam ? () => onRemoveFromSpam(target) : () => onSpam(target)}>
                    <NewReleasesTwoToneIcon fontSize="medium" color={isInSpam ? 'error' : undefined} />
                </IconButton>
            </Tooltip>
            <Tooltip title={isClosed ? 'Open conversation' : 'Close conversation'} placement="top">
                <IconButton onClick={isClosed ? () => onOpen(target) : () => onClose(target)}>
                    <MarkEmailReadTwoTone fontSize="medium" color={isClosed ? 'error' : undefined} />
                </IconButton>
            </Tooltip>
            <Tooltip title="delete" placement="top">
                <IconButton onClick={() => onDelete(target)}>
                    <DeleteTwoToneIcon fontSize="medium" />
                </IconButton>
            </Tooltip>
        </Stack>
    );
};

export default ConversationControls;
