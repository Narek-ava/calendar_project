import React from 'react';
import MainCard from '../../ui-component/cards/MainCard';
import { CardActions, CardContent, Divider, FormControl, FormHelperText, Grid, InputAdornment, Link, Typography } from '@material-ui/core';
import { useFormik } from 'formik';
import TwoColumnsSwitch from '../../ui-component/TwoColumnsSwitch';
import OptimizedNumberField from '../../ui-component/optimized-text-fields/OptimizedNumberField';
import { ICompany } from '../../models/ICompany';
import InputLabel from '../../ui-component/extended/Form/InputLabel';
import OptimizedTextField from '../../ui-component/optimized-text-fields/OptimizedTextField';
import SaveOutlined from '@material-ui/icons/SaveOutlined';
import { LoadingButton } from '@mui/lab';
import companyAPI from '../../services/CompanyService';
import useShowSnackbar from '../../hooks/useShowSnackbar';
import { SnackBarTypes } from '../../store/snackbarReducer';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';
import InfoTooltip from '../../ui-component/InfoTooltip';
import LabelWithInfo from '../../ui-component/LabelWithInfo';
import ReputationManagement from './ReputationManagement';
import CCProcessors from './CCProcessors';

interface SettingsFormProps {
    company: ICompany;
}

const SettingsForm = ({ company }: SettingsFormProps) => {
    const [updateCompanySettings, { isLoading }] = companyAPI.useUpdateCompanySettingsMutation();
    const { showSnackbar } = useShowSnackbar();
    const navigate = useNavigate();

    const { handleSubmit, values, setFieldValue, handleChange, handleBlur, touched, errors, setFieldError } = useFormik({
        enableReinitialize: true,
        validateOnChange: true,
        validateOnBlur: false,
        initialValues: company.settings,
        validationSchema: Yup.object().shape({
            notifications: Yup.object().shape({
                enabled: Yup.boolean().nullable(),
                immediately_sms_notify: Yup.boolean().nullable()
            }),
            appointments: Yup.object().shape({
                no_show_deposit: Yup.object().shape({
                    enabled: Yup.boolean().required('Required field'),
                    percent: Yup.number().when('enabled', {
                        is: true,
                        then: Yup.number().min(1, 'Minimum value is 1').max(100, 'Maximum value is 100'),
                        otherwise: Yup.number().nullable()
                    })
                })
            }),
            integrations: Yup.object().shape({
                reputation_management: Yup.string().required('Reputation management is required'),
                gradeus: Yup.object().shape({
                    api_key: Yup.string().nullable(),
                    profile_id: Yup.string().nullable()
                }),
                reviewshake: Yup.object().shape({
                    api_key: Yup.string().nullable(),
                    custom_domain: Yup.string().nullable(),
                    subdomain: Yup.string().nullable(),
                    campaign: Yup.string().nullable(),
                    client: Yup.string().nullable(),
                    location_slug: Yup.string().nullable()
                }),
                paypal: Yup.object().shape({
                    client_id: Yup.string().nullable(),
                    client_secret: Yup.string().nullable()
                }),
                cc_processor: Yup.string().required('CC processor is required'),
                authorize_net: Yup.object().shape({
                    api_login_id: Yup.string().nullable(),
                    transaction_key: Yup.string().nullable()
                }),
                stripe: Yup.object().shape({
                    secret_key: Yup.string().nullable(),
                    publishable_key: Yup.string().nullable()
                }),
                twilio: Yup.object().shape({
                    auth_token: Yup.string().nullable(),
                    account_sid: Yup.string().nullable()
                })
            })
        }),
        onSubmit: (formData) => {
            updateCompanySettings({ settings: formData, companyId: company.id })
                .unwrap()
                .then(() => {
                    showSnackbar({
                        message: 'Settings updated successfully',
                        alertSeverity: SnackBarTypes.Success
                    });
                    navigate('/');
                })
                .catch((e) => {
                    if (e.errors) {
                        Object.keys(e.errors).forEach((key) => {
                            const fieldName = key.replace('settings.', '');
                            setFieldError(fieldName, e.errors[key]);
                            // setFieldTouched(fieldName, true);
                        });
                    }
                    showSnackbar({
                        message: e.data || "Settings wasn't updated",
                        alertSeverity: SnackBarTypes.Error
                    });
                });
        }
    });

    return (
        <MainCard title="Organization Settings" content={false}>
            <form onSubmit={handleSubmit} noValidate>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12}>
                            <Typography variant="h4" color="primary">
                                Notifications
                            </Typography>
                        </Grid>
                        <TwoColumnsSwitch
                            fieldName="notifications.enabled"
                            setFieldValue={setFieldValue}
                            value={values.notifications.enabled}
                            label="Enable notifications"
                            labelDecoration={
                                <InfoTooltip text="Globally toggle all notifications in the system sent to providers and customers." />
                            }
                        />
                        <TwoColumnsSwitch
                            fieldName="notifications.immediately_sms_notify"
                            setFieldValue={setFieldValue}
                            value={values.notifications.immediately_sms_notify}
                            label="Appointment created SMS notifications for provider"
                            labelDecoration={
                                <InfoTooltip text="Provider gets SMS notification every time new appointment is booked with him. Can be disabled to save SMS traffic." />
                            }
                        />
                        <TwoColumnsSwitch
                            fieldName="appointments.completed_notify_customers"
                            setFieldValue={setFieldValue}
                            value={values.appointments.completed_notify_customers}
                            label="Appointment closed notification to customer"
                            labelDecoration={
                                <InfoTooltip text="Customer gets notification when appointment is closed either automatically or by staff member." />
                            }
                        />
                        <Grid item xs={12}>
                            <Typography variant="h4" color="primary">
                                Appointments
                            </Typography>
                        </Grid>
                        <TwoColumnsSwitch
                            fieldName="appointments.autocomplete.enabled"
                            setFieldValue={setFieldValue}
                            value={values.appointments.autocomplete.enabled}
                            label="Automatically close appointments"
                            labelDecoration={
                                <InfoTooltip text="If enabled, appointments get automatically closed after a certain amount of time passes (set below). It is important to close appointments in order to keep track of cashflow. Incomplete appointments are not accounted for in financial reports. When appointment is closed automatically, a payment record is automatically generated to balance the service cost. This is useful when you have static service prices, e.g. haircut." />
                            }
                        />
                        {values.appointments.autocomplete.enabled && (
                            <>
                                <Grid item xs={12} sm={3} lg={4}>
                                    <LabelWithInfo
                                        label="Appointment closure interval, hours"
                                        infoText="The amount of time to pass after completion of appointment when it gets closed automatically."
                                    />
                                </Grid>
                                <Grid item xs={12} sm={9} lg={6}>
                                    <FormControl
                                        fullWidth
                                        error={Boolean(
                                            touched.appointments?.autocomplete?.interval && errors.appointments?.autocomplete?.interval
                                        )}
                                    >
                                        <OptimizedNumberField
                                            id="appointments.autocomplete.interval"
                                            name="appointments.autocomplete.interval"
                                            value={values.appointments.autocomplete.interval}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            InputProps={{
                                                startAdornment: (
                                                    <>
                                                        <InputAdornment position="start">Hours</InputAdornment>
                                                        <Divider sx={{ height: 28, m: 0.5, mr: 1.5 }} orientation="vertical" />
                                                    </>
                                                )
                                            }}
                                        />
                                        {touched.appointments?.autocomplete?.interval && errors.appointments?.autocomplete?.interval && (
                                            <FormHelperText error id="error-appointment-autocomplete-interval">
                                                {errors.appointments?.autocomplete?.interval}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                            </>
                        )}
                        <TwoColumnsSwitch
                            fieldName="appointments.no_show_deposit.enabled"
                            setFieldValue={setFieldValue}
                            value={values.appointments.no_show_deposit.enabled}
                            label="Enable no show deposit"
                            labelDecoration={
                                <InfoTooltip text="When enabled, for customers who had a no show for their previous appointment, it is required to leave a deposit for their next booking of a paid service, even if the payment type for this service is normally not 'deposit required'. The amount of deposit is set below in percentage from total service price. The requirement is only applied to the next booking, and only if the previous booking of a customer was a no show. As soon as the customer attends their next reservation, the deposit requirement is lifted, and normal service payment type settings are applied." />
                            }
                        />
                        {values.appointments.no_show_deposit.enabled && (
                            <>
                                <Grid item xs={12} sm={3} lg={4}>
                                    <InputLabel horizontal>No show deposit</InputLabel>
                                </Grid>
                                <Grid item xs={12} sm={9} lg={6}>
                                    <FormControl
                                        fullWidth
                                        error={Boolean(
                                            touched.appointments?.no_show_deposit?.percent && errors.appointments?.no_show_deposit?.percent
                                        )}
                                    >
                                        <OptimizedNumberField
                                            id="appointments.no_show_deposit.percent"
                                            name="appointments.no_show_deposit.percent"
                                            value={values.appointments.no_show_deposit.percent}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            InputProps={{
                                                startAdornment: (
                                                    <>
                                                        <InputAdornment position="start">%</InputAdornment>
                                                        <Divider sx={{ height: 28, m: 0.5, mr: 1.5 }} orientation="vertical" />
                                                    </>
                                                )
                                            }}
                                        />
                                        {touched.appointments?.no_show_deposit?.percent && errors.appointments?.no_show_deposit?.percent && (
                                            <FormHelperText error id="error-no-show-percent">
                                                {errors.appointments?.no_show_deposit?.percent}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                            </>
                        )}
                        <Grid item xs={12}>
                            <Typography variant="h4" color="primary">
                                Intergrations
                            </Typography>
                        </Grid>
                        <ReputationManagement
                            values={values}
                            errors={errors}
                            touched={touched}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                        />

                        <Grid item xs={12}>
                            <Divider />
                        </Grid>

                        <CCProcessors
                            values={values}
                            errors={errors}
                            touched={touched}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                        />

                        <Grid item xs={12}>
                            <Divider />
                        </Grid>

                        <Grid item xs={12} sm={3} lg={4}>
                            <LabelWithInfo
                                label="PayPal Client ID"
                                infoText="Fill in to accept paypal payments through booking widget. Credentials should be valid and live in to have paypal payment choice visible in widget."
                            />
                        </Grid>
                        <Grid item xs={12} sm={9} lg={6}>
                            <FormControl fullWidth>
                                <OptimizedTextField
                                    id="integrations.paypal.client_id"
                                    name="integrations.paypal.client_id"
                                    placeholder="Client ID"
                                    value={values?.integrations?.paypal?.client_id}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    autocomplete="off"
                                    variant="outlined"
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={3} lg={4}>
                            <InputLabel horizontal>PayPal Client Secret</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={6}>
                            <FormControl fullWidth>
                                <OptimizedTextField
                                    id="integrations.paypal.client_secret"
                                    name="integrations.paypal.client_secret"
                                    placeholder="Client Secret"
                                    value={values?.integrations?.paypal?.client_secret}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    autocomplete="off"
                                    variant="outlined"
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider />
                        </Grid>

                        {company.is_twilio_enabled && (
                            <>
                                <Grid item xs={12} sm={3} lg={4}>
                                    <LabelWithInfo
                                        label="Twilio Auth Token"
                                        infoText="Please fill out you Twilio account credentials to have the system send SMS notifications to customers and staff."
                                    />
                                </Grid>
                                <Grid item xs={12} sm={9} lg={6}>
                                    <FormControl fullWidth>
                                        <OptimizedTextField
                                            id="integrations.twilio.auth_token"
                                            name="integrations.twilio.auth_token"
                                            placeholder="Auth Token"
                                            value={values?.integrations?.twilio?.auth_token}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            autocomplete="off"
                                            variant="outlined"
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={3} lg={4}>
                                    <InputLabel horizontal>Twilio Account SID</InputLabel>
                                </Grid>
                                <Grid item xs={12} sm={9} lg={6}>
                                    <FormControl fullWidth>
                                        <OptimizedTextField
                                            id="integrations.twilio.account_sid"
                                            name="integrations.twilio.account_sid"
                                            placeholder="Account SID"
                                            value={values?.integrations?.twilio?.account_sid}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            autocomplete="off"
                                            variant="outlined"
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider />
                                </Grid>
                            </>
                        )}
                        <Grid item xs={12}>
                            <Typography variant="h4" color="primary" display="flex" alignItems="center">
                                Kiosk App
                                <InfoTooltip text="Use these links to enable self check-in functionality for customers at specific location. Simply follow the location-specific link on the tablet or other device you are using which has internet access. Provider will get SMS notification upon customer check-in." />
                            </Typography>
                        </Grid>
                        {company.locations?.map((location) => (
                            <React.Fragment key={location.id}>
                                <Grid item xs={12} sm={3} lg={4}>
                                    {location.name}
                                </Grid>
                                <Grid item xs={12} sm={9} lg={6}>
                                    <Link href={location.kioskUrlShort} target="_blank">
                                        {location.kioskUrlShort}
                                    </Link>
                                </Grid>
                            </React.Fragment>
                        ))}
                    </Grid>
                </CardContent>
                <Divider />
                <CardActions>
                    <LoadingButton
                        loading={isLoading}
                        loadingPosition="start"
                        type="submit"
                        color="primary"
                        startIcon={<SaveOutlined />}
                        variant="contained"
                    >
                        Save
                    </LoadingButton>
                </CardActions>
            </form>
        </MainCard>
    );
};

export default SettingsForm;
