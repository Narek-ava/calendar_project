import LabelWithInfo from '../../ui-component/LabelWithInfo';
import OptimizedTextField from '../../ui-component/optimized-text-fields/OptimizedTextField';
import { FormikErrors, FormikTouched } from 'formik';
import { MenuItem, Select, SelectChangeEvent, InputLabel, FormControl, FormHelperText, Grid } from '@mui/material';
import * as React from 'react';
import { ICompanySettings } from '../../models/ICompany';
import { Link } from '@material-ui/core';

interface CCProcessorsProps {
    values: ICompanySettings;
    errors: FormikErrors<ICompanySettings>;
    touched: FormikTouched<ICompanySettings>;
    handleChange: (event: SelectChangeEvent) => void;
    handleBlur: (e: React.FocusEvent<any>) => void;
}

const CCProcessors = ({ values, errors, touched, handleChange, handleBlur }: CCProcessorsProps) => {
    const options = [
        { value: 'stripe', label: 'Stripe' },
        { value: 'authorize_net', label: 'Authorize.net' }
    ];

    return (
        <>
            <Grid item xs={12} sm={3} lg={4}>
                <LabelWithInfo
                    label="CC Processor"
                    infoText="Select payment processor for CC payments. Credentials should be valid and in live mode in order to have payment option visible in widget."
                />
            </Grid>

            <Grid item xs={12} sm={9} lg={6}>
                <FormControl fullWidth error={Boolean(touched.integrations?.cc_processor && errors.integrations?.cc_processor)}>
                    <Select name="integrations.cc_processor" value={values.integrations.cc_processor} onChange={handleChange}>
                        {options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.integrations?.cc_processor && (
                        <FormHelperText error id="error-cc-processor">
                            {errors.integrations?.cc_processor}
                        </FormHelperText>
                    )}
                </FormControl>
            </Grid>

            {values.integrations?.cc_processor === 'stripe' && (
                <>
                    <Grid item xs={12} sm={3} lg={4}>
                        <LabelWithInfo
                            label="Stripe Secret Key"
                            infoText="Fill in to accept payments using Stripe. Credentials should be valid and live in to have stripe payment choice visible in widget."
                        />
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth>
                            <OptimizedTextField
                                id="integrations.stripe.secret_key"
                                name="integrations.stripe.secret_key"
                                placeholder="Secret Key"
                                value={values?.integrations?.stripe?.secret_key}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autocomplete="off"
                                variant="outlined"
                            />
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={3} lg={4}>
                        <InputLabel>Stripe Publishable Key</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth>
                            <OptimizedTextField
                                id="integrations.stripe.publishable_key"
                                name="integrations.stripe.publishable_key"
                                placeholder="Publishable Key"
                                value={values?.integrations?.stripe?.publishable_key}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autocomplete="off"
                                variant="outlined"
                            />
                        </FormControl>
                    </Grid>
                </>
            )}

            {values.integrations?.cc_processor === 'authorize_net' && (
                <>
                    <Grid item xs={12} sm={3} lg={4}>
                        <LabelWithInfo
                            label="Authorize.net API Login ID"
                            infoText={
                                <>
                                    Fill in to accept CC payments using{' '}
                                    <Link href="https://www.authorize.net/" target="_blank">
                                        Authorize.net
                                    </Link>{' '}
                                    account. Credentials should be valid and live in to have CC payment choice visible in widget.
                                </>
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth>
                            <OptimizedTextField
                                id="integrations.authorize_net.api_login_id"
                                name="integrations.authorize_net.api_login_id"
                                placeholder="API Login ID"
                                value={values?.integrations?.authorize_net?.api_login_id}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autocomplete="off"
                                variant="outlined"
                            />
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={3} lg={4}>
                        <InputLabel>Authorize.net Transaction Key</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth>
                            <OptimizedTextField
                                id="integrations.authorize_net.transaction_key"
                                name="integrations.authorize_net.transaction_key"
                                placeholder="Transaction Key"
                                value={values?.integrations?.authorize_net?.transaction_key}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autocomplete="off"
                                variant="outlined"
                            />
                        </FormControl>
                    </Grid>
                </>
            )}
        </>
    );
};
export default CCProcessors;
