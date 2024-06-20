import { useCallback, useEffect, useState } from 'react';
import moment, { Moment } from 'moment-timezone';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';

// mui imports
import { Box, CircularProgress, Grid, IconButton, LinearProgress, Stack, Switch, Tooltip, useMediaQuery } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { FormControlLabel, Typography } from '@mui/material';
import AddBoxOutlined from '@material-ui/icons/AddBoxOutlined';
import SaveOutlined from '@material-ui/icons/SaveOutlined';

// project imports
import { apiTimeFormat, gridSpacing } from '../../../store/constant';
import { IService } from '../../../models/IService';
import { ILocation } from '../../../models/ILocation';
import { IPayment } from '../../../models/IPayment';
import { IEmployee, UserRole } from '../../../models/IEmployee';
import { ICustomer } from '../../../models/ICustomer';
import { SnackBarTypes } from '../../../store/snackbarReducer';
import { SNACKBAR_OPEN } from '../../../store/actions';
import { AppointmentType, IAppointmentPayload } from '../../../models/IAppointment';
import { AppointmentWizardProps, WizardValues } from './types';
import ServiceStep from './ServiceStep';
import LocationStep from './LocationStep';
import ProviderStep from './ProviderStep';
import CustomerStep from './CustomerStep';
import DateTimeStep from './DateTimeStep';
import DurationStep from './DurationStep';
import NoteStep from './NoteStep';
import NewCustomerWizard from './NewCustomerWizard';
import AttachmentsUpload, { UploadableFile } from '../../../ui-component/file-uploader-preview/AttachmentsUpload';
import { clearNewCustomerState, setWizardData } from '../../../store/slices/newCustomerSlice';
import { startSubmitting, stopSubmitting } from 'store/slices/SubmittingSlice';
import { openConfirmPopup } from '../../../store/confirmPopupSlice';
import ToggledTooltipWithTitle from '../../../ui-component/tooltips/ToggledTooltipWithTitle';
import { checkFilesErrors, getMappedFilesFromAppointment, uploadImagesAndSubmit } from '../../../utils/functions/uploading-images-helpers';
import PrivateNoteStep from './PrivateNoteStep';
import { isEventDateValid } from '../../../utils/functions/time-zones-helpers';
import CBModal from '../../../ui-component/CBModal';

