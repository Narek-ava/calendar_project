import { useCallback, useEffect, useMemo } from 'react';
import { ILocation } from '../../models/ILocation';
import { Typography, CircularProgress, Box } from '@material-ui/core';
import { FormControl, MenuItem, Select } from '@mui/material';

import companyAPI from '../../services/CompanyService';
import useAuth from '../../hooks/useAuth';
import FormattedPhoneNumber from '../../ui-component/FormattedPhoneNumber';

interface TwilioPhoneProps {
    location: ILocation;
    value?: string;
    setFieldValue: (a: string, b: any) => void;
}

const TwilioPhone = ({ location, value, setFieldValue }: TwilioPhoneProps) => {
    const { user } = useAuth();

    const [trigger, { isLoading, isError, data }] = companyAPI.endpoints.getTwilioPhones.useLazyQuery();

    const handleOpen = useCallback(() => {
        if (!data) trigger(user?.currentCompany.id.toString() || '');
    }, [data, trigger, user]);

    const isNumberInvalid = useMemo(
        () => !!(location.twilio_phone && data && !data.map((n) => n.phone_number).includes(location.twilio_phone)),
        [data, location]
    );

    useEffect(() => {
        if (isNumberInvalid) {
            setFieldValue('twilio_phone', null);
        }
    }, [isNumberInvalid, setFieldValue]);

    return isError || (data && data.length === 0) ? (
        <Typography color="error">Cannot retrieve phone numbers from Twilio, please contact administrator</Typography>
    ) : (
        <FormControl fullWidth>
            {isNumberInvalid && !value && (
                <Typography color="error" fontSize="small">
                    Your current phone number in not in the numbers list, please select new number from the list if you want to keep the SMS
                    notifications working.
                </Typography>
            )}
            <Select
                value={value || ''}
                onOpen={handleOpen}
                name="twilio_phone"
                onChange={(e) => {
                    setFieldValue('twilio_phone', e.target.value);
                }}
            >
                {isLoading && (
                    <Box px={2} pt={2} pb={1} display="flex" alignItems="center">
                        <Typography>Loading phone numbers</Typography>
                        <CircularProgress size={20} sx={{ ml: 1 }} />
                    </Box>
                )}

                {data &&
                    data.length > 0 &&
                    data.map((phone, index) => (
                        <MenuItem key={`phone_${index}`} value={phone.friendly_name}>
                            <FormattedPhoneNumber phone={phone.friendly_name} />
                        </MenuItem>
                    ))}

                {!data && location.twilio_phone && (
                    <MenuItem value={location.twilio_phone}>
                        <FormattedPhoneNumber phone={location.twilio_phone} />
                    </MenuItem>
                )}
                {data && data.length === 0 && !isLoading && (
                    <Typography px={2} pt={2} pb={1}>
                        No phone numbers found
                    </Typography>
                )}
            </Select>
        </FormControl>
    );
};

export default TwilioPhone;
