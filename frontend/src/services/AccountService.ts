import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { axiosBaseQuery } from '../utils/axios';
import { IUser, IUserEmployeeSettingsPayload, IUserGoogleAccountCalendar } from '../models/IUser';
import { IEmployeeSettings } from '../models/IEmployee';

const userAPI = createApi({
    reducerPath: 'userAPI',
    tagTypes: ['User'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        updateUser: build.mutation<IUser, IUser>({
            query: (user) => ({
                url: '/account',
                method: 'POST',
                data: user
            }),
            invalidatesTags: ['User']
        }),
        getEmployeeSettings: build.query<IEmployeeSettings, null>({
            query: () => ({ url: `/account/get-employee-settings`, method: 'GET' })
        }),
        updateEmployeeSettings: build.mutation<IUser, IUserEmployeeSettingsPayload>({
            query: (employeeSettings) => ({
                url: '/account/update-employee-settings',
                method: 'POST',
                data: employeeSettings
            })
        }),
        getStripeBillingPortalUrl: build.query<string, null>({
            query: () => ({
                url: '/account/stripe-billing-portal-url',
                method: 'GET'
            })
        }),
        getGoogleAuthUrl: build.query<{ url?: string }, null>({
            query: () => ({ url: `/account/google/auth-url`, method: 'GET' })
        }),
        attachGoogleCalendar: build.mutation<{ message: string }, { code: string }>({
            query: (data) => ({ url: `/account/google/attach`, method: 'POST', data: { code: data.code } })
        }),
        detachGoogleCalendar: build.mutation<{ message: string }, null>({
            query: () => ({ url: `/account/google/detach`, method: 'DELETE' })
        }),
        saveGoogleCalendars: build.mutation<{ message: string }, { accountId: number; calendars: IUserGoogleAccountCalendar[] }>({
            query: (data) => ({
                url: `/account/google/select-calendars/${data.accountId}`,
                method: 'PATCH',
                data: { calendars: data.calendars }
            })
        })
    })
});

export default userAPI;
