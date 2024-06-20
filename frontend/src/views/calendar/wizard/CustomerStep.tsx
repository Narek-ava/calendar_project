// material-ui
import { Autocomplete, TextField } from '@material-ui/core';

// project imports
import { CustomerStepProps } from './types';
import { ICustomer } from '../../../models/ICustomer';
import { useEffect, useMemo, useState } from 'react';
import throttle from 'lodash/throttle';
import { axiosServices } from '../../../utils/axios';
import { IPaginateResponse } from '../../../models/IPaginateResponse';
import AddBoxOutlined from '@material-ui/icons/AddBoxOutlined';
import { Button, Stack, Typography } from '@mui/material';

const CustomerStep = ({ index, error, removeError, isEdit, customerData, setCustomerData, handleOpenCustomerForm }: CustomerStepProps) => {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<ICustomer[]>([]);

    const fetch = useMemo(
        () =>
            throttle(async (searchTerm, callback) => {
                const res = await axiosServices.get(`/customers/`, {
                    params: {
                        search: searchTerm,
                        per_page: 10
                    }
                });
                if (res) {
                    callback(res);
                }
            }, 200),
        []
    );

    useEffect(() => {
        let active = true;

        if (inputValue === '') {
            setOptions(customerData ? [customerData] : []);
            return undefined;
        }

        fetch(inputValue, ({ data }: { data: IPaginateResponse<ICustomer[]> }) => {
            if (active) {
                let newOptions: ICustomer[] = [];

                if (customerData) {
                    newOptions = [customerData];
                }

                if (data) {
                    newOptions = [...newOptions, ...data.data];
                }

                setOptions(newOptions);
            }
        });

        return () => {
            active = false;
        };
    }, [customerData, inputValue, fetch]);

    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <Autocomplete
                id="customers autocomplete"
                fullWidth
                disabled={isEdit}
                filterOptions={(x) => x}
                getOptionLabel={(option) =>
                    typeof option === 'string'
                        ? option
                        : `${option.firstname} ${option.lastname} (${option.email === null ? option.phone : option.email})`
                }
                options={options}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={customerData}
                onChange={(event, newValue) => {
                    setOptions(newValue ? [newValue, ...options] : options);
                    if (newValue) {
                        setCustomerData(newValue);
                        if (error) {
                            removeError(index);
                        }
                    } else {
                        setCustomerData(null);
                    }
                }}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                noOptionsText={
                    <>
                        {!customerData ? (
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography>Type email or phone number for searching</Typography>
                                <Button size="large" onClick={handleOpenCustomerForm} startIcon={<AddBoxOutlined />} sx={{ ml: 'auto' }}>
                                    New
                                </Button>
                            </Stack>
                        ) : (
                            <Button
                                onClick={() => {
                                    setCustomerData(null);
                                }}
                                sx={{ ml: 'auto' }}
                            >
                                Change Customer
                            </Button>
                        )}
                    </>
                }
                renderInput={(params) => <TextField {...params} label="Search for Customer" error={error} fullWidth />}
                // renderOption={() => {}}
            />
        </Stack>
    );
};

export default CustomerStep;
