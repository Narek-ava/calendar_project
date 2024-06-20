import { AndroidPickerProps } from './types';

import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import { makeStyles } from '@material-ui/styles';
import { Button, Theme } from '@mui/material';
import useBoolean from '../../../hooks/useBoolean';

const format = 'h:mm A';

const useStyles = makeStyles((theme: Theme) => ({
    picker: {
        '& .rc-time-picker-input': {
            padding: '14px',
            height: 'unset !important',
            fontSize: '14px',
            color: '#212121',
            borderRadius: '12px'
        }
    },
    pickerPopup: {
        zIndex: theme.zIndex.modal + 1,
        width: '185px',
        position: 'absolute',
        boxSizing: 'border-box'
    }
}));

const AndroidTimePicker = ({ outerValue, onTimeSet, disabled }: AndroidPickerProps) => {
    const classes = useStyles();
    const { value: isOpen, off: closePicker, on: openPicker } = useBoolean();

    const onChange = (value: any) => {
        onTimeSet(value);
    };

    return (
        <TimePicker
            disabled={disabled}
            open={isOpen}
            onOpen={openPicker}
            onClose={closePicker}
            showSecond={false}
            value={outerValue as any}
            className={classes.picker}
            popupClassName={classes.pickerPopup}
            onChange={onChange}
            format={format}
            use12Hours
            inputReadOnly
            allowEmpty={false}
            addon={() => <Button onClick={closePicker}>Ok</Button>}
        />
        /*
        <Autocomplete
            disabled={disabled}
            disablePortal
            id="android-time-picker"
            value={outerValue}
            options={timeOptions}
            disableClearable
            getOptionLabel={(option: Moment) => option.format('hh:mm A')}
            isOptionEqualToValue={(option: Moment, val: Moment) => option.isSame(val)}
            onChange={(event, value) => {
                if (value) {
                    onTimeSet(value);
                }
            }}
            sx={sx}
            renderInput={(params) => <TextField {...params} label={label} variant={variant} />}
            ListboxProps={{
                style: {
                    maxHeight: listMaxHeight,
                    borderBottom: '1px solid',
                    padding: '5px 0'
                }
            }}
            PopperComponent={(props) => (
                // @ts-ignore
                // fixes styles warning bug
                <Popper {...props} style={{ margin: 0, width: sx ? sx.width : undefined }} placement="bottom-start" />
            )}
        />
     */
    );
};

export default AndroidTimePicker;
