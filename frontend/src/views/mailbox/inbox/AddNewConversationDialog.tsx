import React, { FC, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// material-ui
import { useTheme } from '@material-ui/core/styles';
import {
    Button,
    Collapse,
    Dialog,
    DialogContent,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    Link,
    MenuItem,
    Select,
    Slide,
    SlideProps,
    TextField,
    Typography
} from '@material-ui/core';

// third-party
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// project imports
import { gridSpacing } from 'store/constant';

// assets
import AddCircleOutlineTwoToneIcon from '@material-ui/icons/AddCircleOutlineTwoTone';
import AttachmentTwoToneIcon from '@material-ui/icons/AttachmentTwoTone';
import HighlightOffTwoToneIcon from '@material-ui/icons/HighlightOffTwoTone';
import UploadFileIcon from '@material-ui/icons/UploadFile';
import { IconArrowsDiagonal2 } from '@tabler/icons';
import { IMailbox } from '../../../models/IMailbox';
// import { FormControl, FormHelperText, MenuItem, Select } from '@mui/material';
import { FormHelperText } from '@mui/material';
import conversationAPI from '../../../services/ConversationService';
import { SNACKBAR_OPEN } from '../../../store/actions';
import { useAppDispatch } from '../../../hooks/redux';
import customerAPI from '../../../services/CustomerService';
import mailboxAPI from '../../../services/MailboxService';
// animation
const Transition = React.forwardRef((props: SlideProps, ref) => <Slide direction="up" ref={ref} {...props} />);

// ==============================|| MAIL COMPOSE DIALOG ||============================== //

export interface IAddNewConversationForm {
    mailbox: IMailbox;
}

interface IAddNewConversationValues {
    customer_type: string;
    to: string;
    subject: string;
    cc?: string;
    bcc?: string;
    text: string;
}

const AddNewConversationDialog: FC<IAddNewConversationForm> = ({ mailbox }) => {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [createConversation] = conversationAPI.useCreateConversationMutation();
    const { data: customers } = customerAPI.useFetchAllCustomersQuery({});
    const [customersArray, setCustomersArray] = useState<string[]>([] as string[]);

    useEffect(() => {
        if (customers) {
            const customerEmails = customers.data.map((customer) => customer.email);
            setCustomersArray(['Add new Customer', ...customerEmails]);
        }
    }, [customers]);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleCloseDialog = () => {
        setOpen(false);
    };

    const [ccBccValue, setCcBccValue] = React.useState<boolean>(false);
    const handleCcBccChange = () => {
        setCcBccValue((prev) => !prev);
    };

    let composePosition = {};

    const [position, setPosition] = React.useState(true);
    if (!position) {
        composePosition = {
            '& .MuiDialog-container': {
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                '& .MuiPaper-root': { mb: 0, borderRadius: '12px 12px 0px 0px', maxWidth: '595px' }
            }
        };
    }

    const initialValues: IAddNewConversationValues = {
        customer_type: '',
        to: '',
        text: '',
        subject: '',
        bcc: '',
        cc: ''
    };

    const { handleSubmit, values, touched, errors, handleBlur, handleChange, setFieldValue, resetForm } = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema: Yup.object().shape({
            customer_type: Yup.string().required('Choose customer'),
            to: Yup.string()
                .max(255)
                .when('customer_type', {
                    is: 'Add new Customer',
                    then: Yup.string().max(255).required('Customer is required'),
                    otherwise: Yup.string().max(255).nullable()
                }),
            subject: Yup.string().max(255).required('Subject is required'),
            text: Yup.string().max(255).required('Message is required'),
            cc: Yup.string().max(255).nullable(),
            bcc: Yup.string().max(255).nullable()
        }),
        onSubmit: (formData: IAddNewConversationValues) => {
            const customer = formData.to ? formData.to : formData.customer_type;
            const newFormData = {
                type: 1, // must be the select with different types such as phone, email, etc...
                subject: formData.subject,
                customer: {
                    email: customer
                },
                threads: [
                    {
                        text: formData.text,
                        type: 'message',
                        user: 1
                    }
                ]
            };
            const createArg = {
                mailboxId: mailbox.id,
                formData: newFormData
            };
            createConversation(createArg)
                .then(() => {
                    dispatch({
                        type: SNACKBAR_OPEN,
                        open: true,
                        message: 'Conversation created!',
                        variant: 'alert',
                        alertSeverity: 'success',
                        anchorOrigin: { vertical: 'top', horizontal: 'center' }
                    });
                    resetForm();
                    handleCloseDialog();
                    dispatch(conversationAPI.util.invalidateTags(['Conversation']));
                    dispatch(customerAPI.util.invalidateTags(['Customer']));
                    dispatch(mailboxAPI.util.invalidateTags(['Mailbox']));
                })
                .catch(() => {
                    dispatch({
                        type: SNACKBAR_OPEN,
                        open: true,
                        message: "Error: Conversation hasn't created",
                        variant: 'alert',
                        alertSeverity: 'error',
                        anchorOrigin: { vertical: 'top', horizontal: 'center' }
                    });
                });
        }
    });

    return (
        <>
            <Button
                variant="contained"
                onClick={handleClickOpen}
                sx={{ width: '100%' }}
                size="large"
                startIcon={<AddCircleOutlineTwoToneIcon />}
            >
                New Conversation
            </Button>
            <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={handleCloseDialog} sx={composePosition}>
                <DialogContent>
                    <form noValidate onSubmit={handleSubmit}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item xs={12}>
                                <Grid container alignItems="center" spacing={0}>
                                    <Grid item sm zeroMinWidth>
                                        <Typography component="div" align="left" variant="h4">
                                            Create new Conversation
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <IconButton onClick={() => setPosition(!position)}>
                                            <IconArrowsDiagonal2 />
                                        </IconButton>
                                    </Grid>
                                    <Grid item>
                                        <IconButton onClick={handleCloseDialog}>
                                            <HighlightOffTwoToneIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container justifyContent="flex-end" spacing={0}>
                                    <Grid item>
                                        <Link
                                            component={RouterLink}
                                            to="#"
                                            color={theme.palette.mode === 'dark' ? 'primary' : 'secondary'}
                                            onClick={handleCcBccChange}
                                            underline="hover"
                                        >
                                            CC & BCC
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth error={Boolean(touched.customer_type && errors.customer_type)}>
                                    <InputLabel id="customer_type-label">Choose customer or add email</InputLabel>
                                    <Select
                                        labelId="customer_type-label"
                                        id="customer_type"
                                        value={values.customer_type}
                                        name="customer_type"
                                        onChange={handleChange}
                                        label="Choose customer or add email"
                                    >
                                        {customersArray.map((customer, index) => (
                                            <MenuItem key={`${customer}-${index}`} value={customer}>
                                                {customer}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {touched.customer_type && errors.customer_type && (
                                    <FormHelperText error id="subject-helper-text">
                                        {' '}
                                        {errors.customer_type}{' '}
                                    </FormHelperText>
                                )}
                            </Grid>
                            {values.customer_type === customersArray[0] && (
                                <>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="To"
                                            id="to"
                                            value={values.to}
                                            name="to"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                        />
                                        {touched.to && errors.to && (
                                            <FormHelperText error id="to-helper-text">
                                                {' '}
                                                {errors.to}{' '}
                                            </FormHelperText>
                                        )}
                                    </Grid>
                                </>
                            )}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Subject"
                                    id="subject"
                                    value={values.subject}
                                    name="subject"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                />
                                {touched.subject && errors.subject && (
                                    <FormHelperText error id="subject-helper-text">
                                        {' '}
                                        {errors.subject}{' '}
                                    </FormHelperText>
                                )}
                            </Grid>
                            <Grid item xs={12} sx={{ display: ccBccValue ? 'block' : 'none' }}>
                                <Collapse in={ccBccValue}>
                                    <Grid container spacing={gridSpacing}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="CC"
                                                id="cc"
                                                value={values.cc}
                                                name="cc"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                            />
                                            {touched.cc && errors.cc && (
                                                <FormHelperText error id="cc-helper-text">
                                                    {' '}
                                                    {errors.cc}{' '}
                                                </FormHelperText>
                                            )}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="BCC"
                                                id="bcc"
                                                value={values.bcc}
                                                name="bcc"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                            />
                                            {touched.bcc && errors.bcc && (
                                                <FormHelperText error id="bcc-helper-text">
                                                    {' '}
                                                    {errors.bcc}{' '}
                                                </FormHelperText>
                                            )}
                                        </Grid>
                                    </Grid>
                                </Collapse>
                            </Grid>

                            {/* quill editor */}
                            <Grid
                                item
                                xs={12}
                                sx={{
                                    '& .quill': {
                                        backgroundColor: theme.palette.mode === 'dark' ? 'dark.main' : 'grey.50',
                                        borderRadius: '12px',
                                        '& .ql-toolbar': {
                                            backgroundColor: theme.palette.mode === 'dark' ? 'dark.light' : 'grey.100',
                                            borderColor: theme.palette.mode === 'dark' ? theme.palette.dark.light + 20 : 'grey.400',
                                            borderTopLeftRadius: '12px',
                                            borderTopRightRadius: '12px'
                                        },
                                        '& .ql-container': {
                                            borderColor:
                                                theme.palette.mode === 'dark'
                                                    ? `${theme.palette.dark.light + 20} !important`
                                                    : `${theme.palette.grey[400]} !important`,
                                            borderBottomLeftRadius: '12px',
                                            borderBottomRightRadius: '12px',
                                            '& .ql-editor': {
                                                minHeight: '125px'
                                            }
                                        }
                                    }
                                }}
                            >
                                <ReactQuill theme="snow" id="text" value={values.text} onChange={(value) => setFieldValue('text', value)} />
                                {touched.text && errors.text && (
                                    <FormHelperText error id="text-helper-text">
                                        {' '}
                                        {errors.text}{' '}
                                    </FormHelperText>
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={1} alignItems="center">
                                    <Grid item>
                                        <IconButton>
                                            <UploadFileIcon />
                                        </IconButton>
                                    </Grid>
                                    <Grid item>
                                        <IconButton>
                                            <AttachmentTwoToneIcon />
                                        </IconButton>
                                    </Grid>
                                    <Grid item sx={{ flexGrow: 1 }} />
                                    <Grid item>
                                        <Button variant="contained" type="submit">
                                            Create
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AddNewConversationDialog;
