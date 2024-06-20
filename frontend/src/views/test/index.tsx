// material-ui
import { Button, CardActions, CardContent, Divider, FormHelperText, Grid, TextField } from '@material-ui/core';

import AdapterLuxon from '@material-ui/lab/AdapterLuxon';
import { DateTime } from 'luxon';
import DateTimePicker from '@material-ui/lab/DateTimePicker';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';

import { ErrorMessage, Form, FormikProvider, useFormik } from 'formik';
import React from 'react';

// third-party
import * as Yup from 'yup';
import InputLabel from '../../ui-component/extended/Form/InputLabel';

const TestForm: React.FC = () => {
    const initialDateTimeString = '2022-06-19T17:00:00.000000Z';

    // Test zones
    // const locationTimezone = 'Europe/Moscow'; // UTC+3
    const locationTimezone = 'America/Chicago'; // UTC-5
    // const locationTimezone = 'Asia/Omsk'; // UTC+6
    // const locationTimezone = 'Pacific/Majuro'; // UTC+12
    // const locationTimezone = 'America/Adak'; // UTC-9

    const dbDatetime = DateTime.fromISO(initialDateTimeString, { zone: 'utc' });
    const rezoned = dbDatetime.setZone(locationTimezone);

    console.log(dbDatetime);
    console.log(dbDatetime.zoneName);
    console.log(dbDatetime.toISO());
    console.log(dbDatetime.toFormat('ff'));

    console.log('---------');
    console.log('rezoned');
    console.log(rezoned);
    console.log(rezoned.zoneName);
    console.log(rezoned.toISO());
    console.log(rezoned.toFormat('ff'));

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            myDate: DateTime.fromISO(initialDateTimeString, { zone: 'utc' }).setZone(locationTimezone)
        },
        validationSchema: Yup.object().shape({
            myDate: Yup.date().required().label('My Date').typeError('Date is not valid')
        }),
        onSubmit: (formData) => {
            console.log(formData.myDate);
            const UTCDateInDB = formData.myDate.toUTC().toFormat('yyyy-MM-dd HH:mm:00');

            alert(`To server: ${formData.myDate} \n\n in db will be: ${UTCDateInDB}`);
        }
    });

    const { values, errors, handleSubmit, setFieldValue } = formik;

    return (
        <Grid>
            Timezone of location: {locationTimezone}
            <FormikProvider value={formik}>
                <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12}>
                                <Grid container spacing={2} alignItems="flex-start">
                                    <Grid item xs={12} lg={4}>
                                        <InputLabel>My Date</InputLabel>
                                        <LocalizationProvider dateAdapter={AdapterLuxon}>
                                            <DateTimePicker
                                                renderInput={(props: any) => (
                                                    <TextField fullWidth {...props} name="myDate" error={Boolean(errors.myDate)} />
                                                )}
                                                value={values.myDate}
                                                onChange={(date: DateTime | null) => {
                                                    const zonedDate = date?.setZone(locationTimezone);

                                                    console.clear();
                                                    console.log('=====');
                                                    console.log('new date');
                                                    console.log(zonedDate);
                                                    console.log(zonedDate?.zoneName);
                                                    console.log(zonedDate?.toISO());
                                                    console.log(zonedDate?.toFormat('ff'));
                                                    console.log('=====');

                                                    setFieldValue('myDate', zonedDate);
                                                }}
                                                ampm={false}
                                                inputFormat="dd/MM/yyyy HH:mm"
                                                mask="__/__/____ __:__"
                                            />
                                        </LocalizationProvider>
                                        <ErrorMessage name="myDate">{(msg) => <FormHelperText error>{msg}</FormHelperText>}</ErrorMessage>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions sx={{ pt: 0 }}>
                        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            <Grid item>
                                <Button variant="contained" color="secondary" type="submit" size="large">
                                    Save
                                </Button>
                            </Grid>
                        </Grid>
                    </CardActions>
                </Form>
            </FormikProvider>
        </Grid>
    );
};

export default TestForm;
