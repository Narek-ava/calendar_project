import { useState, useCallback, useMemo } from 'react';
import { FormControl, FormHelperText, Skeleton, Button, Autocomplete, Checkbox, TextField, Typography } from '@material-ui/core';
import { FormikErrors, FormikTouched, FormikValues } from 'formik';
import * as React from 'react';
import { SnackBarTypes } from '../store/snackbarReducer';
import useShowSnackbar from '../hooks/useShowSnackbar';
import employeeAPI from '../services/EmployeeService';
import { IEmployee } from '../models/IEmployee';

interface EmployeeSelectProps {
    employees: IEmployee[];
    onChange: (employees: IEmployee[]) => void;
    value?: IEmployee[];
    touched: FormikTouched<FormikValues>;
    errors: FormikErrors<FormikValues>;
    setFieldTouched: (a: string) => void;
    handleBlur: (e: React.FocusEvent<any>) => void;
}

const EmployeeSelect = ({ employees, onChange, value = [], touched, errors, setFieldTouched, handleBlur }: EmployeeSelectProps) => {
    const [createEmployee, { isLoading }] = employeeAPI.useSimpleCreateEmployeeMutation();
    const [newEmployeeEmail, setNewEmployeeEmail] = useState<string | null>(null);
    const { showSnackbar } = useShowSnackbar();

    const isValidEmail = useMemo(() => /[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,8}(.[a-z{2,8}])?/g.test(newEmployeeEmail || ''), [
        newEmployeeEmail
    ]);

    const addEmployee = useCallback(
        (email: string) => {
            if (isLoading) return;

            createEmployee(email)
                .unwrap()
                .then((employee) => {
                    if (employee.id) {
                        showSnackbar({
                            message: 'Employee added successfully',
                            alertSeverity: SnackBarTypes.Success
                        });
                        onChange([...value, employee]);
                    }
                })
                .catch((err) => {
                    showSnackbar({
                        message: err.data || 'Error occurred, employee was not added.',
                        alertSeverity: SnackBarTypes.Error
                    });
                });
        },
        [createEmployee, isLoading, onChange, showSnackbar, value]
    );

    return employees ? (
        <FormControl fullWidth error={Boolean(touched.employees && errors.employees)}>
            <Autocomplete
                filterOptions={(options, { inputValue }) => {
                    const inputText = inputValue.toLowerCase();
                    return options.filter(
                        (item) =>
                            item.user.firstname.toLowerCase().includes(inputText) ||
                            item.user.lastname.toLowerCase().includes(inputText) ||
                            item.user.email.toLowerCase().includes(inputText)
                    );
                }}
                multiple
                id="checkboxes-tags-employees"
                options={employees}
                value={value}
                isOptionEqualToValue={(option, optionValue) => option.id === optionValue.id}
                disableCloseOnSelect
                getOptionLabel={(option) => `${option.user.firstname} ${option.user.lastname}`}
                onBlur={(e) => {
                    setFieldTouched('employees');
                    handleBlur(e);
                }}
                onChange={(e, newValue) => onChange(newValue)}
                renderOption={(props, option, { selected }) => (
                    <li {...props}>
                        <Checkbox style={{ marginRight: 8 }} checked={selected} />
                        {option.user.firstname} {option.user.lastname}
                    </li>
                )}
                onInputChange={(e, inputValue) => {
                    setNewEmployeeEmail(inputValue);
                }}
                renderInput={(params) => <TextField {...params} placeholder={value?.length ? undefined : 'Staff'} />}
                noOptionsText={
                    newEmployeeEmail && isValidEmail ? (
                        <Button
                            sx={{ textTransform: 'none' }}
                            onClick={() => {
                                addEmployee(newEmployeeEmail);
                            }}
                        >
                            Add &quot;{newEmployeeEmail}&quot;
                        </Button>
                    ) : (
                        <Typography>Enter valid email to add new employee</Typography>
                    )
                }
            />
            {touched.employees && errors.employees && (
                <FormHelperText error id="errors-employees">
                    {errors.employees}
                </FormHelperText>
            )}
        </FormControl>
    ) : (
        <Skeleton animation="wave" height={80} />
    );
};

export default EmployeeSelect;
