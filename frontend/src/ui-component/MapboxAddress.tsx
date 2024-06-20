import { FormControl, FormHelperText, Grid } from '@material-ui/core';
import InputLabel from './extended/Form/InputLabel';
import { AddressAutofill } from '@mapbox/search-js-react';
import OptimizedTextField from './optimized-text-fields/OptimizedTextField';
import { FormikErrors, FormikTouched } from 'formik';
import { SelectChangeEvent } from '@mui/material';
import * as React from 'react';
import { IAddress } from '../models/IAddress';

interface AddressProps {
    address: IAddress;
}

interface MapboxAddressProps {
    touched: FormikTouched<AddressProps>;
    errors: FormikErrors<AddressProps>;
    values: AddressProps;
    handleChange: (event: SelectChangeEvent) => void;
    handleBlur: (e: React.FocusEvent<any>) => void;
    setFieldValue: (a: string, b: any) => void;
}

const MapboxAddress = ({ touched, errors, values, setFieldValue, handleChange, handleBlur }: MapboxAddressProps) => {
    const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;

    return mapboxToken ? (
        <Grid item xs={12}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3} lg={4}>
                    <InputLabel horizontal>Address Search</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                    <FormControl fullWidth error={Boolean(touched.address?.address && errors.address?.address)}>
                        <AddressAutofill
                            options={{
                                country: 'US'
                            }}
                            accessToken={mapboxToken}
                            onRetrieve={(response) => {
                                if (response.type === 'FeatureCollection' && response.features.length === 1) {
                                    const addressData = response.features[0].properties;
                                    setFieldValue('address.address', addressData.place_name);
                                    setFieldValue('address.l1', addressData.address_line1);
                                    setFieldValue('address.l2', addressData.address_line2);
                                    setFieldValue('address.city', addressData.place);
                                    setFieldValue('address.state', addressData.region);
                                    setFieldValue('address.postal_code', addressData.postcode);
                                }
                            }}
                        >
                            <OptimizedTextField
                                fullWidth
                                placeholder="Address"
                                id="address.address"
                                name="address.address"
                                value={values.address.address}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                        </AddressAutofill>
                        {touched.address?.address && errors.address?.address && (
                            <FormHelperText error id="standard-weight-helper-text--register">
                                {errors.address.address}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={3} lg={4}>
                    <InputLabel horizontal>Address L1</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                    <FormControl fullWidth error={Boolean(touched.address?.l1 && errors.address?.l1)}>
                        <OptimizedTextField
                            id="address.l1"
                            name="address.l1"
                            placeholder="Address L1"
                            value={values.address.l1}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            autocomplete="off"
                            variant="outlined"
                        />
                        {touched.address?.l1 && errors.address?.l1 && (
                            <FormHelperText error id="standard-weight-helper-text--register">
                                {errors.address?.l1}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={3} lg={4}>
                    <InputLabel horizontal>Address L2</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                    <FormControl fullWidth error={Boolean(touched.address?.l2 && errors.address?.l2)}>
                        <OptimizedTextField
                            id="address.l2"
                            name="address.l2"
                            placeholder="Address L2"
                            value={values.address.l2}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            autocomplete="off"
                            variant="outlined"
                        />
                        {touched.address?.l2 && errors.address?.l2 && (
                            <FormHelperText error id="standard-weight-helper-text--register">
                                {errors.address?.l2}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={3} lg={4}>
                    <InputLabel horizontal>City</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                    <FormControl fullWidth error={Boolean(touched.address?.city && errors.address?.city)}>
                        <OptimizedTextField
                            id="address.city"
                            name="address.city"
                            placeholder="City"
                            variant="outlined"
                            value={values.address.city}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            autocomplete="off"
                        />
                        {touched.address?.city && errors.address?.city && (
                            <FormHelperText error id="standard-weight-helper-text--register">
                                {' '}
                                {errors.address?.city}{' '}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={3} lg={4}>
                    <InputLabel horizontal>State</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                    <FormControl fullWidth error={Boolean(touched.address?.state && errors.address?.state)}>
                        <OptimizedTextField
                            id="address.state"
                            name="address.state"
                            placeholder="State"
                            variant="outlined"
                            value={values.address.state || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            autocomplete="off"
                        />
                        {touched.address?.state && errors.address?.state && (
                            <FormHelperText error id="standard-weight-helper-text--register">
                                {' '}
                                {errors.address?.state}{' '}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={3} lg={4}>
                    <InputLabel horizontal>Postal code</InputLabel>
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                    <FormControl fullWidth error={Boolean(touched.address?.postal_code && errors.address?.postal_code)}>
                        <OptimizedTextField
                            id="address.postal_code"
                            name="address.postal_code"
                            placeholder="Postal code"
                            variant="outlined"
                            value={values.address.postal_code || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            autocomplete="off"
                        />
                        {touched.address?.postal_code && errors.address?.postal_code && (
                            <FormHelperText error id="standard-weight-helper-text--register">
                                {' '}
                                {errors.address?.postal_code}{' '}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Grid>
            </Grid>
        </Grid>
    ) : null;
};

export default MapboxAddress;
