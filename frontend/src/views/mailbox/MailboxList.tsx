import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    CardContent,
    CircularProgress,
    Fab,
    Grid,
    IconButton,
    InputAdornment,
    Modal,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@material-ui/core';
import MainCard from 'ui-component/cards/MainCard';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import { throttle, filter, includes } from 'lodash';
import { gridSpacing } from '../../store/constant';
import MailboxCard from './MailboxCard';
import CloseIcon from '@material-ui/icons/Close';
import modalStyle from 'themes/modalStyle';
import MailboxCreateDialog, { IMailboxCreateForm } from './MailboxCreateDialog';
import { SNACKBAR_OPEN } from '../../store/actions';
import { useAppDispatch } from '../../hooks/redux';
import { useNavigate } from 'react-router-dom';
import { IMailbox } from '../../models/IMailbox';
import mailboxAPI from '../../services/MailboxService';
import { axiosServices } from '../../utils/axios';

const MailboxList: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [search, setSearch] = useState<string>('');
    //  deletion modal state
    const [open, setOpen] = useState(false);
    //  create dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCard, setSelectedCard] = useState<IMailbox | null>();
    const [filtered, setFiltered] = useState<IMailbox[] | undefined>(undefined);
    const { data, isLoading } = mailboxAPI.useFetchAllMailboxesQuery(null, {
        refetchOnMountOrArgChange: true
    });

    const [deleteMailbox] = mailboxAPI.useDeleteMailboxMutation();

    const throttled = useRef(
        throttle((newValue) => {
            setSearch(newValue);
        }, 1000)
    );

    //  deletion modal state handlers
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    //  create dialog state handlers
    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    const checkEmail = async (formData: IMailboxCreateForm) => {
        try {
            const res = await axiosServices.post('/mailboxes', formData);
            if (res.data) {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Mailbox created',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                // @ts-ignore
                navigate(`/mailbox/create/${formData.email}/${res.data.id}`, { replace: true });
            }
        } catch (error) {
            if (error.message.includes('The email has already been taken')) {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'This email has already been taken',
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            } else {
                navigate(`/mailbox/create/${formData.email}`, { replace: true });
            }
        }
    };

    useEffect(() => {
        if (data) {
            const searched = filter(
                data.data,
                (mailbox) => includes(mailbox.email.toLowerCase(), search) || includes(mailbox.name.toLowerCase(), search)
            );
            setFiltered(searched);
        }
    }, [data, search]);

    const handleSearch = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | undefined) => {
        const newString = event?.target.value;
        throttled.current(newString?.toLowerCase());
    };

    const handleDelete = (mailbox: IMailbox) => {
        handleOpen();
        setSelectedCard(mailbox);
    };

    const removeMailbox = () => {
        if (selectedCard) {
            deleteMailbox(selectedCard)
                .unwrap()
                .then(() => {
                    handleClose();
                    dispatch({
                        type: SNACKBAR_OPEN,
                        open: true,
                        message: 'Mailbox deleted',
                        variant: 'alert',
                        alertSeverity: 'success',
                        anchorOrigin: { vertical: 'top', horizontal: 'center' }
                    });
                })
                .catch(() => {
                    handleClose();
                    dispatch({
                        type: SNACKBAR_OPEN,
                        open: true,
                        message: "Error: Mailbox hasn't deleted",
                        variant: 'alert',
                        alertSeverity: 'error',
                        anchorOrigin: { vertical: 'top', horizontal: 'center' }
                    });
                });
        }
    };

    return (
        <>
            <MainCard title="Mailboxes" content={false}>
                <CardContent>
                    <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                        <Grid item xs={12} sm={6} sx={{ flexBasis: '80%' }}>
                            <TextField
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    )
                                }}
                                onChange={handleSearch}
                                placeholder="Search by name or email"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ textAlign: 'right', pl: 0, flexBasis: 0 }}>
                            <Tooltip title="Add mailbox">
                                <Fab
                                    onClick={handleOpenDialog}
                                    color="secondary"
                                    sx={{ boxShadow: 'none', ml: 1, width: '32px', height: '32px', minHeight: '32px' }}
                                >
                                    <AddIcon fontSize="small" />
                                </Fab>
                            </Tooltip>
                        </Grid>
                    </Grid>
                    <Grid container spacing={gridSpacing} sx={{ mt: 1 }}>
                        {!isLoading &&
                            filtered &&
                            filtered.map((mailbox) => (
                                <Grid item lg={4} md={6} sm={6} xs={12} key={mailbox.id}>
                                    <MailboxCard
                                        id={mailbox.id}
                                        name={mailbox.name}
                                        email={mailbox.email}
                                        onDelete={() => handleDelete(mailbox)}
                                    />
                                </Grid>
                            ))}
                        {isLoading && (
                            <Box sx={{ mx: 'auto', mt: 1, width: 200 }}>
                                <CircularProgress />
                            </Box>
                        )}
                    </Grid>
                </CardContent>
            </MainCard>
            <MailboxCreateDialog isOpen={openDialog} onClose={handleCloseDialog} checkEmail={checkEmail} />

            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={modalStyle}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            padding: '5px'
                        }}
                    >
                        <IconButton size="small" aria-label="close" color="primary" onClick={handleClose}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '15px 32px 32px 32px'
                        }}
                    >
                        <Typography
                            sx={{
                                textAlign: 'center',
                                paddingBottom: 2
                            }}
                            variant="subtitle1"
                            gutterBottom
                            component="div"
                            id="modal-modal-description"
                        >
                            Are you sure you want to delete {selectedCard?.name}({selectedCard?.email}) ?
                        </Typography>
                        <Stack direction="row" justifyContent="center" spacing={2}>
                            <Button variant="contained" color="primary" onClick={removeMailbox}>
                                Yes
                            </Button>
                            <Button variant="contained" onClick={handleClose}>
                                Cancel
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default MailboxList;
