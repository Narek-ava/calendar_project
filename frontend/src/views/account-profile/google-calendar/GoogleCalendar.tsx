import { useState, useEffect, useCallback } from 'react';
import SyncButton from './SyncButton';
import DetachButton from './DetachButton';
import useAuth from '../../../hooks/useAuth';
import {
    Grid,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Checkbox,
    Typography,
    CircularProgress,
    Box
} from '@material-ui/core';
import userAPI from '../../../services/AccountService';
import { SnackBarTypes } from '../../../store/snackbarReducer';
import useShowSnackbar from '../../../hooks/useShowSnackbar';
import LoadingButton from '@mui/lab/LoadingButton';

const GoogleCalendar = () => {
    const { user, checkAuthentication } = useAuth();
    const [saveGoogleCalendars] = userAPI.useSaveGoogleCalendarsMutation();
    const [calendars, setCalendars] = useState<number[]>([]);
    const { showSnackbar } = useShowSnackbar();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!user?.google_accounts.length) return;

        if (!user.google_accounts[0].calendars.length) {
            setCalendars([]);
            setTimeout(() => {
                checkAuthentication();
            }, 2000);
            return;
        }

        setCalendars(user.google_accounts[0].calendars.filter((c) => c.accounting_events).map((c) => c.id));
    }, [user]);

    const toggleCalendar = useCallback(
        (calendarId: number) => {
            setCalendars(calendars.includes(calendarId) ? calendars.filter((c) => c !== calendarId) : [...calendars, calendarId]);
        },
        [calendars]
    );

    const saveCalendars = useCallback(() => {
        if (!user?.google_accounts.length) return;

        const calendarsPayload = user.google_accounts[0].calendars.map((c) => ({ ...c, accounting_events: calendars.includes(c.id) }));

        setLoading(true);
        saveGoogleCalendars({
            accountId: user.google_accounts[0].id,
            calendars: calendarsPayload
        })
            .unwrap()
            .then((response) => {
                checkAuthentication().then(() => {
                    showSnackbar({
                        alertSeverity: SnackBarTypes.Success,
                        message: response?.message || 'Settings updated successfully.'
                    });
                    setLoading(false);
                });
            })
            .catch((err) => {
                showSnackbar({
                    alertSeverity: SnackBarTypes.Error,
                    message: err.data || 'Error occurred, please contact administrator'
                });
                setLoading(false);
            });
    }, [calendars, saveGoogleCalendars, user]);

    return (
        <Grid container>
            <Grid item xs={12}>
                {user?.google_accounts.length ? <DetachButton /> : <SyncButton />}
            </Grid>
            {!!user?.google_accounts.length && (
                <Grid item>
                    <Typography variant="h4" color="primary" mt={2}>
                        Google calendars from {user?.google_accounts[0].name}:
                    </Typography>
                    {user?.google_accounts[0].calendars.length ? (
                        <>
                            <List>
                                {user?.google_accounts[0].calendars.map((calendar) => (
                                    <ListItem disablePadding key={`calendar_${calendar.id}`}>
                                        <ListItemButton role={undefined} dense onClick={() => toggleCalendar(calendar.id)}>
                                            <ListItemIcon>
                                                <Checkbox checked={calendars.includes(calendar.id)} tabIndex={-1} />
                                            </ListItemIcon>
                                            <ListItemText primary={calendar.name} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                            <LoadingButton loading={loading} disabled={loading} variant="contained" onClick={saveCalendars}>
                                Save Calendars
                            </LoadingButton>
                        </>
                    ) : (
                        <Box display="flex" flexDirection="column" alignItems="center" py={2}>
                            <Typography pb={2}>Your calendars will be loaded soon...</Typography>
                            <CircularProgress />
                        </Box>
                    )}
                </Grid>
            )}
        </Grid>
    );
};

export default GoogleCalendar;
