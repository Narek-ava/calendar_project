import { FormHelperTextProps, InputLabelProps } from '@mui/material';

export interface TimeZoneObject {
    id: number;
    label: string;
    name: string;
    offset: number;
}

export interface TimeZoneSelectProps {
    defaultTimezoneName?: string;
    FormHelperTextProps?: FormHelperTextProps;
    helperText?: string;
    id?: string;
    InputLabelProps?: InputLabelProps;
    label?: string;
    onChange: (timezoneName: string) => void;
    showTimezoneOffset?: boolean;
    selectValue: string;
}
