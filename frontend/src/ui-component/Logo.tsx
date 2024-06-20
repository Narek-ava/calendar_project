// material-ui
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';

// logo
import logo from 'assets/images/logo_horizontal_title.png';

const useStyles = makeStyles((theme: Theme) => ({
    image: {
        width: '150px'
    }
    // text: {
    //     color: '#0c3c5c',
    //     fontWeight: 'bold',
    //     fontSize: '16px'
    // }
}));

// ==============================|| LOGO ||============================== //

const Logo = () => {
    const classes = useStyles();

    return (
        <>
            <img className={classes.image} src={logo} alt="Chilled Butter App" />
        </>
    );
};

export default Logo;
