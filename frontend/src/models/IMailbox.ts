export interface IMailboxBase {
    id: number;
    email: string;
    name: string;
}

export interface IMailboxEdit extends IMailboxBase {
    aliases: string;
    auto_bcc: string;
    ticket_status: number;
    ticket_assignee: number;
    before_reply?: string;
    signature?: string;
}

export interface IMailboxFolder {
    id: number;
    type: number;
    name: string;
    total_count: number;
    active_count: number;
}

export interface IMailbox extends IMailboxEdit {
    in_protocol?: number;
    in_server: string;
    in_port?: number;
    in_username: string;
    in_password?: string;
    out_encryption: number;
    out_username: string;
    out_password?: string;
    out_port?: string;
    out_server: string;
    folders: IMailboxFolder[];
}
