import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { FormikTouched, FormikValues, FormikErrors } from 'formik';

interface PaymentInfoSelectProps {
    touched: FormikTouched<FormikValues>;
    errors: FormikErrors<FormikValues>;
    values: FormikValues;
    handleChange: (event: SelectChangeEvent) => void;
    setFieldTouched: (a: string, b: boolean) => void;
    fieldName: string;
    label: string;
    options: { value: string; label: string }[];
}

const PaymentInfoSelect = ({
    touched,
    errors,
    values,
    handleChange,
    setFieldTouched,
    fieldName,
    label,
    options
}: PaymentInfoSelectProps) => (
    <FormControl fullWidth error={Boolean(touched[fieldName] && errors[fieldName])}>
        <InputLabel id={`${fieldName}-label`}>{label}</InputLabel>
        <Select
            name={fieldName}
            value={values[fieldName]}
            label={label}
            labelId={`${fieldName}-label`}
            onChange={(event) => {
                handleChange(event);
                setFieldTouched(fieldName, false);
            }}
        >
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
);

export default PaymentInfoSelect;
