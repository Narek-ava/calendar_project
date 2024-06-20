import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@material-ui/core/styles';
import { Box, Button, CardContent, CircularProgress, Collapse, Grid, Stack, Typography, useMediaQuery } from '@material-ui/core';
import ReplyTwoToneIcon from '@material-ui/icons/ReplyTwoTone';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';

// assets
import { DefaultRootStateProps } from 'types';
import { ConversationDetailsProps } from './types';
import StringAvatar from './StringAvatar';
import conversationAPI from '../../../services/ConversationService';
import { IThread } from '../../../models/IConversation';
import ConversationHeader from './ConversationHeader';
import ThreadQuillForm from './ThreadQuillForm';
import { useAppDispatch } from '../../../hooks/redux';

// ==============================|| MAIL DETAILS ||============================== //

const Conversation = ({
    // handleStarredChange,
    // handleImportantChange
    handleDrawerOpen,
    idsToFetch,
    setIsConversationOpened
}: ConversationDetailsProps) => {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const customization = useSelector((state: DefaultRootStateProps) => state.customization);
    const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
    const { data, isLoading } = conversationAPI.useGetConversationQuery(idsToFetch, {
        refetchOnMountOrArgChange: true
    });
    const [threads, setThreads] = useState<IThread[]>([] as IThread[]);
    const [openQuill, setOpenQuill] = React.useState(false);
    const handleChangeQuill = () => {
        setOpenQuill(true);
    };

    const handleBackToList = () => {
        setIsConversationOpened(false);
        dispatch(conversationAPI.util.invalidateTags(['Conversation']));
    };

    useEffect(() => {
        if (data) {
            // eslint-disable-next-line no-underscore-dangle
            setThreads(data._embedded.threads);
        }
    }, [data]);

    return (
        <MainCard content={false}>
            <CardContent>
                {!isLoading && data && (
                    <>
                        <ConversationHeader
                            conversation={data}
                            handleDrawerOpen={handleDrawerOpen}
                            subject={data.subject}
                            handleBackToList={handleBackToList}
                        />
                        {threads.map((thread: IThread) => (
                            <Box
                                key={thread.id}
                                sx={{
                                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[50],
                                    mb: 3
                                }}
                            >
                                <CardContent>
                                    <Grid container spacing={gridSpacing}>
                                        <Grid item xs={12}>
                                            <Grid
                                                container
                                                alignItems="center"
                                                justifyContent="space-between"
                                                spacing={matchDownSM ? 1 : 0}
                                            >
                                                <Grid item>
                                                    <Stack direction="row" alignItems="center" spacing={matchDownSM ? 1 : 2}>
                                                        <StringAvatar name={thread.customer.email} />
                                                        <Grid container alignItems="center">
                                                            <Grid item xs={12}>
                                                                <Stack
                                                                    direction={matchDownSM ? 'column' : 'row'}
                                                                    alignItems={matchDownSM ? 'flex-start' : 'center'}
                                                                    spacing={matchDownSM ? 0 : 1}
                                                                >
                                                                    <Typography variant={matchDownSM ? 'h5' : 'h4'}>
                                                                        {data.customer.email === thread.customer.email
                                                                            ? 'From You'
                                                                            : thread.customer.email}
                                                                    </Typography>
                                                                    <Typography
                                                                        sx={{ display: { xs: 'block', sm: 'none' } }}
                                                                        variant="subtitle2"
                                                                    >
                                                                        To: &lt;{data?.customer.email}&gt;
                                                                    </Typography>
                                                                </Stack>
                                                            </Grid>
                                                            <Grid item sx={{ display: { xs: 'none', sm: 'block' } }}>
                                                                <Typography variant="subtitle2">
                                                                    To: &lt;{thread.customer.email}&gt;
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </Stack>
                                                </Grid>
                                                <Grid item>
                                                    <Typography variant="subtitle2">
                                                        {format(new Date(thread.createdAt), 'd MMM yy HH:mm')}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                                <PerfectScrollbar>
                                    <CardContent sx={{ pt: 0 }}>
                                        <Grid container spacing={gridSpacing}>
                                            <Grid item xs={12}>
                                                <Grid container spacing={gridSpacing}>
                                                    <Grid item xs={12}>
                                                        <Grid container alignItems="center" spacing={0} justifyContent="space-between">
                                                            <Grid item>
                                                                <ReactQuill readOnly theme="bubble" value={thread.body} />
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </PerfectScrollbar>
                            </Box>
                        ))}
                    </>
                )}
                {isLoading && (
                    <Box sx={{ mx: 'auto', mt: 1, width: 200 }}>
                        <CircularProgress />
                    </Box>
                )}
                <Grid item xs={12}>
                    <Grid item>
                        <Button variant="outlined" startIcon={<ReplyTwoToneIcon />} onClick={handleChangeQuill}>
                            Reply
                        </Button>
                    </Grid>
                </Grid>
                <Collapse in={openQuill} sx={{ width: '100%' }}>
                    <Grid item xs={12} sx={{ p: 3 }}>
                        <SubCard
                            sx={{
                                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.dark : theme.palette.primary[200] + 40,
                                '& .quill': {
                                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[50],
                                    borderRadius: '12px',
                                    '& .ql-toolbar': {
                                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.light : theme.palette.grey[100],
                                        borderColor:
                                            theme.palette.mode === 'dark' ? theme.palette.dark.light + 20 : theme.palette.primary.light,
                                        borderTopLeftRadius: '12px',
                                        borderTopRightRadius: '12px'
                                    },
                                    '& .ql-container': {
                                        fontFamily: customization.fontFamily,
                                        fontSize: '0.875rem',
                                        borderColor:
                                            theme.palette.mode === 'dark'
                                                ? `${theme.palette.dark.light + 20} !important`
                                                : theme.palette.primary.light,
                                        borderBottomLeftRadius: '12px',
                                        borderBottomRightRadius: '12px',
                                        '& .ql-editor': {
                                            minHeight: '125px'
                                        }
                                    }
                                }
                            }}
                        >
                            {data && <ThreadQuillForm onClose={() => setOpenQuill(false)} conversation={data} />}
                        </SubCard>
                    </Grid>
                </Collapse>
            </CardContent>
        </MainCard>
    );
};

export default Conversation;
