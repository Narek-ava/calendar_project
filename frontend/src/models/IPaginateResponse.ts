export interface IPaginateResponse<T> {
    data: T;
    meta: IMeta;
}

export interface IMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

export interface IEmbedded<T> {
    conversations: T;
}

export interface IPaginateConversations<T> {
    _embedded: IEmbedded<T>;
    page: IConversationMeta;
}

export interface IConversationMeta {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
}

export interface IBaseParams {
    per_page?: number;
    page?: number;
    search?: string | null;
    sort?: string | null;
    order?: string | null | undefined;
    trashed?: string | null;
}
