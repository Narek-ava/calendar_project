import { useEffect } from 'react';

// material-ui
import { ClickAwayListener, Divider, InputAdornment, TextField } from '@material-ui/core';

// project imports
import { DurationStepProps } from './types';
import { IconAlarm } from '@tabler/icons';

const DurationStep = ({
    index,
    error,
    removeError,
    serviceData,
    durationData,
    setDurationData,
    isEdit,
    setIsEdit,
    rangeMode
}: DurationStepProps) => {
    // const [value, setValue] = useState<string | number | null>(durationData);

    useEffect(() => {
        if (durationData) {
            // setValue(durationData);
            // setDurationData(durationData);
            return;
        }

        if (serviceData && !rangeMode) {
            // setValue(serviceData.duration);
            setDurationData(serviceData.duration);
        } else {
            // setValue(null);
            // setDurationData(null);
        }
    }, [serviceData]);

    const handleClickAway = () => {
        // if (durationData) {
        //     // setValue(Number(value));
        //     setDurationData(Number(value));
        //     if (error) {
        //         removeError(index);
        //     }
        // }
        setIsEdit(false);
    };

    return (
        <>
            <ClickAwayListener onClickAway={handleClickAway}>
                <TextField
                    fullWidth
                    label="Service Duration"
                    // size="small"
                    // variant={isEdit ? 'filled' : 'outlined'}
                    variant="outlined"
                    focused={isEdit}
                    value={durationData || ''}
                    onChange={(e) => {
                        const targetValue = e.target.value.replace(/^[^\d]*/g, '');
                        // setValue(targetValue);
                        setDurationData(Number(targetValue));
                    }}
                    onKeyDown={(e) => {
                        if (e.type === 'keydown' && e.key === 'Enter') {
                            handleClickAway();
                        }
                    }}
                    onBlur={(e) => {
                        if (Number(e.target.value) < 10) {
                            // setValue('10');
                            setDurationData(10);
                        }
                    }}
                    onClick={() => setIsEdit(true)}
                    autoFocus
                    InputProps={{
                        autoFocus: isEdit,
                        readOnly: !isEdit,
                        startAdornment: (
                            <>
                                <InputAdornment position="start">
                                    <IconAlarm />
                                </InputAdornment>
                                <Divider sx={{ height: 28, m: 0.5, mr: 1.5 }} orientation="vertical" />
                            </>
                        )
                    }}
                />
            </ClickAwayListener>
        </>
    );
};

export default DurationStep;
