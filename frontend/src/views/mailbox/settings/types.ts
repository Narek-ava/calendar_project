import { IMailbox } from '../../../models/IMailbox';
import { IEmployee } from '../../../models/IEmployee';

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

export interface MailboxSettingsProps {
    mailbox: IMailbox;
    onChange: (id: number) => void;
    handleDrawerOpen: DrawerControlProps['handleDrawerOpen'];
    openMailSidebar: boolean | undefined;
}

export interface DrawerControlProps {
    handleDrawerOpen: () => void;
}

export interface SettingsSelectorProps {
    data: IMailbox;
    employees: SettingsPageProps['employees'];
    isLoading: boolean;
}

export interface SettingsPageProps extends SettingsSelectorProps {
    handleDrawerOpen: DrawerControlProps['handleDrawerOpen'];
    employees: IEmployee[];
}
