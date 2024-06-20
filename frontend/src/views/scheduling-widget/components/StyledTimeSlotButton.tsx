import { styled } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

const StyledSlotButton = styled(Button)(({ theme }) => ({
    color: theme.palette.widget.green,
    borderColor: theme.palette.widget.green,

    '&:hover': {
        borderColor: theme.palette.widget.green
    },

    '&.MuiButton-contained': {
        color: theme.palette.widget.text,
        background: `linear-gradient(45deg, ${theme.palette.widget.darkGreen}, ${theme.palette.widget.lightGreen})`
    }
}));

export default StyledSlotButton;
