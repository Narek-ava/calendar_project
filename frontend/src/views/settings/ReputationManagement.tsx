import LabelWithInfo from '../../ui-component/LabelWithInfo';
import OptimizedTextField from '../../ui-component/optimized-text-fields/OptimizedTextField';
import { FormikErrors, FormikTouched } from 'formik';
import { MenuItem, Select, SelectChangeEvent, InputLabel, FormControl, FormHelperText, Grid } from '@mui/material';
import * as React from 'react';
import { ICompanySettings } from '../../models/ICompany';

interface ReputationManagementProps {
    values: ICompanySettings;
    errors: FormikErrors<ICompanySettings>;
    touched: FormikTouched<ICompanySettings>;
    handleChange: (event: SelectChangeEvent) => void;
    handleBlur: (e: React.FocusEvent<any>) => void;
}

const ReputationManagement = ({ values, errors, touched, handleChange, handleBlur }: ReputationManagementProps) => {
    const options = [
        { value: 'gradeus', label: 'Grade.us' },
        { value: 'reviewshake', label: 'Reviewshake' }
    ];

    return (
        <>
            <Grid item xs={12} sm={3} lg={4}>
                <LabelWithInfo
                    label="Reputation Management"
                    infoText="Select service for reputation management and enter necessary credentials. Only one service can be active at a time."
                />
            </Grid>

            <Grid item xs={12} sm={9} lg={6}>
                <FormControl
                    fullWidth
                    error={Boolean(touched.integrations?.reputation_management && errors.integrations?.reputation_management)}
                >
                    <Select
                        name="integrations.reputation_management"
                        value={values.integrations.reputation_management}
                        onChange={handleChange}
                    >
                        {options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.integrations?.reputation_management && (
                        <FormHelperText error id="error-reputation-management">
                            {errors.integrations?.reputation_management}
                        </FormHelperText>
                    )}
                </FormControl>
            </Grid>

            {values.integrations?.reputation_management === 'gradeus' && (
                <>
                    <Grid item xs={12} sm={3} lg={4}>
                        <InputLabel>GradeUs API Key</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth error={Boolean(errors.integrations?.gradeus?.api_key)}>
                            <OptimizedTextField
                                id="integrations.gradeus.api_key"
                                name="integrations.gradeus.api_key"
                                placeholder="API key"
                                value={values?.integrations?.gradeus?.api_key}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autocomplete="off"
                                variant="outlined"
                            />
                            {errors.integrations?.gradeus?.api_key && (
                                <FormHelperText error id="error-gradeus-api-key">
                                    {errors.integrations?.gradeus?.api_key}
                                </FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={3} lg={4}>
                        <InputLabel>GradeUs Profile ID</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth error={Boolean(errors.integrations?.gradeus?.profile_id)}>
                            <OptimizedTextField
                                id="integrations.gradeus.profile_id"
                                name="integrations.gradeus.profile_id"
                                placeholder="Profile ID"
                                value={values?.integrations?.gradeus?.profile_id}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autocomplete="off"
                                variant="outlined"
                            />
                            {errors.integrations?.gradeus?.profile_id && (
                                <FormHelperText error id="error-gradeus-profile-id">
                                    {errors.integrations?.gradeus?.profile_id}
                                </FormHelperText>
                            )}
                        </FormControl>
                    </Grid>
                </>
            )}

            {values.integrations?.reputation_management === 'reviewshake' && (
                <>
                    <Grid item xs={12} sm={3} lg={4}>
                        <InputLabel>Reviewshake API Key</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth error={Boolean(errors.integrations?.reviewshake?.api_key)}>
                            <OptimizedTextField
                                id="integrations.reviewshake.api_key"
                                name="integrations.reviewshake.api_key"
                                placeholder="6be02cc7c55b789f290e"
                                value={values?.integrations?.reviewshake?.api_key}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autocomplete="off"
                                variant="outlined"
                            />
                            {errors.integrations?.reviewshake?.api_key && (
                                <FormHelperText error id="error-reviewshake-api-key">
                                    {errors.integrations?.reviewshake?.api_key}
                                </FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={3} lg={4}>
                        <InputLabel>Reviewshake Subdomain</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth error={Boolean(errors.integrations?.reviewshake?.subdomain)}>
                            <OptimizedTextField
                                id="integrations.reviewshake.subdomain"
                                name="integrations.reviewshake.subdomain"
                                placeholder="chilledbutter"
                                value={values?.integrations?.reviewshake?.subdomain}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autocomplete="off"
                                variant="outlined"
                            />
                            {errors.integrations?.reviewshake?.subdomain && (
                                <FormHelperText error id="error-reviewshake-subdomain">
                                    {errors.integrations?.reviewshake?.subdomain}
                                </FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={3} lg={4}>
                        <InputLabel>Reviewshake Custom Domain</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth error={Boolean(errors.integrations?.reviewshake?.custom_domain)}>
                            <OptimizedTextField
                                id="integrations.reviewshake.custom_domain"
                                name="integrations.reviewshake.custom_domain"
                                placeholder="https://reviews.cbtr.me"
                                value={values?.integrations?.reviewshake?.custom_domain}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autocomplete="off"
                                variant="outlined"
                            />
                            {errors.integrations?.reviewshake?.custom_domain && (
                                <FormHelperText error id="error-reviewshake-custom_domain">
                                    {errors.integrations?.reviewshake?.custom_domain}
                                </FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={3} lg={4}>
                        <InputLabel>Reviewshake Campaign</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth error={Boolean(errors.integrations?.reviewshake?.campaign)}>
                            <OptimizedTextField
                                id="integrations.reviewshake.campaign"
                                name="integrations.reviewshake.campaign"
                                placeholder="Default"
                                value={values?.integrations?.reviewshake?.campaign}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autocomplete="off"
                                variant="outlined"
                            />
                            {errors.integrations?.reviewshake?.campaign && (
                                <FormHelperText error id="error-reviewshake-campaign">
                                    {errors.integrations?.reviewshake?.campaign}
                                </FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={3} lg={4}>
                        <InputLabel>Reviewshake Client</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth error={Boolean(errors.integrations?.reviewshake?.client)}>
                            <OptimizedTextField
                                id="integrations.reviewshake.client"
                                name="integrations.reviewshake.client"
                                placeholder="Chilled Butter"
                                value={values?.integrations?.reviewshake?.client}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autocomplete="off"
                                variant="outlined"
                            />
                            {errors.integrations?.reviewshake?.client && (
                                <FormHelperText error id="error-reviewshake-client">
                                    {errors.integrations?.reviewshake?.client}
                                </FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={3} lg={4}>
                        <InputLabel>Reviewshake Location Slug</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth error={Boolean(errors.integrations?.reviewshake?.location_slug)}>
                            <OptimizedTextField
                                id="integrations.reviewshake.location_slug"
                                name="integrations.reviewshake.location_slug"
                                placeholder="location-slug"
                                value={values?.integrations?.reviewshake?.location_slug}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autocomplete="off"
                                variant="outlined"
                            />
                            {errors.integrations?.reviewshake?.location_slug && (
                                <FormHelperText error id="error-reviewshake-location_slug">
                                    {errors.integrations?.reviewshake?.location_slug}
                                </FormHelperText>
                            )}
                        </FormControl>
                    </Grid>
                </>
            )}
        </>
    );
};
export default ReputationManagement;
