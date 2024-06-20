export interface ProductsProps {
    label: string;
    subscription_type: string;
    features: string[];
    price: string;
    price_id: string;
    description?: string;
}

export interface SubscriptionLimit {
    company: {
        locations: number;
        employees: number;
        services: number;
    };
    company_owner: {
        companies: number;
    };
}

export interface InitData {
    stripe: {
        products: {
            default_price: {
                unit_amount: number;
                id: string;
            };
            metadata: {
                limitName: string;
            };
            name: string;
            description?: string;
        }[];
    };
    limits: {
        single_user: SubscriptionLimit;
        organization: SubscriptionLimit;
        small_business: SubscriptionLimit;
    };
}

export interface StripeTYPageResponse {
    message?: string;
    order_id?: string;
    order_subtotal?: number;
}
