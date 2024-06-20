import moment from 'moment';

// mui
import { Divider, IconButton, InputLabel, Stack } from '@mui/material';
import Close from '@material-ui/icons/Close';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import TextField from '@mui/material/TextField';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// project imports
import { CustomRangePickerProps } from './types';
import RangePresetButtons from './RangePresetButtons';
import { Moment } from 'moment-timezone';
import { setDayStart } from '../../utils/functions/time-zones-helpers';

const useStyles = makeStyles((theme: Theme) => ({
    pickerWrapper: {
        position: 'relative'
    },
    clearButton: {
        position: 'absolute',
        right: '3px'
    }
}));

const CustomRangePicker = ({ start, end, setStart, setEnd, isResponsive, disableFuture }: CustomRangePickerProps) => {
    const classes = useStyles();

    const clearStart = () => setStart(null);
    const clearEnd = () => setEnd(null);

    return (
        <Stack spacing={2}>
            <RangePresetButtons start={start} end={end} setStart={setStart} setEnd={setEnd} disableFuture={disableFuture} />
            <Divider />
            <Stack direction={isResponsive ? 'column' : 'row'} alignItems={isResponsive ? undefined : 'center'} spacing={2}>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <InputLabel sx={{ minWidth: isResponsive ? '100px' : undefined }}>From:</InputLabel>
                        <Stack direction="row" alignItems="center" className={classes.pickerWrapper}>
                            <MobileDatePicker<Moment>
                                closeOnSelect
                                value={start}
                                onChange={(date) => {
                                    if (date) {
                                        setStart(setDayStart(date));
                                        return;
                                    }
                                    setStart(null);
                                }}
                                renderInput={(params) => <TextField {...params} placeholder="Select date" />}
                                shouldDisableDate={(pickerDate) => (end ? pickerDate > end : false)}
                                showToolbar={false}
                                minDate={moment().subtract({ year: 2 })}
                                maxDate={moment().add({ year: 2 })}
                                disableFuture={disableFuture}
                            />
                            {start && (
                                <IconButton className={classes.clearButton} onClick={clearStart} size="small">
                                    <Close />
                                </IconButton>
                            )}
                        </Stack>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <InputLabel sx={{ minWidth: isResponsive ? '100px' : undefined }}>To:</InputLabel>
                        <Stack direction="row" alignItems="center" className={classes.pickerWrapper}>
                            <MobileDatePicker<Moment>
                                closeOnSelect
                                value={end}
                                onChange={(date) => {
                                    if (date) {
                                        setEnd(setDayStart(date));
                                        return;
                                    }
                                    setStart(null);
                                }}
                                renderInput={(params) => <TextField {...params} placeholder="Select date" />}
                                shouldDisableDate={(pickerDate) => (start ? pickerDate < start : false)}
                                showToolbar={false}
                                minDate={moment().subtract({ year: 2 })}
                                disableFuture={disableFuture}
                                maxDate={moment().add({ year: 2 })}
                            />
                            {end && (
                                <IconButton className={classes.clearButton} onClick={clearEnd} size="small">
                                    <Close />
                                </IconButton>
                            )}
                        </Stack>
                    </Stack>
                </LocalizationProvider>
            </Stack>
        </Stack>
    );
};
export default CustomRangePicker;
