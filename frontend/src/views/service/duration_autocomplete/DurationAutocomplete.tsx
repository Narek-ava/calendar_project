import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { getDurations } from '../../../store/constant';
import { Divider, InputAdornment } from '@material-ui/core';
import { useDebouncedCallback } from 'use-debounce';
import useDigits from '../../../hooks/useDigits';
import { INPUT_DELAY } from '../../../ui-component/optimized-text-fields/OptimizedTextField';

interface DurationAutocompleteProps {
    name?: string;
    min?: number;
    label?: string;
    value: string;
    setDuration: (d: string | null) => void;
    onBlur: (d: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> | undefined) => void;
}

const DurationAutocomplete = ({ label, value, setDuration, onBlur, min, name }: DurationAutocompleteProps) => {
    const [innerValue, setInnerValue] = useState('');
    const { onInput, onKeyDown } = useDigits();

    useEffect(() => {
        if (value) {
            setInnerValue(value as string);
        } else {
            setInnerValue('');
        }
    }, [value]);

    const handleOnBlur = useCallback((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        event.persist();

        const newValue = event.target.value;
        setInnerValue(newValue);
        debouncedHandleOnBlur(event);
    }, []);

    const debouncedHandleOnBlur = useDebouncedCallback((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (onBlur) {
            onBlur(event);
        }
    }, INPUT_DELAY);

    const debouncedHandleOnChange = useDebouncedCallback((newValue: string | null) => {
        if (setDuration) {
            setDuration(newValue);
        }
    }, INPUT_DELAY);

    const handleOnChange = useCallback((val: string) => {
        // const newValue = val.replace(/[^\d]/, '');
        // console.log(newValue);
        setInnerValue(val);
        debouncedHandleOnChange(val);
    }, []);

    return (
        <Autocomplete
            disablePortal
            id="duration-autocomplete"
            // size="small"
            freeSolo
            ListboxProps={{
                style: {
                    maxHeight: '120px'
                }
            }}
            value={innerValue}
            onKeyDown={(target) => {
                onKeyDown(target);
            }}
            onInput={(e) => {
                onInput(e);
            }}
            openOnFocus={false}
            onInputChange={(event: any, newValue, reason) => {
                // console.log(event.target.value);
                // const targetValue = newValue.replace(/[^\d]/, '');
                // setDuration(targetValue);
                handleOnChange(newValue);
                // if (newValue) {
                //     setDuration(newValue);
                // } else {
                //     setDuration('');
                // }
            }}
            disableClearable
            options={getDurations({ min })}
            renderInput={(params) => (
                <TextField
                    {...params}
                    onBlur={handleOnBlur}
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <>
                                <InputAdornment position="start" sx={{ pl: 1, pr: 0 }}>
                                    Minutes
                                </InputAdornment>
                                <Divider sx={{ height: 28, m: 0.5, mr: 1.5 }} orientation="vertical" />
                            </>
                        )
                    }}
                    name={name}
                    label={label || ''}
                />
            )}
        />
    );
};

export default DurationAutocomplete;
