// material-ui
import { makeStyles } from '@material-ui/styles';
// import { useTheme } from '@material-ui/core/styles';
import { Tooltip, Theme, ButtonBase, Avatar } from '@material-ui/core';
import { Link } from 'react-router-dom';

// assets
import { IconExternalLink } from '@tabler/icons';

// project import
import useAuth from 'hooks/useAuth';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    grow: {
        flexGrow: 1
    },
    headerAvatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        transition: 'all .2s ease-in-out',
        background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
        color: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark,
        '&:hover': {
            background: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark,
            color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.light
        }
    },
    boxContainer: {
        width: '228px',
        display: 'flex',
        [theme.breakpoints.down('md')]: {
            width: 'auto'
        }
    }
}));

const WidgetLink = () => {
    const classes = useStyles();
    const { user } = useAuth();

    return (
        <>
            <Tooltip title="to Widget" placement="top" arrow>
                <ButtonBase component={Link} to={`/cal/${user?.currentCompany.slug}`} target="_blank" sx={{ borderRadius: '12px', ml: 2 }}>
                    <Avatar variant="rounded" className={classes.headerAvatar} color="inherit">
                        <IconExternalLink stroke={1.5} size="1.3rem" />
                    </Avatar>
                </ButtonBase>
            </Tooltip>
        </>
    );
};

export default WidgetLink;