const AppointmentWizard = ({
    isRescheduled,
    services,
    range,
    event,
    employees,
    locations,
    currentLocation,
    user,
    userRole,
    handleDelete,
    handleCreate,
    handleUpdate,
    onCancel,
    matchSm,
    rangeMode,
    setRangeMode,
    selectedEmployeeId,
    isOpen,
    onClose
}: AppointmentWizardProps) => {
    const { customer, wizardData } = useAppSelector((state) => state.addNewCustomer);
    const dispatch = useAppDispatch();

    const [isAppointmentWizardOpened, setIsAppointmentWizardOpened] = useState(true);
    const [serviceData, setServiceData] = useState<IService | null>(null);
    const [locationData, setLocationData] = useState<ILocation | null>(null);
    const [providerData, setProviderData] = useState<IEmployee | null>(null);
    const [customerData, setCustomerData] = useState<ICustomer | null>(null);
    const [dateData, setDateData] = useState<Moment>(moment.utc(range?.start, 'YYYY-MM-DD HH:mm'));
    const [durationData, setDurationData] = useState<number | null>(null);
    const [noteData, setNoteData] = useState<string | null>(null);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState<boolean>(true);
    const [privateNoteData, setPrivateNoteData] = useState<string | null>(null);
    const [attachmentError, setAttachmentError] = useState('');
    const [errorIndexes, setErrorIndexes] = useState<number[]>([]);
    const [isEditDuration, setIsEditDuration] = useState(false);
    const [attachments, setAttachments] = useState<UploadableFile[]>([]);
    // loading state for edit-appointment, when incoming attachment urls needs to be transformed into files via fetch
    const [isParsingAttachments, setIsParsingAttachments] = useState(false);
    // store for deleted attachments ID's - they will be deleted on-submit
    const [attachmentsIdsToDelete, setAttachmentsIdsToDelete] = useState<(number | string)[]>([]);
    const [paymentsData, setPaymentsData] = useState<IPayment[] | null>(null);

    const { isSubmitting } = useAppSelector((store) => store.submitting);

    const isMobile = useMediaQuery('(max-width:700px)');

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

    const values: WizardValues = {
        service: {
            index: 1,
            data: serviceData,
            title: 'Service'
        },
        location: {
            index: 2,
            data: locationData,
            title: 'Location'
        },
        provider: {
            index: 3,
            data: providerData,
            title: 'Provider'
        },
        customer: {
            index: 4,
            data: customerData,
            title: 'Customer'
        },
        date: {
            index: 5,
            data: dateData,
            title: 'Date & time'
        },
        duration: {
            index: 6,
            data: durationData,
            title: 'Duration'
        }
    };

    useEffect(() => {
        if (range) {
            setDateData(moment(range.start, apiTimeFormat));
            if (range.duration) {
                setDurationData(range.duration);
                setRangeMode(true);
            }
        } else {
            // TODO click new Appointment button -> check console warnings
            setDateData(moment().set({ seconds: 0 }).tz(currentLocation.time_zone));
        }
    }, [range, currentLocation]);

    useEffect(() => {
        if (customer) {
            setCustomerData(customer);
        }
        if (wizardData) {
            setServiceData(wizardData.serviceData);
            setLocationData(wizardData.locationData);
            setProviderData(wizardData.providerData);
            setDateData(wizardData.dateData);
        }
        dispatch(clearNewCustomerState());
    }, [customer, wizardData]);

    useEffect(() => {
        if (event) {
            if (event.extendedProps) {
                setServiceData(event.extendedProps.service);
                setProviderData(event.extendedProps.employee);
                setLocationData(event.extendedProps.location);
                setCustomerData(event.extendedProps.customer);
                setDateData(moment(event.start));
                const calculatedDuration = Math.ceil(
                    moment(event.extendedProps.end_at).diff(moment(event.extendedProps.start_at), 'minutes', true)
                );
                setDurationData(calculatedDuration);
                setNoteData(event.extendedProps.note);
                setIsNotificationsEnabled(event.extendedProps.is_notifications_enabled);
                setPrivateNoteData(event.extendedProps.private_note);
                // transform appointment images urls to the File format
                if (event.extendedProps.images && event.extendedProps.images.length > 0) {
                    setAttachmentsIdsToDelete([]);
                    setIsParsingAttachments(true);
                    // make files from attachments
                    getMappedFilesFromAppointment(event.extendedProps.images).then((files) => {
                        setAttachments(files);
                        setIsParsingAttachments(false);
                    });
                }
            } else {
                // if appointment was opened not from calendar // from notification link
                // const zoneOffsetMinutes = moment(event.start_at).tz(event.location.time_zone).utcOffset();
                setServiceData(event.service);
                setProviderData(event.employee);
                setLocationData(event.location);
                setCustomerData(event.customer);
                // setDateData(moment(event.start_at).subtract(zoneOffsetMinutes, 'minutes').tz(event.location.time_zone));
                setDateData(moment(event.start_at).tz(event.location.time_zone));
                const calculatedDuration = Math.ceil(moment(event.end_at).diff(moment(event.start_at), 'minutes', true));
                setDurationData(calculatedDuration);
                setNoteData(event.note);
                setIsNotificationsEnabled(event.is_notifications_enabled);
                setPrivateNoteData(event.private_note);
                setIsParsingAttachments(true);
                getMappedFilesFromAppointment(event.images).then((files) => {
                    setAttachments(files);
                    setIsParsingAttachments(false);
                });
            }
            setPaymentsData(event.payments);
        }
    }, [event]);

    useEffect(() => {
        if (userRole === UserRole.Provider) {
            const userEmployee = employees.find((employee: IEmployee) => employee.user.id === user.id);
            if (userEmployee) {
                setProviderData(userEmployee);
            }
        }

        if (locations.length === 1) {
            setLocationData(locations[0]);
        }
        if (services.length === 1) {
            setServiceData(services[0]);
        }
    }, []);

    useEffect(() => {
        if (!isAppointmentWizardOpened) {
            setAttachmentsIdsToDelete([]);
        }
    }, [isAppointmentWizardOpened]);

    const handleOpenCustomerForm = () => {
        dispatch(setWizardData({ serviceData, locationData, providerData, dateData }));
        setIsAppointmentWizardOpened(false);
    };

    const checkValues = () => {
        const withError = Object.values(values).filter((field) => !field.data);
        if (withError.length) {
            const indexes = _.map(withError, 'index');
            setErrorIndexes(indexes);
            return false;
        }
        setErrorIndexes([]);
        return true;
    };

    const removeError = (index: number) => {
        const newErrors = errorIndexes.filter((err) => err !== index);
        setErrorIndexes(newErrors);
    };

    const submit = () => {
        const handleSubmit = (data: IAppointmentPayload) => {
            dispatch(startSubmitting());
            uploadImagesAndSubmit({
                attachments,
                submitCb: (urls) => {
                    setAttachmentsIdsToDelete([]);
                    if (event && !isRescheduled) {
                        handleUpdate(event.id, { ...data, images: urls });
                    } else {
                        handleCreate({ ...data, images: urls });
                    }
                },
                updateAttachmentsCb: (files) => setAttachments(files),
                imagesToDelete: attachmentsIdsToDelete,
                uploadingErrorCb: (e) => {
                    setAttachmentsIdsToDelete([]);
                    showSnackbar({
                        message: e.message,
                        alertSeverity: SnackBarTypes.Error
                    });
                    dispatch(stopSubmitting());
                },
                deletingImagesErrorCb: (e) => {
                    showSnackbar({
                        message: e.message,
                        alertSeverity: SnackBarTypes.Error
                    });
                    dispatch(stopSubmitting());
                }
            });
        };

        const checkWizardValues = checkValues();
        if (checkWizardValues && checkFilesErrors(attachments) && !attachmentError) {
            if (serviceData && providerData && locationData && customerData && dateData && durationData) {
                let eventImages: string[] = [];
                if (event) {
                    if (event.extendedProps) {
                        eventImages = event.extendedProps.images;
                    } else {
                        eventImages = event.images;
                    }
                }
                // get all Appointment data
                const data = {
                    service_id: serviceData.id,
                    employee_id: providerData.id,
                    location_id: locationData.id,
                    customer_id: customerData.id,
                    start_at: dateData.toISOString(true),
                    end_at: dateData.clone().add(durationData, 'minutes').subtract(1, 'second').toISOString(true),
                    note: noteData,
                    is_notifications_enabled: isNotificationsEnabled,
                    private_note: privateNoteData,
                    type: AppointmentType.Appointment,
                    images: eventImages,
                    payments: paymentsData
                } as IAppointmentPayload;
                // check past time
                if (!isEventDateValid(data, locationData.time_zone)) {
                    dispatch(
                        openConfirmPopup({
                            onConfirm: () => {
                                handleSubmit(data);
                            },
                            onClose: () => {
                                dispatch(stopSubmitting());
                            },
                            confirmText: `${event ? 'Update' : 'Create'}`,
                            text: `Are you sure you want to ${event ? 'update' : 'create'} an appointment for the past date?`
                        })
                    );
                } else {
                    handleSubmit(data);
                }
            }
        }
    };

    const deleteAppointment = useCallback(() => {
        if (event) {
            if (event.extendedProps) {
                handleDelete(event.id, event.extendedProps.type);
            } else {
                handleDelete(event.id, event.type);
            }
        }
    }, [event]);

    return isAppointmentWizardOpened ? (
        <CBModal
            id="appointment_wizard"
            maxWidth={matchSm ? false : 'md'}
            fullScreen={matchSm}
            fullWidth
            open={isOpen}
            onClose={onClose}
            title={event && !isRescheduled ? 'Edit Appointment' : 'Create Appointment'}
            closeButtonText="Cancel"
            okButtonText={event && !isRescheduled ? 'Update' : 'Create'}
            onClickOk={submit}
            okButtonStartIcon={event ? <SaveOutlined /> : <AddBoxOutlined />}
            okButtonDisabled={isSubmitting}
            specialContent={
                event &&
                !isRescheduled &&
                userRole !== UserRole.Provider && (
                    <Tooltip title="Delete Appointment">
                        <IconButton disabled={isSubmitting} onClick={deleteAppointment}>
                            <DeleteIcon color="error" />
                        </IconButton>
                    </Tooltip>
                )
            }
        >
            <Grid container spacing={gridSpacing} alignItems="center">
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isNotificationsEnabled}
                                id="is_notifications_enabled"
                                name="is_notifications_enabled"
                                onChange={(e) => {
                                    setIsNotificationsEnabled(!isNotificationsEnabled);
                                }}
                                value={isNotificationsEnabled}
                                sx={{ color: '#9e9e9e' }}
                            />
                        }
                        labelPlacement="start"
                        label="Send Notifications"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <ServiceStep
                        index={values.service.index}
                        error={errorIndexes.includes(values.service.index)}
                        removeError={removeError}
                        services={services}
                        serviceData={serviceData}
                        setServiceData={setServiceData}
                        setDurationData={setDurationData}
                        rangeMode={rangeMode}
                        setRangeMode={setRangeMode}
                        range={range}
                    />
                </Grid>
                {locations.length > 1 && (
                    <Grid item xs={12} md={6}>
                        <LocationStep
                            index={values.location.index}
                            error={errorIndexes.includes(values.location.index)}
                            removeError={removeError}
                            serviceData={serviceData}
                            locations={locations}
                            locationData={locationData}
                            userRole={userRole}
                            setLocationData={setLocationData}
                            setProviderData={setProviderData}
                        />
                    </Grid>
                )}
                {userRole !== UserRole.Provider && (
                    <Grid item xs={12} md={6}>
                        <ProviderStep
                            isEdit={!!event}
                            index={values.provider.index}
                            error={errorIndexes.includes(values.provider.index)}
                            removeError={removeError}
                            serviceData={serviceData}
                            userRole={userRole}
                            locationData={locationData}
                            providerData={providerData}
                            setProviderData={setProviderData}
                            selectedEmployeeId={selectedEmployeeId}
                        />
                    </Grid>
                )}
                <Grid item xs={12} md={6}>
                    <CustomerStep
                        setIsAppointmentWizardOpened={setIsAppointmentWizardOpened}
                        isEdit={!!event}
                        index={values.customer.index}
                        error={errorIndexes.includes(values.customer.index)}
                        removeError={removeError}
                        userRole={userRole}
                        customerData={customerData}
                        setCustomerData={setCustomerData}
                        handleOpenCustomerForm={handleOpenCustomerForm}
                    />
                </Grid>
                <Grid item md={6} sm={isMobile ? 12 : 6} xs={12}>
                    <DateTimeStep
                        dateData={dateData}
                        setDateData={setDateData}
                        locationData={locationData}
                        currentLocation={currentLocation}
                        matchSm={matchSm}
                    />
                </Grid>
                <Grid item sm={isMobile ? 12 : 6} xs={12}>
                    <DurationStep
                        index={values.duration.index}
                        error={errorIndexes.includes(values.duration.index)}
                        removeError={removeError}
                        userRole={userRole}
                        serviceData={serviceData}
                        durationData={durationData}
                        setDurationData={setDurationData}
                        isEdit={isEditDuration}
                        setIsEdit={setIsEditDuration}
                        rangeMode={rangeMode}
                    />
                </Grid>
                <Grid item xs={12} mb={3}>
                    <NoteStep noteData={noteData} setNoteData={setNoteData} />
                </Grid>
                <Grid item xs={12}>
                    <PrivateNoteStep privateNoteData={privateNoteData} setPrivateNoteData={setPrivateNoteData} />
                </Grid>
                <Grid item xs={12}>
                    <Stack direction={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'start' : 'center'} spacing={2}>
                        <ToggledTooltipWithTitle
                            title="Attachments:"
                            tooltipText={
                                <Stack>
                                    <Typography>Max image size: 20mb</Typography>
                                    <Typography>Limit of images to upload : 5</Typography>
                                    <Typography>Accepted formats: jpg, jpeg, png, bmp, gif</Typography>
                                </Stack>
                            }
                        />
                        {isParsingAttachments ? (
                            <Box sx={{ mx: 'auto', mt: 1, width: 200 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <AttachmentsUpload
                                matchSm={isMobile}
                                attachments={attachments}
                                setAttachments={setAttachments}
                                attachmentsIdsToDelete={attachmentsIdsToDelete}
                                setAttachmentsIdsToDelete={setAttachmentsIdsToDelete}
                                // uploadedImagesUrls={uploadedImagesUrls}
                                // setUploadedImagesUrls={setUploadedImagesUrls}
                                error={attachmentError}
                                setError={setAttachmentError}
                            />
                        )}
                    </Stack>
                    {attachmentError && (
                        <div>
                            <LinearProgress color="error" variant="determinate" value={100} />
                            <Typography color="error">{attachmentError}</Typography>
                        </div>
                    )}
                </Grid>
            </Grid>
        </CBModal>
    ) : (
        <CBModal
            id="new_customer_wizard"
            maxWidth={matchSm ? false : 'md'}
            fullScreen={matchSm}
            fullWidth
            open={isOpen}
            onClose={() => {
                setIsAppointmentWizardOpened(true);
            }}
            title="Add New Customer"
            closeButtonText="Cancel"
            okButtonText="Add"
            okButtonFormId="new-customer-wizard-form"
        >
            <NewCustomerWizard setIsAppointmentWizardOpened={setIsAppointmentWizardOpened} />
        </CBModal>
    );
};

export default AppointmentWizard;
