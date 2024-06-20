// material-ui
import { makeStyles } from '@material-ui/styles';
import { Grid, Theme, Typography } from '@material-ui/core';

// project imports
import MainCard from './MainCard';
import { GenericCardProps } from 'types';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    secondary: {
        marginTop: '.5rem'
    },
    footer: {
        textAlign: 'center',
        padding: theme.spacing(1.2),
        paddingLeft: '20px',
        paddingRight: '20px',
        color: theme.palette.common.white
    }
}));

// ==============================|| REPORT CARD ||============================== //

export interface ReportCardProps extends GenericCardProps {}

const ReportCard = ({ primary, secondary, iconPrimary, color }: ReportCardProps) => {
    const classes = useStyles();

    const IconPrimary = iconPrimary!;
    const primaryIcon = iconPrimary ? <IconPrimary fontSize="large" /> : null;

    return (
        <MainCard>
            <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                    <Typography variant="h3">{primary}</Typography>
                    <Typography variant="body1" className={classes.secondary}>
                        {secondary}
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="h2" style={{ color }}>
                        {primaryIcon}
                    </Typography>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default ReportCard;
