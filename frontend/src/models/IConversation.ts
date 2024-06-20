import { IMailbox } from './IMailbox';
import { IUser } from './IUser';

interface ICustomer {
    email: string;
}

interface IThreadAction {
    type: string;
    text: string;
    associatedEntities: string[];
}

export interface ICreateThreadData {
    type: IThreadAction['type'];
    text: IThreadAction['text'];
    customer: ICustomer;
}

export interface ICreateThread {
    conversation: IConversation;
    data: ICreateThreadData;
}

interface IThreadSource {
    type: IThreadAction['type'];
    via: string;
}

interface IThreadCustomer {
    id: number;
    type: IThreadAction['type'];
    firstName: string;
    lastName: string;
    photoUrl: string;
    email: ICustomer['email'];
}
interface IThreadAttachment {
    attachments: string[]; // ?
}

export interface IThread {
    id: number;
    type: string;
    status: string;
    state: string;
    action: IThreadAction;
    body: string;
    source: IThreadSource;
    customer: IThreadCustomer;
    createdBy: IThreadCustomer;
    assignedTo: string | null;
    to: string[];
    cc: string[];
    bcc: string[];
    createdAt: string;
    openedAt: string;
    _embedded: IThreadAttachment;
}

interface IFolder {
    id: number;
    type: number;
    name: string;
    total_count: number;
    active_count: number;
}

interface CustomerWaitingSince {
    time: string;
    friendly: string;
    latestReplyFrom: string;
}

export interface IConversation {
    id: number;
    number: number;
    mailboxId?: number;
    folderId?: number;
    assignee: IUser | IAssignUser;
    type: number;
    subject: string;
    customer: ICustomer;
    status: string;
    snoozedAt: string;
    preview: string;
    updatedAt: string;
    readByUser: boolean;
    customerWaitingSince: CustomerWaitingSince;
    folders: IFolder[];
    _embedded: {
        threads: IThread[];
    };
}

export interface IUrlIds {
    mailboxId: IMailbox['id'];
    conversationId: IConversation['id'];
}

export interface ICreateConversationThread {
    text: IThreadAction['text'];
    type: IThreadAction['type'];
    user: IThreadCustomer['id'];
}

export interface ICreateConversationFormData {
    type: IConversation['type'];
    subject: IConversation['subject'];
    customer: IConversation['customer'];
    threads: ICreateConversationThread[];
}

export interface ICreateConversation {
    mailboxId: IMailbox['id'];
    formData: ICreateConversationFormData;
}

export interface IAssignUser {
    id: IUser['id'];
    firstName: IUser['firstname'];
    lastName: IUser['lastname'];
    email: IUser['email'];
}

export interface IAssign {
    conversation: IConversation;
    user_id: IUser['id'];
}

export interface IAssignBulk {
    mailboxId: IMailbox['id'];
    data: { [key: number]: { user_id: number } };
}

export interface ISnoozePayload {
    status: number;
    snoozed_at: string | null;
}

export interface ISnoozeConversation {
    conversation: IConversation;
    data: ISnoozePayload;
}

export interface IUnreadBulk {
    mailboxId: number;
    data: IConversation['id'][];
}
