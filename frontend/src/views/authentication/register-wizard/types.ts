export interface IPersonalInfo {
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface ICompanyInfo {
    companyName: string;
    address: {
        address: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
        l1?: string;
        l2?: string;
    };
}
