import { Typography, Stack } from '@mui/material';
import EllipsisTypography from '../../../ui-component/optimized-text-fields/EllipsisTypography';

interface AddressProps {
    matchSm: boolean;
    address: string;
}

const Address = ({ matchSm, address }: AddressProps) => (
    <Stack direction={matchSm ? 'column' : 'row'} alignItems={matchSm ? 'unset' : 'center'} spacing={2}>
        <Typography variant="subtitle1">Address:</Typography>
        <EllipsisTypography variant="body2" text={address} ml={0} sx={{ maxWidth: 'calc(100% - 50px)' }} />
    </Stack>
);

export default Address;
