import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { axiosBaseQuery } from '../utils/axios';
import { IServiceCategory } from '../models/IServiceCategory';

const serviceCategoryAPI = createApi({
    reducerPath: 'serviceCategoryAPI',
    tagTypes: ['ServiceCategory'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        fetchAllServiceCategories: build.query<IServiceCategory[], null>({
            query: () => ({
                url: `/service-categories`,
                method: 'GET'
            }),
            providesTags: (result) => ['ServiceCategory']
        }),
        getServiceCategory: build.query<IServiceCategory, string>({
            query: (id) => ({ url: `/service-categories/${id}`, method: 'GET' })
        }),
        createServiceCategory: build.mutation<IServiceCategory, IServiceCategory>({
            query: (category) => ({
                url: `/service-categories`,
                method: 'POST',
                data: category
            }),
            invalidatesTags: ['ServiceCategory']
        }),
        updateServiceCategory: build.mutation<IServiceCategory, IServiceCategory>({
            query: (category) => ({
                url: `/service-categories/${category.id}`,
                method: 'PUT',
                data: category
            }),
            invalidatesTags: ['ServiceCategory']
        }),
        deleteServiceCategory: build.mutation<IServiceCategory, IServiceCategory>({
            query: (category) => ({
                url: `/service-categories/${category.id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['ServiceCategory']
        })
    })
});

export default serviceCategoryAPI;
