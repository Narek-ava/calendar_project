import { ICompany } from '../../models/ICompany';
import companyAPI from '../../services/CompanyService';
import useShowSnackbar from '../../hooks/useShowSnackbar';
import { useNavigate } from 'react-router';
import { useFormik } from 'formik';
import { SnackBarTypes } from '../../store/snackbarReducer';
import { Box, CardActions, CardContent, Divider, FormControl, Grid, InputAdornment } from '@material-ui/core';
import TwoColumnsSwitch from '../../ui-component/TwoColumnsSwitch';
import { LoadingButton } from '@mui/lab';
import SaveOutlined from '@material-ui/icons/SaveOutlined';
import MainCard from '../../ui-component/cards/MainCard';
import WidgetEmbedCode from './WidgetEmbedCode';
import OptimizedTextField from '../../ui-component/optimized-text-fields/OptimizedTextField';
import WidgetStyleSettings from './WidgetStyleSettings';
import WidgetLinkBuilder from './WidgetLinkBuilder';
import LabelWithInfo from '../../ui-component/LabelWithInfo';
import InfoTooltip from '../../ui-component/InfoTooltip';
import TextEditor from 'ui-component/TextEditor';

interface WidgetSettingsFormProps {
    company: ICompany;
}

const WidgetSettingsForm = ({ company }: WidgetSettingsFormProps) => {
    const [updateCompanySettings, { isLoading }] = companyAPI.useUpdateCompanySettingsMutation();

    const { showSnackbar } = useShowSnackbar();
    const navigate = useNavigate();

    const { handleSubmit, values, setFieldValue, handleChange, handleBlur, touched, errors } = useFormik({
        enableReinitialize: true,
        validateOnChange: true,
        initialValues: company.settings.widget,
        onSubmit: (formData) => {
            updateCompanySettings({ settings: { ...company.settings, widget: formData }, companyId: company.id })
                .unwrap()
                .then(() => {
                    showSnackbar({
                        message: 'Settings updated successfully',
                        alertSeverity: SnackBarTypes.Success
                    });
                    navigate('/');
                })
                .catch((e) => {
                    showSnackbar({
                        message: e.data || "Settings wasn't updated",
                        alertSeverity: SnackBarTypes.Error
                    });
                });
        }
    });

    return (
        <MainCard title="Widget Configuration" content={false}>
            <form onSubmit={handleSubmit} noValidate>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12}>
                            <Grid container>
                                <Grid item xs={12} sm={3} lg={4}>
                                    <LabelWithInfo
                                        label="Embedded Widget Code"
                                        infoText='Use this code to embed ChilledButter booking widget in your website. Copy paste to the very end of you html <body> tag. Use html element class "cb-widget-btn" for the element on your site that you want to use to trigger the widget.'
                                    />
                                </Grid>
                                <Grid item xs={12} sm={9} lg={6}>
                                    <WidgetEmbedCode slug={company.slug} />
                                </Grid>
                            </Grid>
                        </Grid>

                        <TwoColumnsSwitch
                            fieldName="is_attachments_enabled"
                            setFieldValue={setFieldValue}
                            value={values.is_attachments_enabled}
                            label="Attachments in Widget"
                            labelDecoration={
                                <InfoTooltip text="Enable to allow customers to upload attachments for their appointment via booking widget." />
                            }
                        />

                        <Grid item xs={12}>
                            <Grid container alignItems="center">
                                <Grid item xs={12} sm={3} lg={4}>
                                    <LabelWithInfo
                                        label="Confirmation Note"
                                        infoText="A global confirmation note that is send in the confirmation email to customers upon booking. Can be overridden for specific services on edit service page."
                                    />
                                </Grid>
                                <Grid item xs={12} sm={9} lg={3} xl={2}>
                                    <FormControl fullWidth>
                                        <OptimizedTextField
                                            multiline
                                            id="confirmation_note"
                                            name="confirmation_note"
                                            value={values?.confirmation_note || null}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant="outlined"
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Grid container alignItems="center">
                                <Grid item xs={12} sm={3} lg={4}>
                                    <LabelWithInfo
                                        label="Max Advance Booking, days"
                                        infoText="How far in advance can a booking be made via booking widget."
                                    />
                                </Grid>
                                <Grid item xs={12} sm={9} lg={3} xl={2}>
                                    <FormControl fullWidth>
                                        <OptimizedTextField
                                            type="number"
                                            id="max_advance_booking"
                                            name="max_advance_booking"
                                            value={values?.max_advance_booking}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            variant="outlined"
                                            InputProps={{
                                                endAdornment: (
                                                    <>
                                                        <InputAdornment position="end">Use &quot;0&quot; for no limit</InputAdornment>
                                                    </>
                                                )
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Grid container alignItems="center">
                                <Grid item xs={12} sm={3} lg={4}>
                                    <LabelWithInfo label="Deposit Text" infoText="Shown in booking widget in case is deposit required" />
                                </Grid>
                                <Grid item xs={12} sm={9} lg={8}>
                                    <FormControl fullWidth>
                                        <TextEditor
                                            setFieldValue={(val) => setFieldValue('deposit_text', val)}
                                            value={values?.deposit_text ?? ''}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Box mt={2} mb={3}>
                                <Divider />
                            </Box>
                            <WidgetLinkBuilder links={values.link_builder} setFieldValue={setFieldValue} company={company} />
                            <Box mt={3} mb={2}>
                                <Divider />
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <WidgetStyleSettings
                                values={values}
                                handleChange={handleChange}
                                touched={touched}
                                errors={errors}
                                setFieldValue={setFieldValue}
                            />
                        </Grid>
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

export default WidgetSettingsForm;
