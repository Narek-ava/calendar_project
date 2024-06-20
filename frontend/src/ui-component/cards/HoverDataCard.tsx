// material-ui
import { makeStyles } from '@material-ui/styles';
import { Grid, SvgIconTypeMap, Theme, Typography } from '@material-ui/core';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';

// project imports
import MainCard from './MainCard';
import { GenericCardProps } from 'types';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    premium: {
        margin: '14px 0'
    },
    primaryIcon: {
        '& > svg': {
            width: '20px',
            height: '20px'
        }
    },
    mutedText: {
        color: theme.palette.grey[700]
    }
}));

// ============================|| HOVER DATA CARD ||============================ //

export interface HoverDataCardProps extends GenericCardProps {
    iconPrimary: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & { muiName: string };
}

const HoverDataCard = ({ title, iconPrimary, primary, secondary, color }: HoverDataCardProps) => {
    const classes = useStyles();

    const IconPrimary = iconPrimary;
    const primaryIcon = iconPrimary !== undefined ? <IconPrimary fontSize="large" /> : null;

    return (
        <MainCard>
            <Grid container justifyContent="space-between" direction="column" alignItems="center">
                <Grid item sm={12}>
                    <Typography variant="h5" color="inherit">
                        {title}
                    </Typography>
                </Grid>
                <Grid item sm={12}>
                    <Typography variant="h3" className={classes.premium}>
                        {' '}
                        <span className={classes.primaryIcon} style={{ color }}>
                            {' '}
                            {primaryIcon}
                        </span>{' '}
                        {primary}
                    </Typography>
                </Grid>
                <Grid item sm={12}>
                    <Typography variant="body2" className={classes.mutedText}>
                        {secondary}
                    </Typography>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default HoverDataCard;
