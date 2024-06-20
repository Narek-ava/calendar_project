import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { axiosBaseQuery } from '../utils/axios';
import { IPaginateResponse } from 'models/IPaginateResponse';
import { IMailbox } from '../models/IMailbox';
import { IMailboxCreateForm } from '../views/mailbox/MailboxCreateDialog';

const path = '/mailboxes';

const mailboxAPI = createApi({
    reducerPath: 'mailboxAPI',
    tagTypes: ['Mailbox'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        fetchAllMailboxes: build.query<IPaginateResponse<IMailbox[]>, null>({
            query: () => ({
                url: `${path}`,
                method: 'GET'
            }),
            providesTags: (result) => ['Mailbox']
        }),
        getMailbox: build.query<IMailbox, string>({
            query: (id) => ({
                url: `${path}/${id}`,
                method: 'GET'
            }),
            providesTags: (result) => ['Mailbox']
        }),
        createMailbox: build.mutation<IMailbox, IMailboxCreateForm>({
            query: (formData) => ({
                url: `${path}`,
                method: 'POST',
                data: formData
            }),
            invalidatesTags: ['Mailbox']
        }),
        updateMailbox: build.mutation<IMailbox, IMailbox>({
            query: (mailbox) => ({
                url: `${path}/${mailbox.id}`,
                method: 'PUT',
                data: mailbox
            }),
            invalidatesTags: ['Mailbox']
        }),
        deleteMailbox: build.mutation<IMailbox, IMailbox>({
            query: (mailbox) => ({
                url: `${path}/${mailbox.id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Mailbox']
        })
    })
});

export default mailboxAPI;
