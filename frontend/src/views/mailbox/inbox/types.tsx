import React from 'react';
import { IConversation, IUrlIds } from '../../../models/IConversation';
import { IMailbox } from '../../../models/IMailbox';

export interface MailProps {
    id: string;
    subject: string;
    isRead: boolean;
    important: boolean;
    starred: boolean;
    time: Date;
    promotions: boolean;
    forums: boolean;
    attach: boolean;
    sent: boolean;
    draft: boolean;
    spam: boolean;
    trash: boolean;
    profile: {
        avatar: string;
        name: string;
        email: string;
        to: string;
    };
    sender: {
        avatar: string;
        name: string;
        email: string;
        to: string;
        about: string;
    };
    message: string;
    attachments: {
        id: string;
        image: string;
        title: string;
    }[];
}

export type MailBoxCount = {
    all: number;
    inbox: number;
    sent: number;
    trash: number;
    starred: number;
    draft: number;
    important: number;
    promotions: number;
    spam: number;
    forums: number;
};

export interface IInboxFolder {
    id: number;
    name: string;
    type: number;
    total_count: number;
    active_count: number;
}

export interface InboxDrawerProps {
    folder: IInboxFolder | undefined;
    handleFilter: (arg: IInboxFolder) => void;
    mailbox: IMailbox;
    switchMailbox: (id: number) => void;
    handleDrawerOpen: InboxHeaderProps['handleDrawerOpen'];
    openMailSidebar: boolean | undefined;
}

export interface ConversationDetailsProps {
    handleDrawerOpen: InboxHeaderProps['handleDrawerOpen'];
    setIsConversationOpened: (value: boolean) => void;
    idsToFetch: IUrlIds;
}

export interface ConversationsListProps {
    openConversationFromSearch: (option: IConversation) => void;
    activeConversationIds: IUrlIds;
    isConversationOpened: boolean;
    folder: InboxDrawerProps['folder'];
    mailbox: IMailbox;
    setIsConversationOpened: (arg: boolean) => void;
    setActiveConversationIds: (arg: IUrlIds) => void;
    handleDrawerOpen: InboxHeaderProps['handleDrawerOpen'];
}

export interface InboxHeaderProps {
    openConversationFromSearch: ConversationsListProps['openConversationFromSearch'];
    mailbox: ConversationsListProps['mailbox'];
    length: number;
    rowsPerPage: number;
    page: number;
    handleChangePage: (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => void;
    handleDrawerOpen: () => void;
}

export interface ConversationHeaderProps {
    conversation: IConversation;
    handleDrawerOpen: () => void;
    subject: string;
    handleBackToList: () => void;
}

export interface SearchConversationProps {
    openConversationFromSearch: ConversationsListProps['openConversationFromSearch'];
    mailbox: ConversationsListProps['mailbox'];
}

export interface IConversationAssigner {
    conversation: IConversation;
    handleBackToList: ConversationHeaderProps['handleBackToList'];
}

export interface ISnoozeConversationProps {
    conversation: IConversation;
    handleBackToList: ConversationHeaderProps['handleBackToList'];
}

export interface IConversationsControlsProps {
    target: IConversation | IConversation[];
    handleBackToList?: ConversationHeaderProps['handleBackToList'];
    folder?: IInboxFolder;
}
