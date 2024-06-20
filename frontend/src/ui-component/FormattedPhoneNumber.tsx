import { APP_PHONE_FORMAT } from '../store/constant';
import NumberFormat from 'react-number-format';
import { makeStyles } from '@material-ui/styles';
import { Theme, useTheme } from '@material-ui/core/styles';
import { SxProps } from '@material-ui/system';
import { Box } from '@mui/material';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    phone: {
        color: 'inherit',
        fontWeight: 'inherit',
        fontSize: 'inherit'
    }
}));

interface FormattedPhoneNumberProps {
    phone: string;
    sx?: SxProps;
}

const FormattedPhoneNumber = ({ phone, sx }: FormattedPhoneNumberProps) => {
    const theme = useTheme();
    const classes = useStyles();

    return (
        <Box component="span" sx={{ color: theme.palette.text.dark, ...sx }}>
            <NumberFormat value={phone} displayType="text" format={APP_PHONE_FORMAT} className={classes.phone} />
        </Box>
    );
};

export default FormattedPhoneNumber;
