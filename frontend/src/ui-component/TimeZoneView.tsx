import moment, { Moment } from 'moment-timezone';
import { Typography } from '@mui/material';
import { SxProps } from '@material-ui/system';
import { TypographyVariants } from './optimized-text-fields/EllipsisTypography';

interface TimeZoneViewProps {
    time_zone: string;
    sx?: SxProps;
    offsetOnly?: boolean;
    variant?: TypographyVariants;
    showOffset?: boolean;
}

const TimeZoneView = ({ time_zone, sx, offsetOnly, variant, showOffset = true }: TimeZoneViewProps) => {
    const tz: Moment = moment.tz(time_zone);
    const offset = tz.format('Z');
    const tz_abbr = tz.format('z');
    const label = tz_abbr === 'UTC' ? '(UTC)' : `(${tz_abbr}${showOffset ? ` / UTC${offset}` : ''})`;
    if (offsetOnly) {
        return tz.utcOffset() !== 0 ? (
            <Typography sx={{ whiteSpace: 'nowrap', ...sx }} variant={variant}>
                {offset}
            </Typography>
        ) : null;
    }
    return (
        <Typography sx={{ whiteSpace: 'nowrap', ...sx }} variant={variant}>
            {label}
        </Typography>
    );
};

export default TimeZoneView;
