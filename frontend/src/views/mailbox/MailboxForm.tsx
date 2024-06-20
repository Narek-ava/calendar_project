import { FC, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Divider, Grid, IconButton, Modal, OutlinedInput, Stack, Typography } from '@material-ui/core';
import InputLabel from '../../ui-component/extended/Form/InputLabel';
import { FormControl, FormHelperText, MenuItem, Select } from '@mui/material';
import modalStyle from '../../themes/modalStyle';
import CloseIcon from '@material-ui/icons/Close';
import { useNavigate } from 'react-router-dom';
import { startCase, toLower } from 'lodash';
import { IMailbox } from '../../models/IMailbox';
import { SNACKBAR_OPEN } from '../../store/actions';
import mailboxAPI from '../../services/MailboxService';
import { useAppDispatch } from '../../hooks/redux';
import { axiosServices } from '../../utils/axios';
import { IEmployee } from '../../models/IEmployee';

interface MailboxFormProps {
    mailbox: IMailbox;
    employees: IEmployee[];
}

interface IMailboxUsers {
    [key: string]: { [key: string]: string[] };
}

const MailboxForm: FC<MailboxFormProps> = ({ mailbox, employees }: MailboxFormProps) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [deleteMailbox] = mailboxAPI.useDeleteMailboxMutation();
    const [updateMailbox] = mailboxAPI.useUpdateMailboxMutation();
    //  deletion modal state
    const [open, setOpen] = useState(false);
    //  deletion modal state handlers
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    // permissions hardcode
    const access = { access: ['edit', 'perm', 'auto', 'sig'] };
    const users: IMailboxUsers = employees.reduce((prev, curr) => {
        prev[curr.user.id] = access;
        return prev;
    }, {} as IMailboxUsers);
    const initialValues = {
        ...mailbox,
        aliases: mailbox.aliases ? mailbox.aliases : '',
        auto_bcc: mailbox.auto_bcc ? mailbox.auto_bcc : '',
        ticket_assignee: mailbox.ticket_assignee ? mailbox.ticket_assignee : 2,
        ticket_status: mailbox.ticket_status ? mailbox.ticket_status : 1,
        in_password: mailbox.in_password ? mailbox.in_password : '',
        out_password: mailbox.out_password ? mailbox.out_password : '',
        //  hardcoded field
        in_encryption: 2,
        out_encryption: 2,
        out_method: 3, // hardcode (must be radio buttons),
        users,
        in_server: mailbox.in_server ? mailbox.in_server : '',
        in_username: mailbox.in_username ? mailbox.in_username : '',
        out_server: mailbox.out_server ? mailbox.out_server : '',
        out_port: mailbox.out_port ? mailbox.out_port : '',
        out_username: mailbox.out_username ? mailbox.out_username : ''
    };
    const { handleSubmit, values, touched, errors, handleBlur, handleChange } = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema: Yup.object().shape({
            name: Yup.string().max(255).required('Mailbox Name is required'),
            email: Yup.string().max(255).required('Email is required'),
            aliases: Yup.string().max(255).nullable(),
            auto_bcc: Yup.string().max(255).nullable(),
            ticket_status: Yup.number(),
            ticket_assignee: Yup.number(),
            in_protocol: Yup.number(),
            in_server: Yup.string().max(255).required('Server is required'),
            in_port: Yup.number().max(65535),
            in_username: Yup.string().max(255).required('Username is required'),
            in_password: Yup.string().min(6).max(255).required('Password is required'),
            in_encryption: Yup.number(),
            in_validate_cert: Yup.boolean(),
            out_server: Yup.string().max(255).required('Out Server is required'),
            out_port: Yup.number().max(65535),
            out_username: Yup.string().max(255).required('Out Username is required'),
            out_password: Yup.string().min(6).max(255).required('Out Password is required')
        }),
        onSubmit: async (formData) => {
            const newObj: IMailbox = { ...mailbox, ...formData };

            try {
                const res = await axiosServices.get('/mailboxes');
                const invalid = await res.data.data.find((elem: IMailbox) => elem.email === newObj.email && elem.id !== newObj.id);

                if (invalid) {
                    dispatch({
                        type: SNACKBAR_OPEN,
                        open: true,
                        message: 'This email is already in use',
                        variant: 'alert',
                        alertSeverity: 'error',
                        anchorOrigin: { vertical: 'top', horizontal: 'center' }
                    });
                    return;
                }
            } catch (e) {
                console.log(e.message);
            }
            updateMailbox(newObj)
                .unwrap()
                .then(() => {
                    dispatch({
                        type: SNACKBAR_OPEN,
                        open: true,
                        message: 'Mailbox updated',
                        variant: 'alert',
                        alertSeverity: 'success',
                        anchorOrigin: { vertical: 'top', horizontal: 'center' }
                    });
                    navigate('/mailbox', { replace: true });
                })
                .catch(() => {
                    dispatch({
                        type: SNACKBAR_OPEN,
                        open: true,
                        message: "Error: Mailbox hasn't updated",
                        variant: 'alert',
                        alertSeverity: 'error',
                        anchorOrigin: { vertical: 'top', horizontal: 'center' }
                    });
                    navigate('/mailbox', { replace: true });
                });
        }
    });

    const statusAfterReplying = ['Snooze (1 day by default)', 'Active', 'Closed'];
    const defaultAssignee = ['Anyone', 'Person Replying (if Unassigned)', 'Person Replying'];
    const in_protocol = ['IMAP', 'POP3'];

    const removeMailbox = () => {
        deleteMailbox(mailbox)
            .unwrap()
            .then(() => {
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Mailbox deleted',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
                handleClose();
                navigate('/mailbox', { replace: true });
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
    };

    return (
        <>
            <form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>Email Address</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OutlinedInput
                                        id="email"
                                        placeholder=""
                                        type="string"
                                        value={values.email}
                                        name="email"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.email && errors.email && (
                                        <FormHelperText error id="standard-weight-helper-text--register">
                                            {' '}
                                            {errors.email}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>Mailbox Name</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OutlinedInput
                                        id="name"
                                        placeholder=""
                                        type="string"
                                        value={values.name}
                                        name="name"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.name && errors.name && (
                                        <FormHelperText error id="name-helper-text--register">
                                            {' '}
                                            {errors.name}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>Aliases</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OutlinedInput
                                        id="aliases"
                                        placeholder=""
                                        type="string"
                                        value={values.aliases}
                                        name="aliases"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.aliases && errors.aliases && (
                                        <FormHelperText error id="standard-weight-helper-text--register">
                                            {' '}
                                            {errors.aliases}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>Auto Bcc</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OutlinedInput
                                        id="auto_bcc"
                                        placeholder=""
                                        type="string"
                                        value={values.auto_bcc}
                                        name="auto_bcc"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.auto_bcc && errors.auto_bcc && (
                                        <FormHelperText error id="standard-weight-helper-text--register">
                                            {' '}
                                            {errors.auto_bcc}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>Status After Replying</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth error={Boolean(touched.ticket_status && errors.ticket_status)}>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="ticket_status"
                                        value={values.ticket_status}
                                        name="ticket_status"
                                        onChange={handleChange}
                                    >
                                        {statusAfterReplying.map((status, index) => (
                                            <MenuItem key={`${status}-${index}`} value={index + 1}>
                                                {startCase(toLower(status))}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>Default Assignee</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth error={Boolean(touched.ticket_assignee && errors.ticket_assignee)}>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="ticket_assignee"
                                        value={values.ticket_assignee}
                                        name="ticket_assignee"
                                        onChange={handleChange}
                                    >
                                        {defaultAssignee.map((person, index) => (
                                            <MenuItem key={`${person}-${index}`} value={index + 1}>
                                                {startCase(toLower(person))}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* PERMISSIONS */}
                            {/*
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>Who Else Will Use This Mailbox</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth error={Boolean(touched.permissions && errors.permissions)}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Button
                                            onClick={() => {
                                                setFieldValue('permissions', []);
                                                const newPermissions: IMockUser[] = [];
                                                users.forEach((user) => newPermissions.push(user));
                                                setFieldValue('permissions', newPermissions);
                                            }}
                                        >
                                            all
                                        </Button>
                                        <Box component="span">/</Box>
                                        <Button
                                            onClick={() => {
                                                setFieldValue('permissions', []);
                                            }}
                                        >
                                            none
                                        </Button>
                                    </Stack>
                                    <FormGroup>
                                        {users.map((user) => (
                                            <FormControlLabel
                                                key={user.id}
                                                checked={!!values.permissions.find((elem) => elem.id === user.id)}
                                                onChange={(event, checked) => {
                                                    if (checked) {
                                                        setFieldValue('permissions', [...values.permissions, user]);
                                                    } else {
                                                        const newPermissions = values.permissions.filter((elem) => elem.id !== user.id);
                                                        setFieldValue('permissions', newPermissions);
                                                    }
                                                }}
                                                name="permissions"
                                                control={<Checkbox />}
                                                label={`${user.firstname} ${user.lastname}`}
                                            />
                                            // <FormControlLabel
                                            //     control={<Checkbox checked onChange={handleChange} name="permissions" />}
                                            //     label={user.firstname}
                                            // />
                                        ))}
                                    </FormGroup>
                                </FormControl>
                            </Grid> */}
                            {/* DIVIDER */}
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <Typography sx={{ my: 2 }} fontSize="large" fontWeight="bold">
                                    Fetching Settings
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <Divider />
                            </Grid>
                            {/* IN PROTOCOL */}
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>in protocol</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth error={Boolean(touched.in_protocol && errors.ticket_assignee)}>
                                    <Select
                                        labelId="in_protocol-select-label"
                                        id="in_protocol"
                                        value={values.in_protocol}
                                        name="in_protocol"
                                        onChange={handleChange}
                                    >
                                        {in_protocol.map((protocol, index) => (
                                            <MenuItem key={`${protocol}-${index}`} value={index + 1}>
                                                {protocol}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* IN SERVER */}
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>in server</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OutlinedInput
                                        id="in_server"
                                        placeholder=""
                                        type="string"
                                        value={values.in_server}
                                        name="in_server"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.in_server && errors.in_server && (
                                        <FormHelperText error id="in_server-helper-text">
                                            {' '}
                                            {errors.in_server}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            {/* IN PORT */}
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>in port</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OutlinedInput
                                        id="in_port"
                                        placeholder=""
                                        type="number"
                                        value={values.in_port}
                                        name="in_port"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.in_port && errors.in_port && (
                                        <FormHelperText error id="in_port-helper-text">
                                            {' '}
                                            {errors.in_port}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            {/* IN USERNAME */}
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>in username</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OutlinedInput
                                        id="in_username"
                                        placeholder=""
                                        type="string"
                                        value={values.in_username}
                                        name="in_username"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.in_username && errors.in_username && (
                                        <FormHelperText error id="in_username-helper-text">
                                            {' '}
                                            {errors.in_username}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            {/* IN PASSWORD */}
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>in password</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OutlinedInput
                                        id="in_password"
                                        placeholder=""
                                        type="password"
                                        value={values.in_password}
                                        name="in_password"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.in_password && errors.in_password && (
                                        <FormHelperText error id="in_password-helper-text">
                                            {' '}
                                            {errors.in_password}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <Typography sx={{ my: 2 }} fontSize="large" fontWeight="bold">
                                    Sending Settings
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <Divider />
                            </Grid>
                            {/* OUT SERVER */}
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>out server</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OutlinedInput
                                        id="out_server"
                                        placeholder=""
                                        type="string"
                                        value={values.out_server}
                                        name="out_server"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.out_server && errors.out_server && (
                                        <FormHelperText error id="out_server-helper-text">
                                            {' '}
                                            {errors.out_server}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            {/* OUT PORT */}
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>out port</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OutlinedInput
                                        id="out_port"
                                        placeholder=""
                                        type="number"
                                        value={values.out_port}
                                        name="out_port"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.out_port && errors.out_port && (
                                        <FormHelperText error id="out_port-helper-text">
                                            {' '}
                                            {errors.out_port}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            {/* OUT USERNAME */}
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>out username</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OutlinedInput
                                        id="out_username"
                                        placeholder=""
                                        type="string"
                                        value={values.out_username}
                                        name="out_username"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.out_username && errors.out_username && (
                                        <FormHelperText error id="out_username-helper-text">
                                            {' '}
                                            {errors.out_username}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            {/* OUT PASSWORD */}
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal>out password</InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OutlinedInput
                                        id="out_password"
                                        placeholder=""
                                        type="password"
                                        value={values.out_password}
                                        name="out_password"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.out_password && errors.out_password && (
                                        <FormHelperText error id="out_password-helper-text">
                                            {' '}
                                            {errors.out_password}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Stack justifyContent="center" direction="row" spacing={4} sx={{ mt: 4 }}>
                    <Button type="submit" variant="contained" size="small">
                        Save
                    </Button>
                    <Button onClick={handleOpen} color="error">
                        Delete mailbox
                    </Button>
                </Stack>
            </form>

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
                            Are you sure you want to delete {mailbox.name}({mailbox.email}) ?
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

export default MailboxForm;
