import { useEffect, useMemo } from 'react';
import moment from 'moment-timezone';

// mui
import { Button, Stack } from '@mui/material';

// project imports
import { PresetButtonsProps } from './types';
import { setDayStart } from '../../utils/functions/time-zones-helpers';
import { ButtonVariants } from '../../types';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
    button: {
        whiteSpace: 'nowrap',
        margin: '0 8px 8px',
        minWidth: '85px'
    }
}));

const RangePresetButtons = ({ start, end, setStart, setEnd, disableFuture }: PresetButtonsProps) => {
    const classes = useStyles();
    const zone = moment.tz.guess(true);

    // set localization zone for datePickers
    useEffect(() => {
        moment.tz.setDefault(zone);
    }, []);

    const dates = useMemo(() => {
        const today = setDayStart(moment().tz(zone));
        return {
            today,
            yesterday: today.clone().subtract({ day: 1 }),
            tomorrow: today.clone().add({ day: 1 }),
            lastWeek: {
                start: today.clone().startOf('week').subtract({ week: 1 }),
                end: today.clone().startOf('week')
            },
            lastMonth: {
                start: today.clone().startOf('month').subtract({ month: 1 }),
                end: today.clone().startOf('month')
            },
            nextWeek: {
                start: today.clone().startOf('week').add({ week: 1 }),
                end: today.clone().startOf('week').add({ week: 2 })
            },
            nextMonth: {
                start: today.clone().startOf('month').add({ month: 1 }),
                end: today.clone().startOf('month').add({ month: 2 })
            }
        };
    }, [zone]);

    const variants = useMemo(
        () => ({
            yesterday: start?.isSame(dates.yesterday) && end?.isSame(dates.yesterday) ? 'contained' : 'outlined',
            today: start?.isSame(dates.today) && end?.isSame(dates.today) ? 'contained' : 'outlined',
            tomorrow: start?.isSame(dates.tomorrow) && end?.isSame(dates.tomorrow) ? 'contained' : 'outlined',
            lastWeek: start?.isSame(dates.lastWeek.start) && end?.isSame(dates.lastWeek.end) ? 'contained' : 'outlined',
            lastMonth: start?.isSame(dates.lastMonth.start) && end?.isSame(dates.lastMonth.end) ? 'contained' : 'outlined',
            nextWeek: start?.isSame(dates.nextWeek.start) && end?.isSame(dates.nextWeek.end) ? 'contained' : 'outlined',
            nextMonth: start?.isSame(dates.nextMonth.start) && end?.isSame(dates.nextMonth.end) ? 'contained' : 'outlined'
        }),
        [dates, start, end]
    );

    const handleLastMonth = () => {
        setStart(dates.lastMonth.start);
        setEnd(dates.lastMonth.end);
    };

    const handleLastWeek = () => {
        setStart(dates.lastWeek.start);
        setEnd(dates.lastWeek.end);
    };

    const handleYesterday = () => {
        setStart(dates.yesterday);
        setEnd(dates.yesterday);
    };

    const handleToday = () => {
        setStart(dates.today);
        setEnd(dates.today);
    };

    const handleTomorrow = () => {
        setStart(dates.tomorrow);
        setEnd(dates.tomorrow);
    };

    const handleNextWeek = () => {
        setStart(dates.nextWeek.start);
        setEnd(dates.nextWeek.end);
    };

    const handleNextMonth = () => {
        setStart(dates.nextMonth.start);
        setEnd(dates.nextMonth.end);
    };

    return (
        <Stack direction="row" alignItems="center" flexWrap="wrap">
            <Button
                onClick={handleLastMonth}
                // sx={{ order: isResponsive ? 3 : 0, ml: isResponsive ? 2 : 0 }}
                variant={variants.lastMonth as ButtonVariants}
                size="small"
                className={classes.button}
            >
                Last Month
            </Button>
            <Button
                onClick={handleLastWeek}
                // sx={{ order: 2 }}
                variant={variants.lastWeek as ButtonVariants}
                size="small"
                className={classes.button}
            >
                Last Week
            </Button>
            <Button
                onClick={handleYesterday}
                // sx={{ order: isResponsive ? 1 : 3, ml: isResponsive ? '0 !important' : '16px !important' }}
                variant={variants.yesterday as ButtonVariants}
                size="small"
                className={classes.button}
            >
                Yesterday
            </Button>
            <Button onClick={handleToday} variant={variants.today as ButtonVariants} size="small" className={classes.button}>
                Today
            </Button>
            {!disableFuture && (
                <>
                    <Button onClick={handleTomorrow} variant={variants.tomorrow as ButtonVariants} size="small" className={classes.button}>
                        Tomorrow
                    </Button>
                    <Button onClick={handleNextWeek} variant={variants.nextWeek as ButtonVariants} size="small" className={classes.button}>
                        Next Week
                    </Button>
                    <Button
                        onClick={handleNextMonth}
                        variant={variants.nextMonth as ButtonVariants}
                        size="small"
                        className={classes.button}
                    >
                        Next Month
                    </Button>
                </>
            )}
        </Stack>
    );
};

export default RangePresetButtons;
