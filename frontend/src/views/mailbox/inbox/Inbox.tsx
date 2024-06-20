import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';

// material-ui
import { useTheme } from '@material-ui/core/styles';
import { Box, Button, CircularProgress, Grid, useMediaQuery } from '@material-ui/core';

// project imports
import InboxDrawer from './InboxDrawer';
import ConversationsList from './ConversationsList';
import { SET_MENU } from 'store/actions';
import { gridSpacing } from 'store/constant';
import mailboxAPI from '../../../services/MailboxService';
import { IConversation, IUrlIds } from '../../../models/IConversation';
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';
import MainCard from '../../../ui-component/cards/MainCard';
import { useLocation, useNavigate } from 'react-router-dom';
import { FC, useEffect, useState } from 'react';
import Main from '../MailboxDrawerElement';
import { IInboxFolder } from './types';
import SearchConversation from './SearchConversation';

const Inbox: FC = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('lg'));
    // @ts-ignore
    const mailbox = mailboxAPI.useGetMailboxQuery(id, {
        refetchOnMountOrArgChange: true
    });
    const [isConversationOpened, setIsConversationOpened] = useState(false);
    const [activeConversationIds, setActiveConversationIds] = useState<IUrlIds>({
        conversationId: 1,
        mailboxId: 1
    });

    const [folder, setFolder] = useState<IInboxFolder | undefined>();

    const handleFilter = (folderArg: IInboxFolder) => {
        if (mailbox.data) {
            setIsConversationOpened(false);
            setFolder(folderArg);
        }
    };

    useEffect(() => {
        if (matchDownSM) {
            setOpenMailSidebar(false);
        } else {
            setOpenMailSidebar(true);
        }
    }, [matchDownSM]);

    useEffect(() => {
        // hide left drawer when email app opens
        dispatch({ type: SET_MENU, opened: false });
        // eslint-disable-next-line no-underscore-dangle
    }, [dispatch]);

    const handleSwitchMailbox = (newId: number) => {
        const basePath = location.pathname.replace(/\/([0-9]+)(?=[^/]*$)/, '');
        navigate(`${basePath}/${newId}`, { replace: true });
        setIsConversationOpened(false);
        setFolder(undefined);
    };

    const [openMailSidebar, setOpenMailSidebar] = useState(true);
    const handleDrawerOpen = () => {
        setOpenMailSidebar((prevState) => !prevState);
    };

    const openConversationFromSearch = (option: IConversation) => {
        if (mailbox.data) {
            setActiveConversationIds({
                mailboxId: mailbox.data.id,
                conversationId: option.number
            });
            setIsConversationOpened(true);
            const targetFolder = mailbox.data.folders.find((folderElem) => folderElem.id === option.folderId);
            if (targetFolder) {
                setFolder(targetFolder);
            }
        }
    };

    return (
        <MainCard
            title="Inbox"
            secondary={
                <Button size="small" disableElevation onClick={() => navigate('/mailbox')}>
                    <ChevronLeftOutlinedIcon />
                    To mailboxes
                </Button>
            }
        >
            <Box sx={{ display: 'flex' }}>
                {!mailbox.isLoading && mailbox.data && (
                    <>
                        <InboxDrawer
                            mailbox={mailbox.data}
                            switchMailbox={handleSwitchMailbox}
                            openMailSidebar={openMailSidebar}
                            handleDrawerOpen={handleDrawerOpen}
                            folder={folder}
                            handleFilter={handleFilter}
                        />
                        <Main theme={theme} open={openMailSidebar}>
                            <Grid container spacing={gridSpacing}>
                                <Grid item xs={12}>
                                    <SearchConversation openConversationFromSearch={openConversationFromSearch} mailbox={mailbox.data} />
                                </Grid>
                                <Grid item xs={12}>
                                    <ConversationsList
                                        openConversationFromSearch={openConversationFromSearch}
                                        mailbox={mailbox.data}
                                        folder={folder}
                                        activeConversationIds={activeConversationIds}
                                        isConversationOpened={isConversationOpened}
                                        setIsConversationOpened={setIsConversationOpened}
                                        setActiveConversationIds={setActiveConversationIds}
                                        handleDrawerOpen={handleDrawerOpen}
                                    />
                                </Grid>
                            </Grid>
                        </Main>
                    </>
                )}
                {mailbox.isLoading && (
                    <Box sx={{ mx: 'auto', mt: 1, width: 200 }}>
                        <CircularProgress />
                    </Box>
                )}
            </Box>
        </MainCard>
    );
};

export default Inbox;
