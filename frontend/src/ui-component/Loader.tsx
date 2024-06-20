// material-ui
import { makeStyles } from '@material-ui/styles';
import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress';
import { Theme } from '@material-ui/core/styles';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1301,
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2)
        }
    }
}));

// ==============================|| Loader ||============================== //

export interface LoaderProps extends LinearProgressProps {}

const Loader = () => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <LinearProgress color="primary" />
        </div>
    );
};

export default Loader;
