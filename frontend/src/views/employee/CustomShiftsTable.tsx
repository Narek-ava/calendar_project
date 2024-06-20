import { useCallback, useRef } from 'react';
import { styled } from '@material-ui/core/styles';
import {
    Box,
    Typography,
    Table,
    TableBody,
    Button,
    TableRow,
    TableCell,
    InputAdornment,
    Stack,
    IconButton,
    FormHelperText
} from '@material-ui/core';
import MomentAdapter from '@mui/lab/AdapterMoment';
import { LocalizationProvider, MobileDatePicker } from '@mui/lab';
import Add from '@material-ui/icons/Add';
import momentTimezone from 'moment-timezone';
import { CustomShift, IEmployee } from '../../models/IEmployee';
import { Switch, TextField } from '@mui/material';
import CalendarToday from '@material-ui/icons/CalendarToday';
import AppTimePicker from '../../ui-component/form/time-picker/AppTimePicker';
import Delete from '@material-ui/icons/Delete';
import { Moment } from 'moment/moment';
import { FormikErrors } from 'formik';

const StyledBox = styled(Box)(({ theme }) => ({
    width: '100%',
    maxWidth: '750px',
    maxHeight: '400px',
    overflow: 'auto',

    '& .shifts-wrap': {
        display: 'block',
        overflow: 'auto',
        minWidth: '550px',

        '& .MuiTable-root': {
            width: '100%'
        }
    },

    '& tr:last-child td, & tr:last-child th': {
        border: 0
    }
}));

interface CustomShiftsTableProps {
    shifts: CustomShift[];
    setShifts: (data: CustomShift[]) => void;
    errors: FormikErrors<IEmployee>;
}

