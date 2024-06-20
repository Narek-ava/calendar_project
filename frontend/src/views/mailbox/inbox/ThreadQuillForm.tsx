import ReactQuill from 'react-quill';
import { Button, Grid, IconButton } from '@material-ui/core';
import UploadFileIcon from '@material-ui/icons/UploadFile';
import AttachmentTwoToneIcon from '@material-ui/icons/AttachmentTwoTone';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FormHelperText } from '@mui/material';
import conversationAPI from 'services/ConversationService';
import { IConversation, ICreateThread } from 'models/IConversation';
import { useAppDispatch } from 'hooks/redux';
import { SNACKBAR_OPEN } from 'store/actions';

interface ThreadQuillProps {
    onClose: () => void;
    conversation: IConversation;
}

const ThreadQuillForm = ({ onClose, conversation }: ThreadQuillProps) => {
    const dispatch = useAppDispatch();
    const [createThread] = conversationAPI.useCreateThreadMutation();
    const initialValues = {
        text: ''
    };

    const { values, handleSubmit, errors, touched, resetForm, setFieldValue } = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema: Yup.object().shape({
            text: Yup.string().required('Text message is required')
        }),
        onSubmit: (formData) => {
            const argObj: ICreateThread = {
                conversation,
                data: {
                    type: 'message',
                    text: formData.text,
                    customer: {
                        email: conversation.customer.email
                    }
                }
            };
            createThread(argObj)
                .then(() => {
                    dispatch({
                        type: SNACKBAR_OPEN,
                        open: true,
                        message: 'Thread created',
                        variant: 'alert',
                        alertSeverity: 'success',
                        anchorOrigin: { vertical: 'top', horizontal: 'center' }
                    });
                    dispatch(conversationAPI.util.invalidateTags(['Conversation']));
                    onClose();
                })
                .catch(() => {
                    dispatch({
                        type: SNACKBAR_OPEN,
                        open: true,
                        message: "Error: Thread hasn't created",
                        variant: 'alert',
                        alertSeverity: 'error',
                        anchorOrigin: { vertical: 'top', horizontal: 'center' }
                    });
                });
            resetForm();
        }
    });

    return (
        <form noValidate onSubmit={handleSubmit}>
            <ReactQuill theme="snow" id="text" value={values.text} onChange={(value) => setFieldValue('text', value)} />
            {touched.text && errors.text && (
                <FormHelperText error id="thread-text-helper-text">
                    {' '}
                    {errors.text}{' '}
                </FormHelperText>
            )}
            <Grid container spacing={1} alignItems="center" sx={{ mt: 2 }}>
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
                    <Button onClick={onClose}>Cancel</Button>
                </Grid>
                <Grid item>
                    <Button variant="contained" type="submit">
                        Reply
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default ThreadQuillForm;
