import { useCallback, useState } from 'react';
import { FormHelperText, Tooltip, FormControl, TextField } from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import serviceAPI from '../services/ServiceService';
import useShowSnackbar from '../hooks/useShowSnackbar';
import { SnackBarTypes } from '../store/snackbarReducer';
import Can from '../utils/roles/Can';
import CreateButtonFab from './CreateButtonFab';
import CBModal from './CBModal';

const CreateServiceSimpleButton = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [createService, { isLoading }] = serviceAPI.useSimpleCreateServiceMutation();
    const { showSnackbar } = useShowSnackbar();

    const { handleSubmit, values, touched, errors, handleChange, handleBlur, resetForm } = useFormik({
        initialValues: { name: '' },
        enableReinitialize: true,
        validateOnChange: true,
        validationSchema: Yup.object().shape({
            name: Yup.string().required('Service name is required')
        }),
        onSubmit: (formData) => {
            createService(formData.name)
                .unwrap()
                .then(() => {
                    showSnackbar({
                        message: 'Service added successfully, now you can choose it from the list.',
                        alertSeverity: SnackBarTypes.Success
                    });
                    close();
                })
                .catch((err) => {
                    showSnackbar({
                        message: err.data || 'Error occurred, service was not added.',
                        alertSeverity: SnackBarTypes.Error
                    });
                });
        }
    });

    const open = useCallback(() => {
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        resetForm();
        setIsOpen(false);
    }, [resetForm]);

    return (
        <Can I="create" a="service">
            <Tooltip title="Create new service">
                <CreateButtonFab color="secondary" onClick={open}>
                    <Add />
                </CreateButtonFab>
            </Tooltip>
            <CBModal
                open={isOpen}
                onClose={close}
                title="Add new service"
                okButtonText="Save"
                okButtonDisabled={isLoading}
                onClickOk={handleSubmit}
            >
                <form noValidate onSubmit={handleSubmit} id="simple-add-service-form">
                    <FormControl fullWidth>
                        <TextField
                            onClick={(e) => {
                                e.stopPropagation();
                                // @ts-ignore
                                e.target.focus();
                            }}
                            error={Boolean(touched.name && errors.name)}
                            name="name"
                            id="name"
                            value={values.name}
                            label="Service Name"
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {touched?.name && errors?.name && (
                            <FormHelperText error id="error-service-name">
                                {errors?.name}
                            </FormHelperText>
                        )}
                    </FormControl>
                </form>
            </CBModal>
        </Can>
    );
};

export default CreateServiceSimpleButton;
