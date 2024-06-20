import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MomentAdapter from '@mui/lab/AdapterMoment';
import StaticDatePicker from '@mui/lab/StaticDatePicker';
import moment, { Moment } from 'moment-timezone';
import { Box, TextField, Theme } from '@mui/material';
import { CalendarDatePickerProps } from '../types';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => ({
    datepicker: {
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'red',

        '& > div > div > div': {
            maxWidth: '500px',
            width: '100%',
            [theme.breakpoints.down('sm')]: {
                maxWidth: '400px'
            }
        },
        '& .MuiCalendarPicker-root': {
            maxWidth: '700px',
            width: '100%',
            '& > div:first-of-type': {
                // display: 'none'
                marginTop: 0,
                padding: 0,
                justifyContent: 'flex-end',
                '& > div[role="presentation"]': {
                    display: 'none'
                }
            }
        },
        // Days of Week wrapper selector
        '& .MuiCalendarPicker-viewTransitionContainer > div > div': {
            justifyContent: 'space-between'
        },
        '& .MuiCalendarPicker-root > div:last-child > div': {
            justifyContent: 'space-between',
            color: theme.palette.secondary.main
        },
        '& .MuiTypography-root': {
            fontWeight: 'bold'
        },
        // Day of week
        '& .MuiCalendarPicker-root > div:last-child > div > .MuiTypography-root': {
            color: theme.palette.secondary.main
        },
        '& .PrivatePickersSlideTransition-root': {
            minHeight: '230px'
        },
        '& .PrivatePickersSlideTransition-root > div > div[role="row"]': {
            justifyContent: 'space-between'
        },

        '@media(max-width: 600px)': {
            '& .PrivatePickersFadeTransitionGroup-root': {
                overflow: 'hidden'
            },

            '& > div': {
                minWidth: 'auto'
            },

            '& .PrivatePickersSlideTransition-root > div > div[role="row"], .MuiCalendarPicker-viewTransitionContainer > div > div': {
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',

                '& .MuiTypography-root, .MuiPickersDay-root': {
                    width: '100%',
                    maxWidth: '36px'
                }
            }
        }
    }
}));

const CalendarDatePicker = ({
    setDate,
    setCurrentMonthInPicker,
    handleGoToDate,
    location,
    date,
    onDateChange
}: CalendarDatePickerProps) => {
    const classes = useStyles();

    return (
        <Box className={classes.datepicker}>
            <LocalizationProvider dateAdapter={MomentAdapter}>
                <StaticDatePicker<Moment>
                    openTo="day"
                    maxDate={moment().add(2, 'year')}
                    showToolbar={false}
                    value={moment.tz(date, location.time_zone)}
                    onMonthChange={(newValue) => {
                        setCurrentMonthInPicker(moment(newValue).format('MMMM YYYY'));
                    }}
                    onChange={(newValue) => {
                        if (newValue) {
                            setDate(moment.tz(newValue, location.time_zone).format());
                            handleGoToDate(moment.tz(newValue, location.time_zone).toDate());
                            onDateChange();
                        }
                    }}
                    renderInput={(params) => <TextField {...params} disabled />}
                />
            </LocalizationProvider>
        </Box>
    );
};

export default CalendarDatePicker;
