import { styled } from '@material-ui/core/styles';
import { Button } from '@mui/material';

const StyledGreenButton = styled(Button)(({ theme }) => ({
    color: theme.palette.widget.text,
    background: `linear-gradient(45deg, ${theme.palette.widget.darkGreen}, ${theme.palette.widget.lightGreen})`
}));

export default StyledGreenButton;
