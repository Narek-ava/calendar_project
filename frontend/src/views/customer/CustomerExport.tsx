import { useCallback } from 'react';
import fileDownload from 'js-file-download';
import { Form, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { Moment } from 'moment-timezone';

// mui
import { CardContent, Grid } from '@mui/material';
import { Button, CardActions, Theme, useMediaQuery } from '@material-ui/core';

// project imports
import { apiReportDateFormat } from '../../store/constant';
import { axiosServices } from '../../utils/axios';
import { SnackBarTypes } from '../../store/snackbarReducer';
import { SNACKBAR_OPEN } from '../../store/actions';
import { useAppDispatch } from '../../hooks/redux';
import { TPickerValue } from '../../ui-component/date-range-picker/types';
import CustomRangePicker from '../../ui-component/date-range-picker/CustomRangePicker';

const CustomerExport = () => {
    const dispatch = useAppDispatch();
    const isResponsive = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('md'));

    const formik = useFormik({
        enableReinitialize: true,
        validateOnBlur: true,
        initialValues: {
            start: null as TPickerValue,
            end: null as TPickerValue
        },
        validationSchema: Yup.object().shape({
            start: Yup.object().nullable(),
            end: Yup.object().nullable()
        }),
        onSubmit: (formData, { setSubmitting }) => {
            try {
                setSubmitting(true);
                const params = new URLSearchParams({});
                if (formData.start) {
                    params.set('filters[date_from]', formData.start.format(apiReportDateFormat));
                }
                if (formData.end) {
                    params.set('filters[date_to]', formData.end.format(apiReportDateFormat));
                }
                axiosServices
                    .get(`customers/export`, { params })
                    .then((res) => {
                        setSubmitting(false);
                        fileDownload(res.data, `report_${Date.now()}.csv`);
                    })
                    .catch((e: Error) => {
                        showSnackbar({
                            message: e.message,
                            alertSeverity: SnackBarTypes.Error
                        });
                        setSubmitting(false);
                    });
            } catch (e) {
                setSubmitting(false);
            }
        }
    });

    const { values, handleSubmit, setFieldValue, isSubmitting } = formik;

    const showSnackbar = ({ alertSeverity, message }: { alertSeverity: SnackBarTypes; message: string }) => {
        dispatch({
            type: SNACKBAR_OPEN,
            open: true,
            message,
            variant: 'alert',
            alertSeverity,
            anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
    };

    const setStart = useCallback((data: Moment | null) => {
        setFieldValue('start', data);
    }, []);

    const setEnd = useCallback((data: Moment | null) => {
        setFieldValue('end', data);
    }, []);

    return (
        <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12}>
                            <CustomRangePicker
                                start={values.start}
                                end={values.end}
                                setStart={setStart}
                                setEnd={setEnd}
                                isResponsive={isResponsive}
                                disableFuture
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions>
                    <Grid container spacing={1}>
                        <Grid item>
                            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                                Download CSV
                            </Button>
                        </Grid>
                    </Grid>
                </CardActions>
            </Form>
        </FormikProvider>
    );
};

export default CustomerExport;
