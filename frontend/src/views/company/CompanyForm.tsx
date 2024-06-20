import React, { FC, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@material-ui/core/styles';
import { CardActions, CardContent, Divider, FormControl, FormHelperText, Grid, Tooltip, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

// project imports
import useAuth from 'hooks/useAuth';
import InputLabel from 'ui-component/extended/Form/InputLabel';
import { ICompany } from '../../models/ICompany';
import { regExps } from '../../utils/formValidators';
import { IAddress } from '../../models/IAddress';
import OptimizedTextField from '../../ui-component/optimized-text-fields/OptimizedTextField';
import ImageUploader from 'ui-component/form/ImageUploader';
import OptimizedMaskedTextField from '../../ui-component/optimized-text-fields/OptimizedMaskedTextField';
import { useAppDispatch } from '../../hooks/redux';
import { openConfirmPopup } from '../../store/confirmPopupSlice';
import companyAPI from '../../services/CompanyService';
import config from '../../config';
import { LoadingButton } from '@mui/lab';
import SaveOutlined from '@material-ui/icons/SaveOutlined';
import MapboxAddress from '../../ui-component/MapboxAddress';
import useShowSnackbar from '../../hooks/useShowSnackbar';
import { SnackBarTypes } from '../../store/snackbarReducer';
import useChangeCompany from '../../hooks/useChangeCompany';

interface CompanyFormProps {
    company: ICompany;
    isEdit?: boolean;
}

export const initialAddress: IAddress = {
    address: '',
    l1: '',
    l2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA'
};

export const addressScheme = Yup.object().shape({
    l1: Yup.string()
        .required('Address Line 1 is required')
        .max(255, 'Address must be at most 255 characters')
        .matches(regExps.address, 'Must be a valid address')
        .typeError('Must be a string'),
    l2: Yup.string().nullable().max(255, 'Address must be at most 255 characters').matches(regExps.address, 'Must be a valid address'),
    city: Yup.string().required('City is required').max(255, 'City must be at most 255 characters').typeError('Must be a string'),
    state: Yup.string().required('State is required').max(255, 'State must be at most 255 characters').typeError('Must be a string'),
    postal_code: Yup.string()
        .required('Postal Code is required')
        .max(255, 'Postal Code must be at most 255 characters')
        .matches(regExps.postal_code, 'Must be a valid postal code')
        .typeError('Must be a string')
});

const CompanyForm: FC<CompanyFormProps> = ({ company, isEdit }) => {
    const { user, changeCompanyContext, checkAuthentication } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { showSnackbar } = useShowSnackbar();

    const [deleteOrganization] = companyAPI.useDeleteCompanyMutation();
    const [saveCompany] = isEdit ? companyAPI.useUpdateCompanyMutation() : companyAPI.useCreateCompanyMutation();
    const { handleChangeCompany } = useChangeCompany();

    const {
        handleSubmit,
        values,
        touched,
        errors,
        handleBlur,
        handleChange,
        setFieldValue,
        setFieldTouched,
        isSubmitting,
        setSubmitting
    } = useFormik({
        enableReinitialize: true,
        validateOnChange: true,
        initialValues: {
            ...company,
            address: {
                ...company.address,
                l1: isEdit && !company.address.l1 && company.address.address ? company.address.address : company.address.l1 || '',
                l2: company.address.l2 || ''
            },
            isModeChangeHidden: isEdit
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().max(255, 'Name must be at most 255 characters').required('Name is required'),
            email: Yup.string().nullable().max(255, 'Email must be at most 255 characters').email('Must be a valid email'),
            phone: Yup.string().nullable().min(10, 'Phone number is not valid'),
            site: Yup.string().nullable().max(255, 'Site must be at most 255 characters'),
            address: addressScheme
        }),

        onSubmit: (formData) => {
            const { email, ...rest } = formData;
            saveCompany({
                ...rest,
                email: email?.toLowerCase()
            })
                .unwrap()
                .then((res) => {
                    showSnackbar({
                        message: `Organization ${isEdit ? 'updated' : 'created'}`,
                        alertSeverity: SnackBarTypes.Success
                    });

                    if (res && !isEdit) {
                        checkAuthentication();

                        dispatch(
                            openConfirmPopup({
                                onConfirm: () => handleChangeCompany(res.id, true),
                                onClose: () => navigate(config.defaultPath, { replace: true }),
                                confirmText: 'Switch',
                                text: 'Switch organization context to the created one?',
                                id: 'company_switch'
                            })
                        );
                    } else {
                        navigate(config.defaultPath, { replace: true });
                    }
                    setSubmitting(false);
                })
                .catch((e) => {
                    showSnackbar({
                        message: e.data || `Company hasn't been ${isEdit ? 'updated' : 'created'}`,
                        alertSeverity: SnackBarTypes.Error
                    });
                    setSubmitting(false);
                });
        }
    });

    const extractLogoUrl = useCallback(
        (fieldName: string, logo) => {
            if (logo && typeof logo === 'object') {
                // get: http://minio:9000/local/images/y5SLvPYe9JJgh41TEtcwd9InZ6cy5QlT4ikyyBVY.png
                // need to send: images/y5SLvPYe9JJgh41TEtcwd9InZ6cy5QlT4ikyyBVY.png
                const undressedImageLink = logo.url.match(/images.*$/);
                if (undressedImageLink) {
                    setFieldValue(fieldName, undressedImageLink[0]);
                }
            }
        },
        [setFieldValue]
    );

    useEffect(() => {
        extractLogoUrl('logo', company.logo);
    }, [company.logo, extractLogoUrl]);

    useEffect(() => {
        extractLogoUrl('logo_rectangular', company.logo_rectangular);
    }, [company.logo_rectangular, extractLogoUrl]);

    const setLogo = (field: string, value: any): any => {
        setFieldValue('logo', value ? value[0] : '');
    };

    const setLogoRectangular = (field: string, value: any): any => {
        setFieldValue('logo_rectangular', value ? value[0] : '');
    };

    const clearFormImage = () => {
        setFieldValue('logo', null);
    };

    const clearFormLogoRect = () => {
        setFieldValue('logo_rectangular', null);
    };

    const handleDelete = (organization: ICompany) => {
        dispatch(
            openConfirmPopup({
                onConfirm: () => removeOrganization(organization),
                confirmText: `Delete`,
                text: `Are you sure you want to delete ${organization.name} ?`
            })
        );
    };

    const removeOrganization = (organization: ICompany) => {
        deleteOrganization(organization)
            .unwrap()
            .then(() => {
                showSnackbar({
                    message: 'Organization deleted',
                    alertSeverity: SnackBarTypes.Error
                });
                autoChangeCompany(user?.companies[0].id === user?.currentCompany.id ? user?.companies[1].id : user?.companies[0].id);
            })
            .catch(() => {
                showSnackbar({
                    message: "Error: Organization hasn't been deleted",
                    alertSeverity: SnackBarTypes.Error
                });
            });
    };

    const autoChangeCompany = async (companyId: number | undefined) => {
        if (companyId !== undefined) {
            await changeCompanyContext(companyId);
            navigate(config.defaultPath, { replace: true });
            navigate(0);
        }
    };

    return (
        <>
            <form noValidate onSubmit={handleSubmit}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <ImageUploader
                            initialPreview={company?.logo}
                            setFieldValue={setLogo}
                            name="Logo (square)"
                            imageFieldName="logo"
                            clearFormImage={clearFormImage}
                            infoText="Default logo that is used everywhere if no rectangular logo provided."
                        />

                        <ImageUploader
                            initialPreview={company?.logo_rectangular}
                            setFieldValue={setLogoRectangular}
                            name="Logo (rectangular)"
                            imageFieldName="logo_rectangular"
                            clearFormImage={clearFormLogoRect}
                            infoText="An optional rectangular logo that is used in booking widget header and email header."
                        />

                        <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                            <InputLabel horizontal>Name</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={6}>
                            <FormControl fullWidth error={Boolean(touched.name && errors.name)}>
                                <OptimizedTextField
                                    placeholder="Name"
                                    id="name"
                                    name="name"
                                    value={values.name || ''}
                                    onChange={(event) => {
                                        handleChange(event);
                                        setFieldTouched('name', false);
                                    }}
                                    onBlur={handleBlur}
                                />
                                {touched.name && errors.name && (
                                    <FormHelperText error id="standard-weight-helper-text--register">
                                        {errors.name}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={4}>
                            <InputLabel horizontal>Email</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={6}>
                            <FormControl fullWidth error={Boolean(touched.email && errors.email)}>
                                <OptimizedTextField
                                    id="email"
                                    name="email"
                                    placeholder="Email"
                                    value={values.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setFieldValue('email', e.target.value);
                                        setFieldTouched('email', false);
                                    }}
                                    onBlur={handleBlur}
                                />
                                {touched.email && errors.email && (
                                    <FormHelperText error id="standard-weight-helper-text--register">
                                        {errors.email}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={4}>
                            <InputLabel horizontal>Phone</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={6}>
                            <FormControl fullWidth error={Boolean(touched.phone && errors.phone)}>
                                <OptimizedMaskedTextField
                                    id="phone"
                                    name="phone"
                                    value={values.phone}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setFieldValue('phone', e.target.value);
                                        setFieldTouched('phone', false);
                                    }}
                                    onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                        handleBlur(e);
                                    }}
                                    placeholder="Phone"
                                />
                                {touched.phone && errors.phone && (
                                    <FormHelperText error id="standard-weight-helper-text--register">
                                        {errors.phone}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={4}>
                            <InputLabel horizontal>Website</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={6}>
                            <FormControl fullWidth error={Boolean(touched.site && errors.site)}>
                                <OptimizedTextField
                                    placeholder="https://"
                                    id="site"
                                    name="site"
                                    value={values.site || ''}
                                    onChange={(event) => {
                                        handleChange(event);
                                        setFieldTouched('site', false);
                                    }}
                                    onBlur={handleBlur}
                                />
                                {touched.site && errors.site && (
                                    <FormHelperText error id="standard-weight-helper-text--register">
                                        {errors.site}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        <MapboxAddress
                            touched={touched}
                            errors={errors}
                            values={values}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            setFieldValue={setFieldValue}
                        />
                    </Grid>
                </CardContent>
                <Divider />
                <CardActions>
                    <Grid container spacing={1}>
                        <Grid item>
                            <LoadingButton
                                loading={isSubmitting}
                                loadingPosition="start"
                                type="submit"
                                color="primary"
                                startIcon={<SaveOutlined />}
                                variant="contained"
                            >
                                {isEdit ? 'Save' : 'Create'}
                            </LoadingButton>
                        </Grid>
                    </Grid>
                    {isEdit && user && user?.companies.length > 1 && (
                        <Tooltip placement="top" title="Delete organization">
                            <IconButton
                                onClick={() => handleDelete(company)}
                                color="primary"
                                sx={{
                                    color: theme.palette.orange.dark,
                                    borderColor: theme.palette.orange.main,
                                    '&:hover ': { background: theme.palette.orange.light }
                                }}
                            >
                                <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </CardActions>
            </form>
        </>
    );
};
export default CompanyForm;
