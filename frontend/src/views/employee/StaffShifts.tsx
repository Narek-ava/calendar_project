import { Divider, FormHelperText, Grid } from '@material-ui/core';
import CustomShiftsTable from './CustomShiftsTable';
import { CustomShift, IEmployee } from '../../models/IEmployee';
import TwoColumnsSwitch from '../../ui-component/TwoColumnsSwitch';
import InfoTooltip from '../../ui-component/InfoTooltip';
import { FormikErrors } from 'formik';

interface StaffShiftsProps {
    is_shifts_enabled: boolean;
    setFieldValue: (fieldName: string, value: any) => void;
    checkboxFieldName: string;
    shifts: CustomShift[];
    setShifts: (data: CustomShift[]) => void;
    error: string | null;
    errors: FormikErrors<IEmployee>;
}

const StaffShifts = ({ checkboxFieldName, is_shifts_enabled, setShifts, shifts, setFieldValue, error, errors }: StaffShiftsProps) => (
    <>
        <TwoColumnsSwitch
            value={is_shifts_enabled}
            fieldName={checkboxFieldName}
            setFieldValue={setFieldValue}
            label="Custom Shifts"
            labelDecoration={
                <InfoTooltip text="Custom shifts allow you to override regular schedule (location-based and individual) by adding specific dates when provider is not available, or when their schedule is different from normal." />
            }
        />
        {is_shifts_enabled && (
            <>
                <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }} />
                <Grid item xs={12} sm={9} lg={8} sx={{ overflow: 'auto' }}>
                    {error && (
                        <FormHelperText error id="error-shifts">
                            {error}
                        </FormHelperText>
                    )}
                    <CustomShiftsTable shifts={shifts} setShifts={setShifts} errors={errors} />
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
            </>
        )}
    </>
);

export default StaffShifts;
