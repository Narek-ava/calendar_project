// mui
import EmailOutlined from '@material-ui/icons/EmailOutlined';
import PhoneOutlined from '@material-ui/icons/PhoneOutlined';
import { Button, Stack } from '@material-ui/core';
import FormattedPhoneNumber from '../../../ui-component/FormattedPhoneNumber';

interface ContactsProps {
    email?: string | undefined;
    phone: string | undefined;
}

const Contacts = ({ email, phone }: ContactsProps) => {
    const handleEmail = () => {
        if (email) {
            window.location.href = `mailto:${email}`;
        }
    };

    const handlePhoneLink = () => {
        if (phone) {
            window.location.href = `tel:+1${phone}`;
        }
    };

    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 1, mt: 1 }}>
            {phone && (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Button onClick={handlePhoneLink} variant="outlined">
                        <PhoneOutlined />
                    </Button>
                    <FormattedPhoneNumber phone={phone} />
                </Stack>
            )}
            {email && (
                <Button onClick={handleEmail} variant="outlined">
                    <EmailOutlined />
                </Button>
            )}
        </Stack>
    );
};

export default Contacts;
