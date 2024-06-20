import { Moment } from 'moment-timezone';
import { SxProps } from '@material-ui/system';
import { BaseTextFieldProps } from '@mui/material';

export interface AppTimePickerProps {
    outerValue: Moment;
    onTimeSet: (time: Moment) => void;
    disabled?: boolean;
    sx?: SxProps;
    width?: string;
    variant?: BaseTextFieldProps['variant'];
    listMaxHeight?: string;
    label?: string;
    size?: 'small' | 'medium';
}

type TimePickerPropsBase = Omit<AppTimePickerProps, 'width'>;

export interface TimePickerProps extends TimePickerPropsBase {
    timeOptions: Moment[];
}

export interface AndroidPickerProps {
    outerValue: AppTimePickerProps['outerValue'];
    onTimeSet: AppTimePickerProps['onTimeSet'];
    disabled: AppTimePickerProps['disabled'];
}
