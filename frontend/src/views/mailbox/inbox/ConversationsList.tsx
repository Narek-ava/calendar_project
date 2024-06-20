import React, { useEffect, useState } from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { useTheme, Theme } from '@material-ui/core/styles';
import {
    Box,
    ButtonBase,
    Checkbox,
    CircularProgress,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery
} from '@material-ui/core';
import StarBorderTwoToneIcon from '@material-ui/icons/StarBorderTwoTone';
import StarTwoToneIcon from '@material-ui/icons/StarTwoTone';
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';

// third-party
import clsx from 'clsx';

// project imports
import InboxEmpty from './InboxEmpty';
import MainCard from 'ui-component/cards/MainCard';

// assets
import { ConversationsListProps, IInboxFolder, InboxHeaderProps } from './types';
import StringAvatar from './StringAvatar';
import InboxHeader from './InboxHeader';
import { IConversation } from '../../../models/IConversation';
import conversationAPI from '../../../services/ConversationService';
import Conversation from './Conversation';
import ConversationControls from './ConversationControls';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { clearSelectedConversations, setSelectedConversations } from '../../../store/slices/selectConversationsSlice';

const useToolbarStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: 0,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1)
    },
    highlight: {
        color: theme.palette.secondary.main
    },
    title: {
        flex: '1 1 100%',
        fontSize: '14px'
    }
}));

// ==============================|| TABLE HEADER ||============================== //
interface ITableHead {
    toggleSelected: () => void;
    allSelected: boolean;
}

const EnhancedTableHead = ({ toggleSelected, allSelected }: ITableHead) => (
    <TableHead>
        <TableRow sx={{ '& th': { whiteSpace: 'nowrap', p: '6px 8px', cursor: 'default' } }}>
            <TableCell>
                <Checkbox
                    checked={allSelected}
                    color="primary"
                    onChange={() => toggleSelected()}
                    inputProps={{
                        'aria-labelledby': 'checkAll'
                    }}
                />
            </TableCell>
            <TableCell id="customer-field" sx={{ cursor: 'pointer' }}>
                <Typography align="left" component="div" sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    Customer
                </Typography>
            </TableCell>
            <TableCell sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                <Typography
                    sx={{
                        whiteSpace: 'nowrap',
                        display: 'block',
                        fontWeight: 'bold'
                    }}
                >
                    Subject
                </Typography>
            </TableCell>
            <TableCell align="center">
                <Typography
                    sx={{
                        whiteSpace: 'nowrap',
                        display: 'block',
                        fontWeight: 'bold'
                    }}
                >
                    Last update
                </Typography>
            </TableCell>
        </TableRow>
    </TableHead>
);

// ==============================|| TABLE HEADER TOOLBAR ||============================== //

interface ITableToolbar {
    selected: IConversation[];
    folder: IInboxFolder;
}

const TableToolbar = ({ selected, folder }: ITableToolbar) => {
    const classes = useToolbarStyles();
    return (
        <TableRow>
            <TableCell padding="none" colSpan={5}>
                <Toolbar
                    variant="dense"
                    className={clsx(classes.root, {
                        [classes.highlight]: selected.length > 0
                    })}
                >
                    {selected.length > 0 && (
                        <Stack spacing={6} direction="row" alignItems="center">
                            <Typography className={classes.title} color="inherit" variant="h4" component="div">
                                {selected.length} selected
                            </Typography>
                            <ConversationControls target={selected} folder={folder} />
                        </Stack>
                    )}
                </Toolbar>
            </TableCell>
        </TableRow>
    );
};

