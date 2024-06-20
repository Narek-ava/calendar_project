import { Grid, OutlinedInput, Typography } from '@material-ui/core';
import InputLabel from '../../ui-component/extended/Form/InputLabel';
import { FormControl, FormHelperText } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CBModal from '../../ui-component/CBModal';

export interface IMailboxCreateForm {
    email: string;
    name: string;
}

interface MailBoxCreateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    checkEmail: (formData: IMailboxCreateForm) => void;
}

const initialValues: IMailboxCreateForm = {
    email: '',
    name: ''
};

const MailboxCreateDialog = ({ isOpen, onClose, checkEmail }: MailBoxCreateDialogProps) => {
    const { handleSubmit, values, touched, errors, handleBlur, handleChange } = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema: Yup.object().shape({
            email: Yup.string().max(255).required('Email is required'),
            name: Yup.string().max(255).required('Mailbox name is required')
        }),
        onSubmit: (formData) => {
            checkEmail(formData);
        }
    });

    if (!isOpen) return null;

    return (
        <CBModal
            fullWidth
            maxWidth="md"
            open={isOpen}
            onClose={onClose}
            title="Create a mailbox"
            okButtonText="Create Mailbox"
            onClickOk={handleSubmit}
        >
            <Typography variant="h4" color="primary" align="center" mb={2}>
                Customers email this address for help (e.g. support@domain.com)
            </Typography>
            <form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' }, mb: 3 }}>
                                <InputLabel horizontal sx={{ textAlign: 'right' }}>
                                    Email Address
                                </InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6} sx={{ position: 'relative', mb: 3 }}>
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
                                    <FormHelperText
                                        sx={{ opacity: 0.7, position: 'absolute', bottom: -20 }}
                                        id="standard-weight-helper-text--register"
                                    >
                                        You can edit this later
                                    </FormHelperText>
                                    {touched.email && errors.email && (
                                        <FormHelperText error id="standard-weight-helper-text--register">
                                            {' '}
                                            {errors.email}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                                <InputLabel horizontal sx={{ textAlign: 'right' }}>
                                    Mailbox Name
                                </InputLabel>
                            </Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                                <FormControl fullWidth>
                                    <OutlinedInput
                                        id="emailAlias"
                                        placeholder=""
                                        type="string"
                                        value={values.name}
                                        name="name"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.name && errors.name && (
                                        <FormHelperText error id="standard-weight-helper-text--register">
                                            {' '}
                                            {errors.name}{' '}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </CBModal>
    );
};

export default MailboxCreateDialog;
