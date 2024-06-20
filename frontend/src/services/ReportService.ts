import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { axiosBaseQuery } from '../utils/axios';
import { ReportPayload } from '../views/reports/Reports';

const reportAPI = createApi({
    reducerPath: 'reportAPI',
    tagTypes: ['Report'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        getReport: build.query<string, ReportPayload>({
            query: ({ company_id, date_from, date_to, locations }) => ({
                url: `/companies/${company_id}/reports`,
                method: 'GET',
                params: {
                    'filters[date_from]': date_from,
                    'filters[date_to]': date_to,
                    'filters[locations]': locations
                }
            }),
            providesTags: (result) => ['Report'],
            keepUnusedDataFor: 30
        })
    })
});

export default reportAPI;
