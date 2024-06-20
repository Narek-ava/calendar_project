import { useState, useCallback } from 'react';
import { IService } from '../models/IService';
import serviceAPI from '../services/ServiceService';
import { FormControl, FormHelperText, Skeleton, Button, Autocomplete, Checkbox, TextField } from '@material-ui/core';
import { FormikErrors, FormikTouched, FormikValues } from 'formik';
import * as React from 'react';
import { SnackBarTypes } from '../store/snackbarReducer';
import useShowSnackbar from '../hooks/useShowSnackbar';

interface ServiceSelectProps {
    onChange: (services: IService[]) => void;
    value: IService[];
    touched: FormikTouched<FormikValues>;
    errors: FormikErrors<FormikValues>;
    setFieldTouched: (a: string) => void;
    handleBlur: (e: React.FocusEvent<any>) => void;
}

const ServiceSelect = ({ onChange, value, touched, errors, setFieldTouched, handleBlur }: ServiceSelectProps) => {
    const services = serviceAPI.useFetchAllServicesQuery({});
    const [createService, { isLoading }] = serviceAPI.useSimpleCreateServiceMutation();
    const [newServiceName, setNewServiceName] = useState<string | null>(null);
    const { showSnackbar } = useShowSnackbar();

    const addService = useCallback(
        (serviceName: string) => {
            if (isLoading) return;

            // capitalize entered service name
            createService(serviceName.replace(/\b\w/g, (l) => l.toUpperCase()))
                .unwrap()
                .then((service) => {
                    if (service.id) {
                        showSnackbar({
                            message: 'Service added successfully',
                            alertSeverity: SnackBarTypes.Success
                        });
                        onChange([...value, service]);
                    }
                })
                .catch((err) => {
                    showSnackbar({
                        message: err.data || 'Error occurred, service was not added.',
                        alertSeverity: SnackBarTypes.Error
                    });
                });
        },
        [createService, isLoading, onChange, showSnackbar, value]
    );

    return services?.data?.data ? (
        <FormControl fullWidth error={Boolean(touched.services && errors.services)}>
            <Autocomplete
                multiple
                id="checkboxes-tags-services"
                // @ts-ignore
                options={services.data.data}
                value={value}
                isOptionEqualToValue={(option, optionValue) => option.id === optionValue.id}
                disableCloseOnSelect
                getOptionLabel={(option) => option.name}
                onBlur={(e) => {
                    setFieldTouched('services');
                    handleBlur(e);
                }}
                onChange={(e, newValue) => onChange(newValue)}
                renderOption={(props, option, { selected }) => (
                    <li {...props} key={`service_${option.id}`}>
                        <Checkbox style={{ marginRight: 8 }} checked={selected} />
                        {option.name}
                    </li>
                )}
                onInputChange={(e, inputValue) => {
                    setNewServiceName(inputValue);
                }}
                renderInput={(params) => <TextField {...params} placeholder={value?.length ? undefined : 'Services'} />}
                noOptionsText={
                    newServiceName && (
                        <Button
                            onClick={() => {
                                addService(newServiceName);
                            }}
                        >
                            Add &quot;{newServiceName}&quot;
                        </Button>
                    )
                }
            />
            {touched.services && errors.services && (
                <FormHelperText error id="errors-services">
                    {errors.services}
                </FormHelperText>
            )}
        </FormControl>
    ) : (
        <Skeleton animation="wave" height={80} />
    );
};

export default ServiceSelect;
