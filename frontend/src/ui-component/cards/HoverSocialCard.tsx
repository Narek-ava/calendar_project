// material-ui
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Theme, Typography } from '@material-ui/core';

// project imports
import { GenericCardProps } from 'types';

const useStyles = makeStyles((theme: Theme) => ({
    socialHoverCard: {
        position: 'relative',
        color: '#fff',
        '&:hover svg': {
            opacity: '1',
            transform: 'scale(1.1)'
        }
    },
    socialHoverIcon: {
        position: 'absolute',
        right: '15px',
        top: '25px',
        color: '#fff',
        '&> svg': {
            width: '40px',
            height: '40px',
            opacity: '0.4',
            transition: 'all .3s ease-in-out'
        }
    }
}));

// ===========================|| HOVER SOCIAL CARD ||=========================== //

export interface HoverSocialCardProps extends GenericCardProps {}

const HoverSocialCard = ({ primary, secondary, iconPrimary, color }: HoverSocialCardProps) => {
    const classes = useStyles();

    const IconPrimary = iconPrimary!;
    const primaryIcon = iconPrimary ? <IconPrimary fontSize="large" /> : null;

    return (
        <Card style={{ background: color }} className={classes.socialHoverCard}>
            <CardContent>
                <Typography variant="body2" className={classes.socialHoverIcon}>
                    {primaryIcon}
                </Typography>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <Typography variant="h3" color="inherit">
                            {secondary}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="inherit">
                            {primary}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default HoverSocialCard;
