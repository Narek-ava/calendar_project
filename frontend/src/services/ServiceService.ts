import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { axiosBaseQuery } from '../utils/axios';
import { IService, ServiceOrderPayload } from '../models/IService';
import { IBaseParams, IPaginateResponse } from '../models/IPaginateResponse';

const serviceAPI = createApi({
    reducerPath: 'serviceAPI',
    tagTypes: ['Service'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        fetchAllServices: build.query<IPaginateResponse<IService[]>, IBaseParams>({
            query: ({ per_page = -1, page = 1, search = null, sort = null, order = null, trashed = null }) => ({
                url: `/services`,
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
            providesTags: (result) => ['Service']
        }),
        getService: build.query<IService, string>({
            query: (id) => ({ url: `/services/${id}`, method: 'GET' })
        }),
        getAccountServices: build.query<IService[], null>({
            query: () => ({ url: '/account/services/', method: 'GET' }),
            providesTags: (result) => ['Service']
        }),
        createService: build.mutation<IService, IService>({
            query: (service) => ({
                url: `/services`,
                method: 'POST',
                data: service
            }),
            invalidatesTags: ['Service']
        }),
        updateService: build.mutation<IService, IService>({
            query: (service) => ({
                url: `/services/${service.id}`,
                method: 'PUT',
                data: service
            }),
            invalidatesTags: ['Service']
        }),
        deleteService: build.mutation<IService, IService>({
            query: (service) => ({
                url: `/services/${service.id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Service']
        }),
        updateSortingOrders: build.mutation<IService[], ServiceOrderPayload>({
            query: (data) => ({
                url: '/services/updateSortingOrders',
                method: 'PUT',
                data
            }),
            invalidatesTags: ['Service']
        }),
        simpleCreateService: build.mutation<IService, string>({
            query: (name) => ({
                url: '/services/simplified-store',
                method: 'POST',
                data: { name }
            }),
            invalidatesTags: ['Service']
        })
    })
});

export default serviceAPI;
