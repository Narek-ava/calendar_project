import React, { useCallback, useState } from 'react';
import { Moment } from 'moment-timezone';
import { useDebouncedCallback } from 'use-debounce';

// mui
import { Autocomplete, Box, FormHelperText, Grid, Stack, TextField, Typography } from '@mui/material';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MomentAdapter from '@mui/lab/AdapterMoment';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import { useTheme } from '@mui/material/styles';

// project imports
import { IEmployee, UserRole } from '../../../models/IEmployee';
import { gridSpacing } from '../../../store/constant';
import { INPUT_DELAY } from '../../../ui-component/optimized-text-fields/OptimizedTextField';
import UserAvatar from '../../../ui-component/UserAvatar';
import AppTimePicker from '../../../ui-component/form/time-picker/AppTimePicker';

interface BlockTimeFormProps {
    userRole: UserRole | undefined;
    start: Moment;
    setStart: (data: Moment) => void;
    end: Moment;
    setEnd: (data: Moment) => void;
    employees: IEmployee[];
    employee: IEmployee | null;
    setEmployee: (data: IEmployee | null) => void;
    error: boolean;
    setError: (arg: boolean) => void;
    dateError: string | null;
    setDateError: (data: string) => void;
    matchSm: boolean;
    title: string;
    setTitle: (data: string) => void;
}

const BlockTimeForm = ({
    userRole,
    employee,
    employees,
    setEmployee,
    setEnd,
    setStart,
    end,
    start,
    error,
    setError,
    dateError,
    setDateError,
    matchSm,
    title,
    setTitle
}: BlockTimeFormProps) => {
    const theme = useTheme();
    const [innerTitle, setInnerTitle] = useState<string>(title);

    const debouncedHandleOnChange = useDebouncedCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    }, INPUT_DELAY);

    const handleOnChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist();
        const newValue = event.currentTarget.value;
        setInnerTitle(newValue);
        debouncedHandleOnChange(event);
    }, []);

    const clearDateError = () => {
        if (dateError) {
            setDateError('');
        }
    };

    return (
        <Grid container spacing={gridSpacing} alignItems="center">
            {/* ============ TITLE =============== */}
            <Grid item xs={12}>
                <Stack direction={matchSm ? 'column' : 'row'} alignItems={matchSm ? undefined : 'center'} spacing={matchSm ? 2 : 1}>
                    <Typography sx={{ minWidth: '80px' }}>Title:</Typography>
                    <TextField
                        fullWidth
                        // label="Title"
                        value={innerTitle || ''}
                        onChange={handleOnChange}
                        autoComplete="off"
                        autoFocus
                        variant="outlined"
                    />
                </Stack>
            </Grid>
            {/* ============ EMPLOYEE SELECT =============== */}
            {userRole && userRole !== UserRole.Provider && (
                <Grid item xs={12}>
                    <Stack direction={matchSm ? 'column' : 'row'} alignItems={matchSm ? undefined : 'center'} spacing={matchSm ? 2 : 1}>
                        <Typography sx={{ minWidth: '80px' }}>Staff:</Typography>
                        <Autocomplete
                            id="employee-id"
                            fullWidth
                            value={employee}
                            options={employees}
                            getOptionLabel={(option: IEmployee) =>
                                `${option.user.firstname} ${option.user.lastname} (${option.user.email})`
                            }
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            noOptionsText="No items match your search"
                            renderInput={(params) => <TextField {...params} placeholder="Select Provider" error={error} />}
                            onChange={(e, value) => {
                                if (value) {
                                    setEmployee(value);
                                    if (error) {
                                        setError(false);
                                    }
                                } else {
                                    setEmployee(null);
                                }
                            }}
                            renderOption={(props, option: IEmployee) => (
                                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                    <UserAvatar employee={option} sx={{ width: '30px', height: '30px', mr: 1 }} />
                                    {`${option.user.firstname} ${option.user.lastname}`}
                                </Box>
                            )}
                        />
                    </Stack>
                </Grid>
            )}
            <Grid item xs={12}>
                <Stack direction={matchSm ? 'column' : 'row'} alignItems={matchSm ? undefined : 'center'} spacing={1}>
                    <Typography sx={{ minWidth: '80px' }}>Date:</Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        {/*  ==================== 1 DAY PICKER FOR BOTH START AND END =================== */}
                        <LocalizationProvider dateAdapter={MomentAdapter}>
                            <MobileDatePicker<Moment>
                                views={['day']}
                                mask="MM/DD/YYYY"
                                showTodayButton
                                disableHighlightToday
                                showToolbar={false}
                                value={start}
                                onChange={(dateArg) => {
                                    if (dateArg) {
                                        // keeps existing pickers time
                                        const newStartDate = start.clone().set({
                                            year: dateArg.get('year'),
                                            date: dateArg.get('date'),
                                            month: dateArg.get('month')
                                        });
                                        const newEndDate = end.clone().set({
                                            year: dateArg.get('year'),
                                            date: dateArg.get('date'),
                                            month: dateArg.get('month')
                                        });
                                        setStart(newStartDate);
                                        setEnd(newEndDate);
                                    }
                                }}
                                renderInput={(params) => <TextField {...params} sx={{ width: '140px' }} />}
                            />
                        </LocalizationProvider>
                    </Stack>
                </Stack>
            </Grid>
            <Grid item xs={12}>
                <Stack direction={matchSm ? 'column' : 'row'} alignItems={matchSm ? undefined : 'center'} spacing={1}>
                    <Typography sx={{ minWidth: '80px' }}>From:</Typography>
                    <Stack direction={matchSm ? 'column' : 'row'} alignItems={matchSm ? undefined : 'center'} spacing={2}>
                        <AppTimePicker
                            outerValue={start}
                            onTimeSet={(pickerTime) => {
                                const newStart = start.clone().set({
                                    hour: pickerTime.get('hour'),
                                    minute: pickerTime.get('minutes')
                                });
                                setStart(newStart);
                                clearDateError();
                            }}
                            variant="outlined"
                            sx={{ width: '140px' }}
                            listMaxHeight="160px"
                        />
                        <Stack direction={matchSm ? 'column' : 'row'} alignItems={matchSm ? undefined : 'center'} spacing={1}>
                            <Typography>To:</Typography>
                            <AppTimePicker
                                outerValue={end.clone().add(1, 'second')}
                                // outerValue={end}
                                onTimeSet={(pickerTime) => {
                                    const newEnd = start
                                        .clone()
                                        .set({ hour: pickerTime.get('hour'), minute: pickerTime.get('minutes') })
                                        .subtract(1, 'second');
                                    setEnd(newEnd);
                                    clearDateError();
                                }}
                                variant="outlined"
                                sx={{ width: '140px' }}
                                listMaxHeight="160px"
                            />
                        </Stack>
                    </Stack>
                </Stack>
                {dateError && (
                    <FormHelperText
                        sx={{
                            color: theme.palette.error.light,
                            ml: matchSm ? 0 : '86px',
                            mt: 1
                        }}
                    >
                        {dateError}
                    </FormHelperText>
                )}
            </Grid>
        </Grid>
    );
};

export default BlockTimeForm;
