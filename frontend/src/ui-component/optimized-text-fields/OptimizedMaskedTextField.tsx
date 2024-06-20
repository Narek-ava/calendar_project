import * as React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useCallback, useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import NumberFormat from 'react-number-format';
import { INPUT_DELAY, OptimizedTextFieldProps } from './OptimizedTextField';
import { APP_PHONE_FORMAT } from '../../store/constant';

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
}

export const NumberFormatCustom = React.forwardRef<NumberFormat<any>, CustomProps>((props, ref) => {
    const { onChange, ...other } = props;
    return (
        <NumberFormat
            {...other}
            getInputRef={ref}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value
                    }
                });
            }}
            format={APP_PHONE_FORMAT}
            mask="_"
            // allowEmptyFormatting={true}
        />
    );
});

const OptimizedMaskedTextField = ({
    id,
    value,
    onChange,
    name,
    error,
    sx,
    helperText,
    onBlur,
    placeholder,
    disabled,
    InputProps,
    variant = 'outlined',
    defaultValue,
    fullWidth,
    label
}: OptimizedTextFieldProps) => {
    const [innerValue, setInnerValue] = useState('');

    useEffect(() => {
        if (value) {
            setInnerValue(value as string);
        } else {
            setInnerValue('');
        }
    }, [value]);

    const debouncedHandleOnChange = useDebouncedCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(event);
        }
    }, INPUT_DELAY);

    const handleOnChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        // if (event.type === 'focus') {
        //     return;
        // }
        // event.persist();
        const newValue = event.target.value;
        setInnerValue(newValue);
        debouncedHandleOnChange(event);
    }, []);

    const debouncedHandleOnBlur = useDebouncedCallback((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (onBlur) {
            onBlur(event);
        }
    }, INPUT_DELAY);

    const handleOnBlur = useCallback((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // event.persist();

        const newValue = event.currentTarget.value;
        setInnerValue(newValue);
        debouncedHandleOnBlur(event);
    }, []);

    return (
        <TextField
            value={innerValue}
            onChange={handleOnChange}
            fullWidth={fullWidth}
            disabled={disabled}
            placeholder={placeholder}
            label={label}
            name={name}
            onBlur={handleOnBlur}
            id={id}
            error={error}
            helperText={helperText}
            defaultValue={defaultValue}
            sx={sx}
            variant={variant}
            InputProps={{
                ...InputProps,
                inputComponent: NumberFormatCustom as any
            }}
        />
    );
};

export default OptimizedMaskedTextField;
