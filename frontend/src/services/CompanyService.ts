import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { ICompany, ICompanySettings, ICompanySettingsPayload, ITwilioNumber } from '../models/ICompany';
import { IBaseParams, IPaginateResponse } from '../models/IPaginateResponse';
import { axiosBaseQuery } from '../utils/axios';

const companyAPI = createApi({
    reducerPath: 'companyAPI',
    tagTypes: ['Company'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        fetchAllCompanies: build.query<IPaginateResponse<ICompany[]>, IBaseParams>({
            query: ({ per_page = null, page = 1, search = null, sort = null, order = null, trashed = null }) => ({
                url: `/companies`,
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
            providesTags: (result) => ['Company']
        }),
        getCompany: build.query<ICompany, string>({
            query: (id) => ({ url: `companies/${id}`, method: 'GET' })
        }),
        createCompany: build.mutation<ICompany, ICompany>({
            query: (company) => ({
                url: `/companies`,
                method: 'POST',
                data: company
            }),
            invalidatesTags: ['Company']
        }),
        updateCompany: build.mutation<ICompany, ICompany>({
            query: (company) => ({
                url: `/companies/${company.id}`,
                method: 'PUT',
                data: company
            }),
            invalidatesTags: ['Company']
        }),
        updateCompanySettings: build.mutation<ICompanySettings, ICompanySettingsPayload>({
            query: (companySettings) => ({
                url: `/companies/${companySettings.companyId}/update-settings`,
                method: 'POST',
                data: companySettings
            }),
            invalidatesTags: ['Company']
        }),
        deleteCompany: build.mutation<ICompany, ICompany>({
            query: (company) => ({
                url: `/companies/${company.id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Company']
        }),
        getTwilioPhones: build.query<ITwilioNumber[], string>({
            query: (id) => ({ url: `companies/${id}/twilio-phones`, method: 'GET' })
        })
    })
});

export default companyAPI;
