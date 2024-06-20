import { useDebouncedCallback } from 'use-debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { BaseTextFieldProps, TextField } from '@mui/material';
import { InputProps as MuiInputProps } from '@mui/material/Input/Input';
import { SxProps } from '@material-ui/system';

export const INPUT_DELAY = 400;

export interface OptimizedTextFieldProps {
    id: string;
    value?: string | number | null | undefined;
    disabled?: boolean;
    autocomplete?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    name?: string;
    placeholder?: string;
    variant?: BaseTextFieldProps['variant'];
    defaultValue?: string;
    InputProps?: Partial<MuiInputProps> | undefined;
    sx?: SxProps;
    error?: boolean;
    helperText?: string | false | undefined;
    digits?: boolean;
    fullWidth?: boolean;
    multiline?: boolean;
    rows?: number;
    label?: string;
    autoFocus?: boolean;
    size?: 'small' | 'medium';
    type?: React.InputHTMLAttributes<unknown>['type'];
}

const OptimizedTextField = ({
    id,
    value,
    disabled,
    digits,
    onChange,
    autocomplete,
    name,
    onBlur,
    placeholder,
    error,
    helperText,
    InputProps,
    defaultValue,
    sx,
    variant = 'outlined',
    fullWidth,
    multiline,
    rows,
    label,
    autoFocus,
    size,
    type = 'text'
}: OptimizedTextFieldProps) => {
    const [innerValue, setInnerValue] = useState('');

    useEffect(() => {
        if (value || value === 0) {
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

    const debouncedHandleOnBlur = useDebouncedCallback((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (onBlur) {
            onBlur(event);
        }
    }, INPUT_DELAY);

    const handleOnChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist();
        let newValue;
        if (digits) {
            newValue = event.currentTarget.value.replace(/[^\d]/, '');
        } else {
            newValue = event.currentTarget.value;
        }
        setInnerValue(newValue);
        debouncedHandleOnChange(event);
    }, []);

    const handleOnBlur = useCallback((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        event.persist();

        const newValue = event.currentTarget.value;
        setInnerValue(newValue);
        debouncedHandleOnBlur(event);
    }, []);

    return (
        <TextField
            fullWidth={fullWidth}
            multiline={multiline}
            rows={rows}
            disabled={disabled}
            label={label}
            placeholder={placeholder}
            name={name}
            value={innerValue}
            onChange={handleOnChange}
            onBlur={handleOnBlur}
            autoComplete={autocomplete}
            id={id}
            autoFocus={autoFocus}
            error={error}
            helperText={helperText}
            InputProps={InputProps}
            defaultValue={defaultValue}
            sx={sx}
            variant={variant}
            size={size}
            type={type}
        />
    );
};

export default OptimizedTextField;
