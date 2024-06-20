export interface ICompanyOwner {
    subscription_type: string | null;
    limits: {
        counts: {
            companies: number;
        };
        max: {
            companies: number | null;
        } | null;
    };
}
