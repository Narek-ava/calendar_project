import React from 'react';

// material-ui
import { Grid } from '@material-ui/core';
import { Typography } from '@mui/material';

// project imports
import { IUser } from '../../../models/IUser';
import { gridSpacing } from '../../../store/constant';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';
import FormattedPhoneNumber from '../../../ui-component/FormattedPhoneNumber';

interface DetailsFormProps {
    user: IUser;
}

// style const
const useStyles = makeStyles((theme: Theme) => ({
    userData: {
        fontSize: '16px',
        fontWeight: 'bold'
        // [theme.breakpoints.down('md')]: {
        // }
    },
    phone: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: theme.palette.text.primary
    }
}));

const ProfileCard: React.FC<DetailsFormProps> = ({ user }) => {
    const classes = useStyles();

    return (
        <Grid container spacing={gridSpacing} alignItems="center">
            <Grid item xs={4}>
                <Typography>First Name:</Typography>
            </Grid>
            <Grid item xs={8}>
                <Typography className={classes.userData}>{user.firstname}</Typography>
            </Grid>
            <Grid item xs={4}>
                <Typography>Last Name:</Typography>
            </Grid>
            <Grid item xs={8}>
                <Typography className={classes.userData}>{user.lastname}</Typography>
            </Grid>
            <Grid item xs={4}>
                <Typography>Email:</Typography>
            </Grid>
            <Grid item xs={8}>
                <Typography className={classes.userData}>{user.email}</Typography>
            </Grid>
            <Grid item xs={4}>
                <Typography>Phone:</Typography>
            </Grid>
            <Grid item xs={8}>
                <FormattedPhoneNumber phone={user.phone} sx={{ fontWeight: 'bold', fontSize: '16px' }} />
            </Grid>
        </Grid>
    );
};

export default ProfileCard;
