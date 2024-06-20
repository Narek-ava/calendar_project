// material-ui
import { makeStyles } from '@material-ui/styles';
import { List, Theme } from '@material-ui/core';

// assets
import { INotification } from 'models/INotification';
import NotificationItem from './NotificationItem';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    navContainer: {
        width: '100%',
        maxWidth: '330px',
        paddingTop: 0,
        paddingBottom: 0,
        borderRadius: '10px',
        [theme.breakpoints.down('sm')]: {
            maxWidth: '300px'
        }
    }
}));

// ==============================|| NOTIFICATION LIST ||============================== //

type NotificationListProps = {
    notifications?: INotification[];
    setOpen: (arg: boolean) => void;
};

const NotificationList = ({ notifications, setOpen }: NotificationListProps) => {
    const classes = useStyles();
    return (
        <List className={classes.navContainer}>
            {notifications &&
                notifications.map((notification, index) => (
                    <NotificationItem
                        key={`notification-${notification.notifiable_id}_${index}`}
                        notification={notification}
                        setOpen={setOpen}
                    />
                ))}
        </List>
    );
};

export default NotificationList;
