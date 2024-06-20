import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { axiosBaseQuery } from '../utils/axios';
import { ILocation, ILocationPayload } from '../models/ILocation';
import { IBaseParams, IPaginateResponse } from '../models/IPaginateResponse';

const locationAPI = createApi({
    reducerPath: 'locationAPI',
    tagTypes: ['Location'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        fetchAllLocations: build.query<IPaginateResponse<ILocation[]>, IBaseParams>({
            query: ({ per_page = -1, page = 1, search = null, sort = null, order = null, trashed = null }) => ({
                url: `/locations`,
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
            providesTags: (result) => ['Location']
        }),
        getLocation: build.query<ILocation, string>({
            query: (id) => ({ url: `/locations/${id}`, method: 'GET' })
        }),
        getAccountLocations: build.query<ILocation[], null>({
            query: () => ({ url: '/account/locations/', method: 'GET' }),
            providesTags: (result) => ['Location']
        }),
        createLocation: build.mutation<ILocation, ILocationPayload>({
            query: (location) => ({
                url: `/locations`,
                method: 'POST',
                data: location
            }),
            invalidatesTags: ['Location']
        }),
        updateLocation: build.mutation<ILocation, ILocationPayload>({
            query: (location) => ({
                url: `/locations/${location.id}`,
                method: 'PUT',
                data: location
            }),
            invalidatesTags: ['Location']
        }),
        deleteLocation: build.mutation<ILocation, ILocation>({
            query: (location) => ({
                url: `/locations/${location.id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Location']
        })
    })
});

export default locationAPI;
