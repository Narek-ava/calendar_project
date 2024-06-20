import { Moment } from 'moment-timezone';

export type TPickerValue = Moment | null;

export interface CustomRangePickerProps {
    start: TPickerValue;
    end: TPickerValue;
    setStart: (data: TPickerValue) => void;
    setEnd: (data: TPickerValue) => void;
    isResponsive: boolean;
    disableFuture?: boolean;
}

export type PresetButtonsProps = Omit<CustomRangePickerProps, 'isResponsive'>;
