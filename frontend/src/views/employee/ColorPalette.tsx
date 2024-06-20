// material-ui
import { FormControlLabel, Radio } from '@material-ui/core';
import { ColorPaletteProps } from 'types';

// ==============================|| CALENDAR COLOR PALETTE ||============================== //

const ColorPalette = ({ label, value }: ColorPaletteProps) => (
    <FormControlLabel
        value={value}
        control={
            <Radio
                sx={{
                    color: value,
                    '&.Mui-checked': { color: value }
                }}
            />
        }
        label={label}
        sx={{ pr: label ? 2 : 0 }}
    />
);

export default ColorPalette;