const ConversationsList = ({
    openConversationFromSearch,
    mailbox,
    folder,
    setIsConversationOpened,
    setActiveConversationIds,
    handleDrawerOpen,
    isConversationOpened,
    activeConversationIds
}: ConversationsListProps) => {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
    const { selected } = useAppSelector((state) => state.selectConversation);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [page, setPage] = useState<number>(0);
    const [perPage] = useState<number>(50);
    const initialFolderId = mailbox.folders.find((folderElem) => folderElem.type === 1)?.id;
    const { data, isLoading } = conversationAPI.useFetchAllConversationsQuery(
        {
            id: mailbox.id,
            folderId: folder ? folder.id : initialFolderId,
            page
        },
        {
            refetchOnMountOrArgChange: true
        }
    );
    // eslint-disable-next-line no-underscore-dangle
    const conversations = data?._embedded.conversations;

    const handleGetConversation = (conversation: IConversation) => {
        if (conversation.id) {
            setActiveConversationIds({
                mailboxId: mailbox.id,
                conversationId: conversation.id
            });
            dispatch(conversationAPI.util.invalidateTags(['Conversation']));
            setIsConversationOpened(true);
            dispatch(clearSelectedConversations());
        }
    };

    const handleClick = (event: React.ChangeEvent<HTMLInputElement>, conversation: IConversation) => {
        const selectedIndex = selected.indexOf(conversation);
        let newSelected: IConversation[] = [] as IConversation[];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, conversation);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }

        dispatch(setSelectedConversations(newSelected));
    };

    const handleChangePage: InboxHeaderProps['handleChangePage'] = (event, newPage) => {
        setPage(newPage);
    };

    const handleToggleSelected = () => {
        if (isAllSelected) {
            dispatch(clearSelectedConversations());
            return;
        }
        if (conversations) {
            dispatch(setSelectedConversations(conversations));
        }
    };

    useEffect(() => {
        if (conversations && selected.length === conversations.length) {
            setIsAllSelected(true);
            return;
        }
        setIsAllSelected(false);
    }, [selected]);

    const isSelected = (row: IConversation) => selected.indexOf(row) !== -1;
    const emptyRows = conversations && page > 0 ? Math.max(0, (1 + page) * perPage - conversations.length) : 0;
    if (isConversationOpened) {
        return (
            <>
                {conversations && (
                    <Conversation
                        setIsConversationOpened={setIsConversationOpened}
                        idsToFetch={activeConversationIds}
                        handleDrawerOpen={handleDrawerOpen}
                    />
                )}
            </>
        );
    }
    return (
        <>
            {!isLoading && data && conversations && (
                <Grid container spacing={matchDownSM ? 3 : 1}>
                    <Grid item xs={12}>
                        <InboxHeader
                            openConversationFromSearch={openConversationFromSearch}
                            mailbox={mailbox}
                            length={data.page.totalElements}
                            rowsPerPage={perPage}
                            page={page}
                            handleChangePage={handleChangePage}
                            handleDrawerOpen={handleDrawerOpen}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        {conversations.length > 0 ? (
                            <MainCard content={false} sx={{ bgcolor: theme.palette.mode === 'dark' ? 'dark.800' : 'grey.50' }}>
                                {/* table */}
                                <TableContainer>
                                    <Table
                                        size="small"
                                        aria-labelledby="tableTitle"
                                        sx={{ minWidth: 320, '& td': { whiteSpace: 'nowrap', p: '6px 8px' } }}
                                    >
                                        <EnhancedTableHead allSelected={isAllSelected} toggleSelected={handleToggleSelected} />
                                        <TableBody>
                                            {selected.length > 0 && folder && <TableToolbar selected={selected} folder={folder} />}
                                            {conversations.slice(page * perPage, page * perPage + perPage).map((row, index) => {
                                                const isRead = row.readByUser;
                                                const isItemSelected = isSelected(row);
                                                const labelId = `enhanced-table-checkbox-${index}`;
                                                return (
                                                    <TableRow
                                                        aria-checked={isItemSelected}
                                                        tabIndex={-1}
                                                        key={index}
                                                        selected={isItemSelected}
                                                        hover
                                                        sx={{
                                                            backgroundColor: isRead ? undefined : theme.palette.primary.light,
                                                            // styles for the menu onHover
                                                            '& td:last-child>div': {
                                                                position: 'absolute',
                                                                top: '50%',
                                                                right: '5px',
                                                                transform: 'translateY(-50%)',
                                                                display: 'none',
                                                                background:
                                                                    theme.palette.mode === 'dark' ? theme.palette.dark[800] : '#fff',
                                                                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                                                                borderRadius: '12px',
                                                                padding: '4px 14px',
                                                                '& button + button': {
                                                                    marginLeft: '5px'
                                                                }
                                                            },
                                                            '&:hover': {
                                                                '& td:last-child>div': {
                                                                    display: 'block'
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={isItemSelected}
                                                                color="primary"
                                                                onChange={(event) => handleClick(event, row)}
                                                                inputProps={{
                                                                    'aria-labelledby': labelId
                                                                }}
                                                            />
                                                            <Checkbox
                                                                icon={<StarBorderTwoToneIcon />}
                                                                checkedIcon={<StarTwoToneIcon />}
                                                                sx={{ '&.Mui-checked': { color: theme.palette.warning.dark } }}
                                                                checked={false}
                                                                onChange={() => {}}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell
                                                            id={labelId}
                                                            sx={{ cursor: 'pointer' }}
                                                            onClick={() => handleGetConversation(row)}
                                                        >
                                                            <Grid container spacing={2} alignItems="center" sx={{ flexWrap: 'nowrap' }}>
                                                                <Grid item sx={{ minWidth: '26px' }}>
                                                                    {!isRead && (
                                                                        <Tooltip title="new" placement="bottom">
                                                                            <FiberManualRecord
                                                                                sx={{
                                                                                    fontSize: '10px',
                                                                                    color: theme.palette.secondary.main
                                                                                }}
                                                                            />
                                                                        </Tooltip>
                                                                    )}
                                                                </Grid>
                                                                <Grid item>
                                                                    <StringAvatar name={row.customer.email} />
                                                                </Grid>
                                                                <Grid item xs zeroMinWidth sx={{ pr: 5 }}>
                                                                    <ButtonBase disableRipple>
                                                                        <Typography
                                                                            align="left"
                                                                            component="div"
                                                                            sx={{
                                                                                fontWeight: !isRead ? 'bold' : 'regular'
                                                                            }}
                                                                        >
                                                                            {row.customer.email}
                                                                        </Typography>
                                                                    </ButtonBase>
                                                                </Grid>
                                                            </Grid>
                                                        </TableCell>
                                                        <TableCell sx={{ cursor: 'pointer' }} onClick={() => handleGetConversation(row)}>
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    display: 'flex',
                                                                    width: {
                                                                        xs: '220px',
                                                                        md: '350px',
                                                                        lg: '500px',
                                                                        xl: '600px'
                                                                    }
                                                                }}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                        display: 'block',
                                                                        fontWeight: !isRead ? 'bold' : 'regular'
                                                                    }}
                                                                >
                                                                    {`${row.subject} - ${row.preview}`}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell
                                                            align="center"
                                                            sx={{
                                                                position: 'relative',
                                                                fontWeight: !isRead ? 'bold' : 'regular'
                                                            }}
                                                        >
                                                            {row.customerWaitingSince.friendly}
                                                            <div>
                                                                <ConversationControls target={row} />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {emptyRows > 0 && (
                                                <TableRow
                                                    style={{
                                                        height: 53 * emptyRows
                                                    }}
                                                >
                                                    <TableCell colSpan={6} />
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </MainCard>
                        ) : (
                            <InboxEmpty />
                        )}
                    </Grid>
                    <Grid item xs={12} sx={{ pt: '0 !important', display: { xs: 'block', sm: 'none' } }}>
                        {/* table pagination */}
                        <TablePagination
                            rowsPerPageOptions={[]}
                            component="div"
                            count={data.page.totalElements}
                            rowsPerPage={perPage}
                            page={page}
                            onPageChange={handleChangePage}
                        />
                    </Grid>
                </Grid>
            )}
            {isLoading && (
                <Box sx={{ mx: 'auto', mt: 1, width: 200 }}>
                    <CircularProgress />
                </Box>
            )}
        </>
    );
};

export default ConversationsList;
