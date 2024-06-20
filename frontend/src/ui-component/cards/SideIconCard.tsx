// material-ui
import { makeStyles } from '@material-ui/styles';
import { Theme, useTheme } from '@material-ui/core/styles';
import { Card, CardContent, Grid, SvgIconTypeMap, Typography, useMediaQuery } from '@material-ui/core';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { GenericCardProps } from 'types';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    sideIconCard: {
        position: 'relative'
    },
    sideCardContent: {
        padding: '0',
        paddingBottom: '0 !important'
    },
    sideIcon: {
        padding: '15px 0',
        textAlign: 'center',
        color: '#fff',
        '& > svg': {
            width: '32px',
            height: '32px'
        }
    },
    premium: {
        marginLeft: '15px'
    },
    primaryText: {
        marginLeft: '15px'
    }
}));

// =============================|| SIDE ICON CARD ||============================= //

export interface SideIconCardProps extends GenericCardProps {
    iconPrimary: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & { muiName: string };
    secondarySub?: string;
    bgcolor?: string;
}

const SideIconCard = ({ iconPrimary, primary, secondary, secondarySub, color, bgcolor }: SideIconCardProps) => {
    const classes = useStyles();

    const theme = useTheme();
    const matchDownXs = useMediaQuery(theme.breakpoints.down('xs'));

    const IconPrimary = iconPrimary;
    const primaryIcon = iconPrimary !== undefined ? <IconPrimary /> : null;

    return (
        <Card className={classes.sideIconCard} sx={{ bgcolor: bgcolor || '' }}>
            <CardContent className={classes.sideCardContent}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item xs={4} style={{ background: color }} className={classes.sideIcon}>
                        <Typography variant="h5" className={classes.sideIcon} align="center">
                            {primaryIcon}
                        </Typography>
                    </Grid>
                    <Grid item xs={8}>
                        <Grid
                            container
                            direction="column"
                            justifyContent="space-between"
                            spacing={1}
                            alignItems={matchDownXs ? 'center' : 'flex-start'}
                        >
                            <Grid item sm={12}>
                                <Typography variant="h3" className={classes.premium} sx={{ color: bgcolor ? '#fff' : '' }}>
                                    {primary}
                                </Typography>
                            </Grid>
                            <Grid item sm={12}>
                                <Typography
                                    variant="body2"
                                    align="left"
                                    className={classes.primaryText}
                                    sx={{ color: bgcolor ? '#fff' : 'grey.700' }}
                                >
                                    {secondary} <span style={{ color }}>{secondarySub}</span>{' '}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default SideIconCard;
