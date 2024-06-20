// material-ui
import { Theme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/styles';

// project import
import MainCard, { MainCardProps } from 'ui-component/cards/MainCard';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    card: {
        maxWidth: '920px',
        margin: '0 auto',
        borderRadius: '20px',
        p: `${theme.spacing(2)} !important`,
        // width: '100%',
        '& > *': {
            flexGrow: 1,
            flexBasis: '50%'
        },
        '& > .MuiCardHeader-root': {
            padding: '16px 24px !important',
            backgroundColor: theme.palette.primary.main,
            [theme.breakpoints.down('sm')]: {
                padding: '8px 16px !important'
            }
        },
        '& > .MuiCardHeader-root > .MuiCardHeader-content > span': {
            fontWeight: 'bold',
            color: theme.palette.getContrastText(theme.palette.primary.main)
        },
        '@media(max-width: 800px)': {
            border: 'none'
        },
        '@media(max-width: 600px)': {
            borderRadius: 0
        },
        [theme.breakpoints.down('md')]: {
            // margin: '20px'
        },
        [theme.breakpoints.down('lg')]: {
            // maxWidth: '400px'
        }
    },
    content: {
        padding: `${theme.spacing(3)} !important`,
        [theme.breakpoints.down('lg')]: {
            padding: `${theme.spacing(3)} !important`
        },
        '@media(max-width: 700px)': {
            padding: `${theme.spacing(1)} !important`
        },
        [theme.breakpoints.down('sm')]: {
            padding: '0 !important'
        }
    }
}));

// ==============================|| WIDGET CARD WRAPPER ||============================== //

const WidgetCardWrapper = ({ children, ...other }: MainCardProps) => {
    const classes = useStyles();

    return (
        <MainCard className={classes.card} contentClass={classes.content} title={other.title} {...other}>
            {children}
        </MainCard>
    );
};

export default WidgetCardWrapper;
