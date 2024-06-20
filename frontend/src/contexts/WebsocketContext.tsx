import React, { createContext, useEffect } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { axiosServices } from '../utils/axios';
import useAuth from '../hooks/useAuth';
import { useAppDispatch } from 'hooks/redux';
import notificationAPI from 'services/NotificationService';
import appointmentAPI from '../services/AppointmentService';

declare global {
    interface Window {
        Pusher: Pusher;
        Echo: Echo;
    }
}

window.Pusher = require('pusher-js');

const WebsocketContext = createContext({});

export const WebsocketProvider = ({ children }: { children: React.ReactElement }) => {
    const auth = useAuth();
    const dispatch = useAppDispatch();

    const createSocketConnection = () => {
        if (!window.Echo) {
            window.Echo = new Echo({
                broadcaster: 'pusher',
                key: 'app-key',
                wsHost: process.env.REACT_APP_PUSHER_HOST,
                wsPort: process.env.REACT_APP_PUSHER_PORT,
                wssPort: process.env.REACT_APP_PUSHER_PORT,
                forceTLS: false,
                encrypted: true,
                disableStats: true,
                enabledTransports: ['ws', 'wss'],
                authorizer: (channel: { name: any }, options: any) => ({
                    authorize: (socketId: any, callback: (arg0: boolean, arg1: any) => void) => {
                        axiosServices
                            .post('/broadcasting/auth', {
                                socket_id: socketId,
                                channel_name: channel.name
                            })
                            .then((response) => {
                                // Add socketId to future requests to send broadcast->toOthers() except current user
                                // https://laravel.com/docs/9.x/broadcasting#only-to-others-configuration
                                axiosServices.defaults.headers['X-Socket-Id'] = socketId;
                                callback(false, response.data);
                            })
                            .catch((error) => {
                                callback(true, error);
                            });
                    }
                })
            });
        }
    };

    useEffect(() => {
        createSocketConnection();

        window.Echo.connector.pusher.connection.bind('connected', () => {
            console.warn('WS connected');
        });

        window.Echo.connector.pusher.connection.bind('disconnected', () => {
            console.warn('WS disconnected');
        });

        window.Echo.private(`App.Models.Company.${auth.user?.currentCompany?.id}`).listen('.appointments.list.updated', (e: any) => {
            dispatch(appointmentAPI.util.invalidateTags(['Appointment']));
        });

        // Subscribe to update notifications list when notifications are read
        window.Echo.private(`App.Models.User.${auth.user?.id}`).listen('.notifications.list.updated', (e: any) => {
            dispatch(notificationAPI.util.invalidateTags(['Notification']));
        });

        // Subscribe to update appointments list for logged-in user regardless to current company, e.g. own appointment was updated in foreign company
        window.Echo.private(`App.Models.User.${auth.user?.id}`).listen('.appointments.list.updated', (e: any) => {
            dispatch(appointmentAPI.util.invalidateTags(['Appointment']));
            dispatch(notificationAPI.util.invalidateTags(['Notification']));
        });

        // Subscribe to reload page in case of changing current company from another tab
        window.Echo.private(`App.Models.User.${auth.user?.id}`).listen('.contextCompany.changed', (payload: any) => {
            // eslint-disable-next-line eqeqeq
            if (auth.user?.currentCompany?.id != payload.contextCompanyId) window.location.reload();
        });
    }, []);

    return <WebsocketContext.Provider value={{}}>{children}</WebsocketContext.Provider>;
};

export default WebsocketContext;
