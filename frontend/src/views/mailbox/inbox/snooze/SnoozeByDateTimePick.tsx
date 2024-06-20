import React, { useState } from 'react';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import DateRangeIcon from '@material-ui/icons/DateRange';
import Transitions from '../../../../ui-component/extended/Transitions';
import {
    Button,
    CardContent,
    CircularProgress,
    ClickAwayListener,
    Divider,
    Grid,
    InputAdornment,
    Paper,
    Popper,
    Stack,
    TextField,
    Typography
} from '@material-ui/core';
import { MobileDateTimePicker, LocalizationProvider } from '@material-ui/lab';
import AlarmTwoTone from '@material-ui/icons/AlarmTwoTone';
import { useTheme } from '@material-ui/core/styles';
import MainCard from '../../../../ui-component/cards/MainCard';
import { usePopperStyles } from './SnoozeConversation';

interface ISnoozeByDateTimePick {
    open: boolean;
    anchorRef: any;
    handleClose: (event: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => void;
    snoozeConversation: (date: string) => void;
    unSnooze: () => void;
    initialDate: string;
    isSnoozed: boolean;
    isLoading: boolean;
}

const SnoozeByDateTimePick = ({
    open,
    anchorRef,
    handleClose,
    snoozeConversation,
    unSnooze,
    initialDate,
    isSnoozed,
    isLoading
}: ISnoozeByDateTimePick) => {
    const classes = usePopperStyles();
    const theme = useTheme();
    const [dateTime, setDateTime] = useState(initialDate);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        snoozeConversation(dateTime);
    };

    return (
        <Popper
            placement="bottom-end"
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            popperOptions={{
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 14]
                        }
                    }
                ]
            }}
        >
            {({ TransitionProps }) => (
                <Transitions in={open} {...TransitionProps}>
                    <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                            <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                                <CardContent className={classes.cardContent}>
                                    <Grid
                                        container
                                        spacing={2}
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{ p: '0 16px 10px' }}
                                    >
                                        {isLoading && (
                                            <Grid item>
                                                <CircularProgress />
                                            </Grid>
                                        )}
                                        <Grid item>
                                            <AlarmTwoTone fontSize="medium" />
                                        </Grid>
                                        <Grid item zeroMinWidth>
                                            <Typography component="span" align="left" variant="subtitle1">
                                                Snooze
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Divider />
                                    <Grid container sx={{ p: '16px' }} direction="column">
                                        {isSnoozed && (
                                            <Grid item>
                                                <Typography sx={{ mb: 4 }}>Snoozed until:</Typography>
                                            </Grid>
                                        )}
                                        <Grid item>
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                {/* @ts-ignore */}
                                                <form noValidate onSubmit={handleSubmit}>
                                                    <MobileDateTimePicker
                                                        label="date & time"
                                                        ampmInClock
                                                        disabled={isSnoozed}
                                                        minDateTime={new Date()}
                                                        value={dateTime}
                                                        inputFormat="dd/MM/yyyy hh:mm a"
                                                        onChange={(date) => (date ? setDateTime(date.toJSON()) : null)}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                fullWidth
                                                                InputProps={{
                                                                    endAdornment: (
                                                                        <InputAdornment position="end">
                                                                            <DateRangeIcon />
                                                                        </InputAdornment>
                                                                    )
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    <Stack direction="row" spacing={4} justifyContent="space-between" sx={{ mt: '20px' }}>
                                                        {isSnoozed && <Button onClick={unSnooze}>Unsnooze</Button>}
                                                        <Stack direction="row" spacing={2}>
                                                            {/* @ts-ignore */}
                                                            <Button onClick={handleClose}>Cancel</Button>
                                                            {!isSnoozed && <Button type="submit">Snooze</Button>}
                                                        </Stack>
                                                    </Stack>
                                                </form>
                                            </LocalizationProvider>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </MainCard>
                        </ClickAwayListener>
                    </Paper>
                </Transitions>
            )}
        </Popper>
    );
};

export default SnoozeByDateTimePick;
