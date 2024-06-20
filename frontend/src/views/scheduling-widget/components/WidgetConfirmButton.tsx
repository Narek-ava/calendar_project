import { styled } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

const WidgetConfirmButton = styled(Button)(({ theme }) => ({
    background: `linear-gradient(45deg, ${theme.palette.widget.darkGreen}, ${theme.palette.widget.lightGreen})`,
    color: theme.palette.widget.text,
    width: '100%',
    marginTop: theme.spacing(1),

    '& .MuiSvgIcon-root': {
        marginRight: theme.spacing(1)
    }
}));

export default WidgetConfirmButton;
