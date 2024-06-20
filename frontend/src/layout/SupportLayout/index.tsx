import { Outlet } from 'react-router-dom';
import { AppBar } from '@material-ui/core';
import SupportHeader from './SupportHeader';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'flex'
    },
    appBar: {
        backgroundColor: theme.palette.background.default
    },
    content: {
        margin: '75px 0 0 0',
        width: '100%'
    }
}));

const SupportLayout = () => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <AppBar position="fixed" color="inherit" elevation={0} className={classes.appBar}>
                <SupportHeader />
            </AppBar>
            <main className={classes.content}>
                <Outlet />
            </main>
        </div>
    );
};

export default SupportLayout;
