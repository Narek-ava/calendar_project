import fileDownload from 'js-file-download';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { map } from 'lodash';

// mui
import {
    CardContent,
    FormControl,
    Grid,
    MenuItem,
    Select,
    Stack,
    Checkbox,
    TextField,
    Autocomplete,
    Button,
    CardActions,
    FormHelperText,
    IconButton,
    InputAdornment
} from '@mui/material';
import { useMediaQuery } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';

// project imports
import { apiReportDateFormat, gridSpacing } from '../../store/constant';
import InputGridLabel from '../../ui-component/extended/Form/InputLabel';
import { ILocation } from '../../models/ILocation';
import { axiosServices } from '../../utils/axios';
import { SnackBarTypes } from '../../store/snackbarReducer';
import { IEmployee } from '../../models/IEmployee';
import useShowSnackbar from '../../hooks/useShowSnackbar';
import moment from 'moment';
import { MobileDatePicker, LocalizationProvider } from '@mui/lab';
import MomentAdapter from '@mui/lab/AdapterMoment';
import Close from '@material-ui/icons/Close';

interface ReportsFormProps {
    locations: ILocation[];
    staff: IEmployee[];
    company_id: number;
}

const ReportsForm = ({ locations, company_id, staff }: ReportsFormProps) => {
    const matchMd = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('md'));
    const { showSnackbar } = useShowSnackbar();

    const { handleSubmit, values, touched, errors, setFieldTouched, setFieldValue, handleBlur, isSubmitting } = useFormik({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues: {
            selectedLocations: locations,
            selectedStaff: staff,
            report_type: 'service_balance',
            date_from: null,
            date_to: null
        },
        validationSchema: Yup.object().shape({
            report_type: Yup.string(),
            date_to: Yup.date().nullable().min(Yup.ref('date_from'), 'End date cannot be earlier than start date'),
            selectedLocations: Yup.array().of(Yup.object()).required().min(1).label('Locations'),
            selectedStaff: Yup.array().of(Yup.object()).nullable()
        }),
        onSubmit: (formData, { setSubmitting }) => {
            setSubmitting(true);
            const params = new URLSearchParams({});

            params.set('filters[report_type]', formData.report_type);

            if (formData.date_from) {
                params.set('filters[date_from]', moment(formData.date_from).format(apiReportDateFormat));
            }

            if (formData.date_to) {
                params.set('filters[date_to]', moment(formData.date_to).format(apiReportDateFormat));
            }

            if (formData.selectedLocations.length > 0) {
                params.set('filters[locations]', map(formData.selectedLocations, 'id').join());
            }
            if (formData.selectedStaff.length > 0) {
                params.set('filters[employees]', map(formData.selectedStaff, 'id').join());
            }

            axiosServices
                .get(`companies/${company_id}/report`, { params })
                .then((res) => fileDownload(res.data, `appointments-${formData.report_type}-report-${Date.now()}.csv`))
                .catch((e: Error) => showSnackbar({ message: e.message, alertSeverity: SnackBarTypes.Error }))
                .finally(() => setSubmitting(false));
        }
    });

    const handleChangeStaff = (value: IEmployee[]) => {
        setFieldValue('selectedStaff', value);
    };

    return (
        <form noValidate onSubmit={handleSubmit}>
            <CardContent>
                <Grid container alignItems="center" spacing={gridSpacing}>
                    <Grid item xs={12} sm={3} lg={4}>
                        <InputGridLabel horizontal>Type</InputGridLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <Stack direction={matchMd ? 'column' : 'row'} alignItems={matchMd ? undefined : 'center'} spacing={2}>
                            <FormControl sx={{ minWidth: '230px' }}>
                                <Select value={values.report_type} onChange={(e) => setFieldValue('report_type', e.target.value)}>
                                    <MenuItem value="service_balance">Service Balance Report</MenuItem>
                                    <MenuItem value="detailed_transactions">Detailed Transactions Report</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} sm={3} lg={4}>
                        <InputGridLabel horizontal>Report time</InputGridLabel>
                    </Grid>

                    <Grid item xs={12} sm={9} lg={6}>
                        <LocalizationProvider dateAdapter={MomentAdapter}>
                            <Stack alignItems="center" flexDirection="row" gap={2}>
                                <FormControl fullWidth error={!!(touched.date_from && errors.date_from)}>
                                    <MobileDatePicker
                                        inputFormat="MM/DD/YY"
                                        mask="MM/DD/YY"
                                        value={values.date_from}
                                        onChange={(value) => {
                                            if (value) {
                                                console.log(value);
                                                setFieldValue('date_from', value);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Select date"
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() => {
                                                                    setFieldValue('date_from', null);
                                                                }}
                                                            >
                                                                <Close />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        )}
                                        disableCloseOnSelect={false}
                                    />
                                </FormControl>
                                <span>To</span>
                                <FormControl fullWidth error={!!(touched.date_to && errors.date_to)}>
                                    <MobileDatePicker
                                        minDate={values.date_from || null}
                                        inputFormat="MM/DD/YY"
                                        mask="MM/DD/YY"
                                        value={values.date_to}
                                        onChange={(value) => {
                                            if (value) {
                                                console.log(value);
                                                setFieldValue('date_to', value);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Select date"
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() => {
                                                                    setFieldValue('date_to', null);
                                                                }}
                                                            >
                                                                <Close />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        )}
                                        disableCloseOnSelect={false}
                                    />
                                </FormControl>
                            </Stack>
                            {touched.date_from && errors.date_from && (
                                <FormHelperText error id="date-from-errors">
                                    {errors.date_from}
                                </FormHelperText>
                            )}
                            {touched.date_to && errors.date_to && (
                                <FormHelperText error id="date-from-errors">
                                    {errors.date_to}
                                </FormHelperText>
                            )}
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} sm={3} lg={4}>
                        <InputGridLabel horizontal>Locations</InputGridLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth error={Boolean(touched.selectedLocations && errors.selectedLocations)}>
                            <>
                                <Autocomplete
                                    multiple
                                    id="checkboxes-tags-locations"
                                    options={locations}
                                    value={values.selectedLocations}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    disableCloseOnSelect
                                    getOptionLabel={(option) => option.name}
                                    onBlur={(e) => {
                                        setFieldTouched('selectedLocations');
                                        handleBlur(e);
                                    }}
                                    onChange={(event, value) => {
                                        setFieldTouched('selectedLocations');
                                        setFieldValue('selectedLocations', value);
                                    }}
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                            <Checkbox style={{ marginRight: 8 }} checked={selected} />
                                            {option.name}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField {...params} placeholder={values.selectedLocations?.length ? undefined : 'Locations'} />
                                    )}
                                />
                                {touched.selectedLocations && errors.selectedLocations && (
                                    <FormHelperText error id="locations-errors">
                                        {errors.selectedLocations}
                                    </FormHelperText>
                                )}
                            </>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3} lg={4}>
                        <InputGridLabel horizontal>Staff</InputGridLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                        <FormControl fullWidth error={Boolean(touched.selectedStaff && errors.selectedStaff)}>
                            <>
                                <Autocomplete
                                    multiple
                                    id="checkboxes-tags-employees"
                                    options={staff}
                                    value={values.selectedStaff}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    disableCloseOnSelect
                                    getOptionLabel={(option) => `${option.user.firstname} ${option.user.lastname}`}
                                    onBlur={(e) => {
                                        setFieldTouched('employees');
                                        handleBlur(e);
                                    }}
                                    onChange={(e, value, reason) => {
                                        setFieldTouched('employees');
                                        handleChangeStaff(value);
                                    }}
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                            <Checkbox style={{ marginRight: 8 }} checked={selected} />
                                            {option.user.firstname} {option.user.lastname}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField {...params} placeholder={values.selectedStaff?.length ? undefined : 'Staff'} />
                                    )}
                                />
                                {touched.selectedStaff && errors.selectedStaff && (
                                    <FormHelperText error id="staff-errors">
                                        {errors.selectedStaff}
                                    </FormHelperText>
                                )}
                            </>
                        </FormControl>
                    </Grid>
                </Grid>
            </CardContent>
            <CardActions>
                <Grid container spacing={1}>
                    <Grid item>
                        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                            Generate Report
                        </Button>
                    </Grid>
                </Grid>
            </CardActions>
        </form>
    );
};

export default ReportsForm;
