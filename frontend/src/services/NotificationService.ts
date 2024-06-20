import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { INotification } from 'models/INotification';
import { axiosBaseQuery } from '../utils/axios';

const notificationAPI = createApi({
    reducerPath: 'notificationAPI',
    tagTypes: ['Notification'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        getAccountNotifications: build.query<INotification[], null>({
            query: () => ({ url: '/account/notifications/', method: 'GET' }),
            providesTags: (result) => ['Notification']
        }),
        markAllNotificationsAsRead: build.mutation({
            query: () => ({ url: '/account/notifications/all-read', method: 'GET' }),
            invalidatesTags: ['Notification']
        }),
        markNotificationAsRead: build.mutation({
            query: (notificationId) => ({ url: `/account/notification/${notificationId}/read`, method: 'GET' }),
            invalidatesTags: ['Notification']
        })
    })
});

export default notificationAPI;
