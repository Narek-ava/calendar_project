// material-ui
import { makeStyles } from '@material-ui/styles';
import { Theme, useTheme } from '@material-ui/core/styles';
import { Box, Card, CardContent, Grid, Typography } from '@material-ui/core';

// third party
import Chart, { Props as ChartProps } from 'react-apexcharts';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    content: {
        padding: 0,
        paddingBottom: '0 !important'
    }
}));

// ============================|| TOTAL LINE CHART CARD ||============================ //

export interface TotalLineChartCardProps {
    bgColor?: string;
    chartData?: ChartProps;
    title: string;
    percentage: string;
    value: number;
}

const TotalLineChartCard = ({ bgColor, chartData, title, percentage, value }: TotalLineChartCardProps) => {
    const classes = useStyles();
    const theme = useTheme();

    return (
        <Card>
            <CardContent className={classes.content}>
                <Box
                    sx={{
                        color: '#fff',
                        bgcolor: bgColor || theme.palette.primary.dark
                    }}
                >
                    <Box
                        sx={{
                            p: 2.5
                        }}
                    >
                        <Grid container direction="column">
                            <Grid item container justifyContent="space-between" alignItems="center">
                                {value && (
                                    <Grid item>
                                        <Typography variant="h3" color="inherit">
                                            {value}
                                        </Typography>
                                    </Grid>
                                )}
                                {percentage && (
                                    <Grid item>
                                        <Typography variant="body2" color="inherit">
                                            {percentage}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                            {title && (
                                <Grid item>
                                    <Typography variant="body2" color="inherit">
                                        {' '}
                                        {title}{' '}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                    {chartData && <Chart {...chartData} />}
                </Box>
            </CardContent>
        </Card>
    );
};

export default TotalLineChartCard;
