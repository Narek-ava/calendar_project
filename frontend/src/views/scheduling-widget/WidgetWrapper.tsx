// material-ui
import { styled } from '@material-ui/core/styles';
import 'typeface-pt-sans';

// ==============================|| WIDGET MAIN WRAPPER ||============================== //

const WidgetWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 1, 1, 1),
    background: `linear-gradient(135deg, ${theme.palette.widget.bgTop}, ${theme.palette.widget.bgBottom})`,
    minHeight: '100vh',
    wordBreak: 'break-word',

    '@media(max-width: 600px)': {
        padding: 0,

        '& form': {
            // maxHeight: 'calc(100vh - 270px)',
            overflowY: 'auto'
        }
    },

    '& .MuiBackdrop-root': {
        zIndex: 2
    },

    '@media(max-width: 800px)': {
        backgroundColor: theme.palette.background.paper
    },

    '& .MuiTypography-root': {
        fontFamily: 'PT Sans'
    },

    '& .MuiFormControl-root': {
        '& label.Mui-focused': {
            color: theme.palette.widget.text
        },
        '& .MuiOutlinedInput-root': {
            color: theme.palette.widget.text,
            '& fieldset': {
                borderRadius: '5px',
                borderColor: theme.palette.grey[500]
            },
            '&:hover fieldset': {
                borderColor: theme.palette.widget.text
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.widget.text
            }
        }
    }
    // overflow: 'hidden'
}));

export default WidgetWrapper;
