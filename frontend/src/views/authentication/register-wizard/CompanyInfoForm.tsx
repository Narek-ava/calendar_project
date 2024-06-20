import { ICompanyInfo } from './types';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Button, Grid, Stack, TextField } from '@material-ui/core';
import AnimateButton from '../../../ui-component/extended/AnimateButton';
import { AddressAutofill } from '@mapbox/search-js-react';

interface CompanyInfoFormProps {
    companyInfo: ICompanyInfo;
    setCompanyInfo: (d: ICompanyInfo) => void;
    handleBack: () => void;
    handleNext: () => void;
    setErrorIndex: (i: number | null) => void;
    errors: { [key: string]: any };
    setErrors: (errors: { [key: string]: any }) => void;
}

const CompanyInfoForm = ({
    companyInfo,
    setCompanyInfo,
    handleBack,
    handleNext,
    setErrorIndex,
    errors,
    setErrors
}: CompanyInfoFormProps) => {
    const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;

    const validationSchema = Yup.object({
        companyName: Yup.string().required('Company name is required'),
        address: Yup.object().shape({
            address: Yup.string(),
            city: Yup.string().required('City is required'),
            state: Yup.string().required('State is required'),
            postal_code: Yup.string().required('Postal Code is required'),
            l1: Yup.string().nullable(),
            l2: Yup.string().nullable()
        })
    });

    const formik = useFormik({
        initialValues: {
            companyName: companyInfo.companyName,
            address: {
                address: companyInfo.address?.address || '',
                city: companyInfo.address?.city || '',
                state: companyInfo.address?.state || '',
                postal_code: companyInfo.address?.postal_code || '',
                l1: companyInfo.address?.l1 || '',
                l2: companyInfo.address?.l2 || '',
                country: 'USA'
            }
        },
        initialErrors: errors,
        initialTouched: errors,
        validationSchema,
        onSubmit: (values) => {
            setCompanyInfo(values);
            setErrors({});
            handleNext();
        }
    });

    return (
        <>
            <form onSubmit={formik.handleSubmit} id="company-info-form">
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="companyName"
                            name="companyName"
                            label="Company Name"
                            defaultValue={formik.values.companyName}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.companyName && formik.errors.companyName)}
                            helperText={formik.touched.companyName && formik.errors.companyName}
                            onBlur={formik.handleBlur}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        {mapboxToken && (
                            <AddressAutofill
                                options={{
                                    country: 'US'
                                }}
                                accessToken={mapboxToken}
                                onRetrieve={(response) => {
                                    if (response.type === 'FeatureCollection' && response.features.length === 1) {
                                        const addressData = response.features[0].properties;
                                        formik.setFieldValue('address.address', addressData.place_name);
                                        formik.setFieldValue('address.l1', addressData.address_line1);
                                        formik.setFieldValue('address.l2', addressData.address_line2);
                                        formik.setFieldValue('address.city', addressData.place);
                                        formik.setFieldValue('address.state', addressData.region);
                                        formik.setFieldValue('address.postal_code', addressData.postcode);
                                    }
                                }}
                            >
                                <TextField
                                    label="Search Address"
                                    fullWidth
                                    name="address.address"
                                    value={formik.values.address?.address}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </AddressAutofill>
                        )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="address-address-line-1"
                            name="address.l1"
                            label="Address"
                            value={formik.values.address?.l1}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.address?.l1 && formik.errors.address?.l1)}
                            helperText={formik.touched.address?.l1 && formik.errors.address?.l1}
                            onBlur={formik.handleBlur}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="address-city"
                            name="address.city"
                            label="City"
                            value={formik.values.address?.city}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.address?.city && formik.errors.address?.city)}
                            helperText={formik.touched.address?.city && formik.errors.address?.city}
                            onBlur={formik.handleBlur}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="address-state"
                            name="address.state"
                            label="State"
                            value={formik.values.address?.state}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.address?.state && formik.errors.address?.state)}
                            helperText={formik.touched.address?.state && formik.errors.address?.state}
                            onBlur={formik.handleBlur}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="address-postal-code"
                            name="address.postal_code"
                            label="Postal Code"
                            value={formik.values.address?.postal_code}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.address?.postal_code && formik.errors.address?.postal_code)}
                            helperText={formik.touched.address?.postal_code && formik.errors.address?.postal_code}
                            onBlur={formik.handleBlur}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Stack direction="row" justifyContent="space-between">
                            <Button onClick={handleBack} sx={{ my: 3, ml: 1 }}>
                                Back
                            </Button>
                            <AnimateButton>
                                <Button variant="contained" type="submit" sx={{ my: 3, ml: 1 }} onClick={() => setErrorIndex(1)}>
                                    Next
                                </Button>
                            </AnimateButton>
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </>
    );
};

export default CompanyInfoForm;
