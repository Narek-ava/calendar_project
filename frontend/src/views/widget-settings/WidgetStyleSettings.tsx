import { useCallback } from 'react';
import { FormikErrors, FormikTouched } from 'formik';
import { Box, Button, FormControl, FormHelperText, Grid, Input, Typography } from '@material-ui/core';
import { WidgetBgPatterns, IWidgetSettings } from '../../models/ICompany';
import * as React from 'react';
import BgPatternBox from './BgPatternBox';
import LabelWithInfo from '../../ui-component/LabelWithInfo';
import { useTheme } from '@material-ui/core/styles';

interface WidgetStyleSettingsProps {
    values: IWidgetSettings;
    touched: FormikTouched<IWidgetSettings>;
    errors: FormikErrors<IWidgetSettings>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setFieldValue: (field: string, value: any) => void;
}

const WidgetStyleSettings = ({ values, handleChange, touched, errors, setFieldValue }: WidgetStyleSettingsProps) => {
    const theme = useTheme();

    const resetDefaults = useCallback(() => {
        setFieldValue('primaryColor', theme.palette.widget.green);
        setFieldValue('textColor', theme.palette.widget.text);
        setFieldValue('buttonColor', theme.palette.widget.buttonDetails);
        setFieldValue('bgPattern', undefined);
        setFieldValue('widgetBgPattern', undefined);
    }, [setFieldValue]);

    return (
        <>
            <Box mb={2}>
                <Typography variant="h4" color="primary">
                    Style Settings
                </Typography>
            </Box>
            <Box mt={0} mb={2}>
                <Button variant="outlined" onClick={resetDefaults}>
                    Reset to Default Settings
                </Button>
            </Box>
            <Grid container>
                <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                    <LabelWithInfo label="Primary Color" infoText="Primary color used in booking widget." />
                </Grid>
                <Grid item xs={12} sm={9} lg={6}>
                    <FormControl fullWidth error={Boolean(touched?.primaryColor && errors?.primaryColor)}>
                        <Input
                            type="color"
                            id="primaryColor"
                            name="primaryColor"
                            value={values?.primaryColor ?? theme.palette.widget.green}
                            onChange={handleChange}
                        />
                        {touched?.primaryColor && errors?.primaryColor && (
                            <FormHelperText error id="standard-weight-helper-text--register">
                                {' '}
                                {errors?.primaryColor}{' '}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={3} lg={4} mt={2} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                    <LabelWithInfo label="Text Color" infoText="Text color used in booking widget." />
                </Grid>
                <Grid item xs={12} sm={9} lg={6} mt={2}>
                    <FormControl fullWidth error={Boolean(touched?.textColor && errors?.textColor)}>
                        <Input
                            type="color"
                            id="textColor"
                            name="textColor"
                            value={values?.textColor ?? theme.palette.widget.text}
                            onChange={handleChange}
                        />
                        {touched?.textColor && errors?.textColor && (
                            <FormHelperText error id="standard-weight-helper-text--register">
                                {' '}
                                {errors?.textColor}{' '}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={3} lg={4} mt={2} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                    <LabelWithInfo label="Button Color" infoText="Button color used in booking widget." />
                </Grid>
                <Grid item xs={12} sm={9} lg={6} mt={2}>
                    <FormControl fullWidth error={Boolean(touched?.buttonColor && errors?.buttonColor)}>
                        <Input
                            type="color"
                            id="buttonColor"
                            name="buttonColor"
                            value={values?.buttonColor ?? theme.palette.widget.buttonDetails}
                            onChange={handleChange}
                        />
                        {touched?.buttonColor && errors?.buttonColor && (
                            <FormHelperText error id="standard-weight-helper-text--register">
                                {' '}
                                {errors?.buttonColor}{' '}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={3} lg={4} mt={2} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                    <LabelWithInfo
                        label="Widget Background Pattern"
                        infoText="Background pattern used in booking widget. Please contact support if you need color schemes that are not currently present."
                    />
                </Grid>
                <Grid item xs={12} sm={9} lg={6} mt={2}>
                    <Grid container spacing={1}>
                        {WidgetBgPatterns.map((pattern, key) => (
                            <Grid item xs={2} sm={3} key={`bg_pattern_${key}`}>
                                <BgPatternBox
                                    isActive={values?.bgPattern === key}
                                    start={pattern.start}
                                    end={pattern.end}
                                    onClick={() => {
                                        setFieldValue('bgPattern', key);
                                        setFieldValue('widgetBgPattern', WidgetBgPatterns[key]);
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
};

export default WidgetStyleSettings;