const CustomShiftsTable = ({ shifts, setShifts, errors }: CustomShiftsTableProps) => {
    const dateFormat = 'YYYY-MM-DD HH:mm';
    const { moment } = new MomentAdapter({ instance: momentTimezone });
    const shiftsListRef = useRef<null | HTMLDivElement>(null);

    const scrollShiftsToBottom = useCallback(() => {
        if (shiftsListRef.current) shiftsListRef.current.scrollTop = shiftsListRef.current.scrollHeight;
    }, []);

    const addRow = useCallback(() => {
        const newShifts = [
            ...shifts,
            {
                opened: true,
                start: moment().set({ hour: 9, minute: 0, second: 0, millisecond: 0 }).format(dateFormat),
                end: moment().set({ hour: 18, minute: 0, second: 0, millisecond: 0 }).format(dateFormat)
            }
        ];
        setShifts(newShifts);
        setTimeout(scrollShiftsToBottom, 200);
    }, [shifts, moment, setShifts, scrollShiftsToBottom]);

    const removeRow = useCallback(
        (index: number) => {
            const newShifts = shifts.map((shift) => ({ ...shift }));
            newShifts.splice(index, 1);
            setShifts(newShifts);
        },
        [setShifts, shifts]
    );

    const setShiftDate = useCallback(
        (index: number, date: Date, fieldName: 'start' | 'end') => {
            const newShifts = shifts.map((shift) => ({ ...shift }));
            const shiftTime = moment(newShifts[index][fieldName]);
            const newDate = moment(date);

            newShifts[index][fieldName] = shiftTime
                .set({
                    date: newDate.date(),
                    month: newDate.month(),
                    year: newDate.year()
                })
                .format(dateFormat);

            setShifts(newShifts);
        },
        [moment, setShifts, shifts]
    );

    const setShiftTime = useCallback(
        (index: number, date: Moment, fieldName: 'start' | 'end') => {
            const newShifts = shifts.map((shift) => ({ ...shift }));
            const shiftDate = moment(newShifts[index][fieldName]);
            const newTime = moment(date);

            newShifts[index][fieldName] = shiftDate
                .set({
                    hours: newTime.hours(),
                    minutes: newTime.minutes()
                })
                .format(dateFormat);

            setShifts(newShifts);
        },
        [moment, setShifts, shifts]
    );

    const setShiftOpened = useCallback(
        (index: number, opened: boolean) => {
            const newShifts = shifts.map((shift) => ({ ...shift }));
            newShifts[index].opened = opened;
            setShifts(newShifts);
        },
        [setShifts, shifts]
    );

    const getFieldError = useCallback(
        (index: number, field: string) =>
            // @ts-ignore
            errors?.shifts?.[index]?.[field]?.join(' '),
        [errors.shifts]
    );

    return (
        <>
            <StyledBox mb={2} ref={shiftsListRef}>
                {!shifts.length && <Typography mb={1}>There are no custom shifts yet</Typography>}
                <Box className="shifts-wrap">
                    <Table size="small" padding="none">
                        <TableBody>
                            <LocalizationProvider dateAdapter={MomentAdapter}>
                                {shifts.map((row, index) => (
                                    <TableRow key={index} sx={{ verticalAlign: 'top' }}>
                                        <TableCell scope="row" width={155} sx={{ py: 1 }}>
                                            <MobileDatePicker
                                                inputFormat="MM/DD/YYYY"
                                                mask="MM/DD/YYYY"
                                                value={moment(row.start)}
                                                onChange={(value) => {
                                                    if (value) {
                                                        // @ts-ignore
                                                        setShiftDate(index, value, 'start');
                                                    }
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        placeholder="From"
                                                        size="small"
                                                        {...params}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <CalendarToday />
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                    />
                                                )}
                                                disableCloseOnSelect={false}
                                            />
                                            <FormHelperText error id="error-firstname">
                                                {getFieldError(index, 'start')}
                                            </FormHelperText>
                                        </TableCell>
                                        <TableCell width={30} align="center" sx={{ pt: '18px' }}>
                                            TO
                                        </TableCell>
                                        <TableCell scope="row" width={155} sx={{ py: 1 }}>
                                            <MobileDatePicker
                                                inputFormat="MM/DD/YYYY"
                                                mask="MM/DD/YYYY"
                                                value={moment(row.end)}
                                                onChange={(value) => {
                                                    if (value) {
                                                        // @ts-ignore
                                                        setShiftDate(index, value, 'end');
                                                    }
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        placeholder="From"
                                                        size="small"
                                                        {...params}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <CalendarToday />
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                    />
                                                )}
                                                disableCloseOnSelect={false}
                                            />
                                            <FormHelperText error id="error-firstname">
                                                {getFieldError(index, 'end')}
                                            </FormHelperText>
                                        </TableCell>
                                        <TableCell align="left" width={130} sx={{ py: 1 }}>
                                            <Stack direction="row" alignItems="center" width={100}>
                                                <Switch
                                                    checked={row.opened}
                                                    name={`shifts[${index}].opened`}
                                                    onChange={(event) => {
                                                        setShiftOpened(index, !row.opened);
                                                    }}
                                                    value={row.opened}
                                                />
                                                {row.opened ? 'Opened' : 'Closed'}
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="left" width={100} sx={{ py: 1 }}>
                                            {row.opened && (
                                                <AppTimePicker
                                                    size="small"
                                                    outerValue={moment(row.start)}
                                                    onTimeSet={(value) => {
                                                        if (value) {
                                                            setShiftTime(index, value, 'start');
                                                        }
                                                    }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell width={30} align="center" sx={{ pt: '16px' }}>
                                            {row.opened && 'TO'}
                                        </TableCell>
                                        <TableCell align="left" width={100} sx={{ py: 1 }}>
                                            {row.opened && (
                                                <AppTimePicker
                                                    size="small"
                                                    outerValue={moment(row.end)}
                                                    onTimeSet={(value) => {
                                                        if (value) {
                                                            setShiftTime(index, value, 'end');
                                                        }
                                                    }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell width={30} align="center" sx={{ py: 1 }}>
                                            <IconButton
                                                onClick={() => {
                                                    removeRow(index);
                                                }}
                                            >
                                                <Delete color="error" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </LocalizationProvider>
                        </TableBody>
                    </Table>
                </Box>
            </StyledBox>
            <Button startIcon={<Add />} onClick={addRow}>
                Add date...
            </Button>
        </>
    );
};

export default CustomShiftsTable;
