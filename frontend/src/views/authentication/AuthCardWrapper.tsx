// material-ui
import { Theme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/styles';

// project import
import MainCard, { MainCardProps } from 'ui-component/cards/MainCard';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    card: {
        maxWidth: '800px',
        '& > *': {
            flexGrow: 1,
            flexBasis: '50%'
        },
        [theme.breakpoints.down('sm')]: {
            margin: '20px'
        }
    },
    content: {
        padding: `${theme.spacing(5)} !important`,
        [theme.breakpoints.down('lg')]: {
            padding: `${theme.spacing(3)} !important`
        }
    }
}));

// ==============================|| AUTHENTICATION CARD WRAPPER ||============================== //

const AuthCardWrapper = ({ children, ...other }: MainCardProps) => {
    const classes = useStyles();

    return (
        <MainCard className={classes.card} contentClass={classes.content} {...other}>
            {children}
        </MainCard>
    );
};

export default AuthCardWrapper;
