import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { axiosBaseQuery } from '../utils/axios';
import { IWaiver } from 'models/ICompany';

const waiverAPI = createApi({
    reducerPath: 'waiverAPI',
    tagTypes: ['Waiver'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        updateWaiver: build.mutation<IWaiver, IWaiver>({
            query: (waiver) => ({
                url: `/companies/${waiver.companyId}/waiver/update`,
                method: 'PATCH',
                data: {
                    waiver_data: waiver.waiver_data
                }
            }),
            invalidatesTags: ['Waiver']
        })
    })
});

export default waiverAPI;
