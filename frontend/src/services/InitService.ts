import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { axiosBaseQuery } from '../utils/axios';
import { InitData, StripeTYPageResponse } from '../views/authentication/types';

const InitAPI = createApi({
    reducerPath: 'initAPI',
    tagTypes: ['Init'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        init: build.query<InitData, null>({
            query: () => ({
                url: `/public/app-init`,
                method: 'GET'
            })
        }),
        stripeTYPage: build.query<StripeTYPageResponse, string>({
            query: (sessionId) => ({
                url: `/stripe-typ?session_id=${sessionId}`,
                method: 'GET'
            })
        })
    })
});

export default InitAPI;
