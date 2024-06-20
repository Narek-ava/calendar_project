import { Grid, Switch } from '@material-ui/core';
import InputLabel from './extended/Form/InputLabel';
import { ReactNode } from 'react';
import { useMediaQuery } from '@mui/material';

interface TwoColumnsSwitchProps {
    fieldName: string;
    setFieldValue: (fieldName: string, value: any) => void;
    label: string;
    value?: boolean;
    helperText?: string;
    labelDecoration?: ReactNode | string;
}

const TwoColumnsSwitch = ({ fieldName, setFieldValue, label, value, helperText, labelDecoration }: TwoColumnsSwitchProps) => {
    const isMobile = useMediaQuery('(max-width:600px)');

    return (
        <>
            <Grid item xs={9} sm={3} lg={4} display="flex" alignItems="center">
                <InputLabel
                    sx={{ cursor: 'pointer' }}
                    horizontal
                    onClick={() => {
                        setFieldValue(fieldName, !value);
                    }}
                >
                    {label}
                </InputLabel>
                {labelDecoration}
            </Grid>
            <Grid item xs={3} sm={9} lg={6} textAlign={isMobile ? 'right' : 'left'}>
                <Switch
                    checked={!!value}
                    name={fieldName}
                    value={!!value}
                    onChange={() => {
                        setFieldValue(fieldName, !value);
                    }}
                />
                {helperText && <i>{helperText}</i>}
            </Grid>
        </>
    );
};

export default TwoColumnsSwitch;
