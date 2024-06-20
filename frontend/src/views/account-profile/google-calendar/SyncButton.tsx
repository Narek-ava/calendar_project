import { useState, useEffect } from 'react';
import userAPI from 'services/AccountService';
import useShowSnackbar from '../../../hooks/useShowSnackbar';
import { SnackBarTypes } from '../../../store/snackbarReducer';
import useAuth from '../../../hooks/useAuth';
import GoogleButton from './GoogleButton';

const SyncButton = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const { checkAuthentication } = useAuth();
    const { data: authUrl, isLoading: urlLoading } = userAPI.useGetGoogleAuthUrlQuery(null);
    const [attachCalendar] = userAPI.useAttachGoogleCalendarMutation();
    const { showSnackbar } = useShowSnackbar();

    const attach = (code: string) => {
        setLoading(true);
        attachCalendar({ code })
            .unwrap()
            .then((response) => {
                checkAuthentication().then(() => {
                    setLoading(false);
                    showSnackbar({
                        alertSeverity: SnackBarTypes.Success,
                        message: response.message || 'Google Account Attached'
                    });
                });
            })
            .catch((err) => {
                setLoading(false);
                showSnackbar({
                    alertSeverity: SnackBarTypes.Error,
                    message: err.data || 'Error occurred, please try again'
                });
            });

        const popup = window.open('', 'googlePopup');
        popup?.close();
    };

    const handleIframeMessage = (ev: any) => {
        try {
            const data = JSON.parse(ev.data);
            if (data.is_google_auth_response) {
                attach(data.code);
            }
        } catch (e) {
            //
        }
    };

    useEffect(() => {
        window.addEventListener('message', handleIframeMessage, true);

        return () => {
            window.removeEventListener('message', handleIframeMessage, true);
        };
    }, []);

    const sync = async () => {
        if (!authUrl?.url) return;

        window.open(authUrl.url, 'googlePopup', 'width=600,height=600');
    };

    return (
        <GoogleButton loading={loading || urlLoading} disabled={urlLoading || !authUrl} onClick={sync}>
            Sync with Google
        </GoogleButton>
    );
};

export default SyncButton;
