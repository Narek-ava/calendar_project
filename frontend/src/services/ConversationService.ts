import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { axiosBaseQuery } from '../utils/axios';
import {
    IAssign,
    IAssignBulk,
    IConversation,
    ICreateConversation,
    ICreateThread,
    ISnoozeConversation,
    IThread,
    IUnreadBulk,
    IUrlIds
} from '../models/IConversation';
import { IPaginateConversations } from '../models/IPaginateResponse';
import { statuses } from '../store/constant';

const mailboxPath = '/mailboxes';
const conversationPath = 'conversations';
const threadPath = 'threads';
const assignPath = 'assign';

interface IParams {
    id: string | number;
    folderId?: number;
    search?: string;
    page?: number;
    per_page?: number;
}

const conversationAPI = createApi({
    reducerPath: 'conversationAPI',
    tagTypes: ['Conversation', 'Thread'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        fetchAllConversations: build.query<IPaginateConversations<IConversation[]>, IParams>({
            query: ({ id, search, folderId, per_page = 10, page = 1 }) => ({
                url: `${mailboxPath}/${id}/${conversationPath}`,
                method: 'GET',
                params: {
                    folderId,
                    search,
                    page,
                    per_page
                }
            }),
            providesTags: (result) => ['Conversation']
        }),
        getConversation: build.query<IConversation, IUrlIds>({
            query: (ids) => ({
                url: `${mailboxPath}/${ids.mailboxId}/${conversationPath}/${ids.conversationId}`,
                method: 'GET'
            }),
            providesTags: (result) => ['Conversation']
        }),
        getConversationByFolderId: build.query<IConversation, IUrlIds>({
            query: (ids) => ({
                url: `${mailboxPath}/${ids.mailboxId}/${conversationPath}/${ids.conversationId}`,
                method: 'GET'
            }),
            providesTags: (result) => ['Conversation']
        }),
        createConversation: build.mutation<IConversation, ICreateConversation>({
            query: (data) => ({
                url: `${mailboxPath}/${data.mailboxId}/${conversationPath}`,
                method: 'POST',
                data: data.formData
            }),
            invalidatesTags: ['Conversation']
        }),
        deleteConversation: build.mutation<IConversation, IConversation>({
            query: (conversation) => ({
                url: `${mailboxPath}/${conversation.mailboxId}/${conversationPath}/${conversation.id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Conversation']
        }),
        createThread: build.mutation<IThread, ICreateThread>({
            query: (data: ICreateThread) => ({
                url: `${mailboxPath}/${data.conversation.mailboxId}/${conversationPath}/${data.conversation.id}/${threadPath}`,
                method: 'POST',
                data: data.data
            }),
            invalidatesTags: ['Thread']
        }),
        assignConversation: build.mutation<IConversation, IAssign>({
            query: ({ conversation, user_id }) => ({
                url: `${mailboxPath}/${conversation.mailboxId}/${conversationPath}/${conversation.id}/${assignPath}`,
                method: 'POST',
                data: { user_id }
            }),
            invalidatesTags: ['Conversation']
        }),
        assignSeveralConversations: build.mutation<IConversation, IAssignBulk>({
            query: ({ mailboxId, data }) => ({
                url: `${mailboxPath}/${mailboxId}/${conversationPath}/${assignPath}/bulk`,
                method: 'POST',
                data
            }),
            invalidatesTags: ['Conversation']
        }),
        snoozeConversation: build.mutation<IConversation, ISnoozeConversation>({
            query: ({ data, conversation: { mailboxId, id } }) => ({
                url: `${mailboxPath}/${mailboxId}/${conversationPath}/${id}/status`,
                method: 'POST',
                data
            }),
            invalidatesTags: ['Conversation']
        }),
        unreadConversation: build.mutation<IConversation, IConversation>({
            query: ({ mailboxId, id }) => ({
                url: `${mailboxPath}/${mailboxId}/${conversationPath}/${id}/unread`,
                method: 'POST'
            }),
            invalidatesTags: ['Conversation']
        }),
        unreadSelectedConversations: build.mutation<IConversation, IUnreadBulk>({
            query: ({ mailboxId, data }) => ({
                url: `${mailboxPath}/${mailboxId}/${conversationPath}/status/bulk`,
                method: 'POST',
                data
            }),
            invalidatesTags: ['Conversation']
        }),
        moveToSpam: build.mutation<IConversation, IConversation>({
            query: ({ mailboxId, id }) => ({
                url: `${mailboxPath}/${mailboxId}/${conversationPath}/${id}/status`,
                method: 'POST',
                data: {
                    status: statuses.spam.status
                }
            }),
            invalidatesTags: ['Conversation']
        }),
        makeConversationActive: build.mutation<IConversation, IConversation>({
            query: ({ mailboxId, id }) => ({
                url: `${mailboxPath}/${mailboxId}/${conversationPath}/${id}/status`,
                method: 'POST',
                data: {
                    status: statuses.active.status
                }
            }),
            invalidatesTags: ['Conversation']
        }),
        closeConversation: build.mutation<IConversation, IConversation>({
            query: ({ mailboxId, id }) => ({
                url: `${mailboxPath}/${mailboxId}/${conversationPath}/${id}/status`,
                method: 'POST',
                data: {
                    status: statuses.closed.status
                }
            }),
            invalidatesTags: ['Conversation']
        })
    })
});

export default conversationAPI;
