import { styled } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

const StyledBackButton = styled(Button)(({ theme }) => ({
    color: theme.palette.widget.text,
    backgroundColor: theme.palette.grey[100],
    '&:hover': {
        backgroundColor: theme.palette.grey[200]
    },

    '& .MuiButton-startIcon': {
        marginRight: 0
    }
}));

export default StyledBackButton;
