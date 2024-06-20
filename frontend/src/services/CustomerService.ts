import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { axiosBaseQuery } from '../utils/axios';
import { ICustomer } from 'models/ICustomer';
import { IBaseParams, IPaginateResponse } from 'models/IPaginateResponse';

const customerAPI = createApi({
    reducerPath: 'customerAPI',
    tagTypes: ['Customer'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        fetchAllCustomers: build.query<IPaginateResponse<ICustomer[]>, IBaseParams>({
            query: ({ per_page = null, page = 1, search = null, sort = null, order = null, trashed = null }) => ({
                url: `/customers`,
                method: 'GET',
                params: {
                    per_page,
                    page,
                    search,
                    sort,
                    order,
                    trashed
                }
            }),
            providesTags: (result) => ['Customer']
        }),
        getCustomer: build.query<ICustomer, string>({
            query: (id) => ({ url: `/customers/${id}`, method: 'GET' })
        }),
        createCustomer: build.mutation<ICustomer, ICustomer>({
            query: (customer) => ({
                url: `/customers`,
                method: 'POST',
                data: customer
            }),
            invalidatesTags: ['Customer']
        }),
        updateCustomer: build.mutation<ICustomer, ICustomer>({
            query: (customer) => ({
                url: `/customers/${customer.id}`,
                method: 'PUT',
                data: customer
            }),
            invalidatesTags: ['Customer']
        }),
        deleteCustomer: build.mutation<ICustomer, ICustomer>({
            query: (customer) => ({
                url: `/customers/${customer.id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Customer']
        })
    })
});

export default customerAPI;
