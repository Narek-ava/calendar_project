import React from 'react';
import GoogleIcon from 'assets/images/icons/google.svg';
import LoadingButton from '@mui/lab/LoadingButton';
import { styled } from '@material-ui/core/styles';

// Style Google button in accordance with https://developers.google.com/identity/branding-guidelines#top_of_page
const StyledButton = styled(LoadingButton)(() => ({
    height: '40px',
    background: '#fff',
    color: 'rgba(0, 0, 0, 0.54)',
    fontWeight: 600,

    '& img': {
        marginRight: '24px'
    },

    '&:hover': {
        background: '#fff'
    }
}));

interface GoogleButtonProps {
    loading: boolean;
    disabled: boolean;
    onClick: () => void;
    children?: React.ReactElement | string;
}

const GoogleButton = ({ loading, disabled, onClick, children }: GoogleButtonProps) => (
    <StyledButton loading={loading} disabled={disabled} variant="contained" onClick={onClick}>
        <img src={GoogleIcon} />
        {children}
    </StyledButton>
);

export default GoogleButton;
