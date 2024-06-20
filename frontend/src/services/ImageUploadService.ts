import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { axiosBaseQuery } from '../utils/axios';
import { ImageResponse } from '../models/IImage';

const imageUploadAPI = createApi({
    reducerPath: 'imageUploadAPI',
    tagTypes: ['Upload'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        uploadImage: build.mutation<ImageResponse, FormData>({
            query: (data) => ({
                url: '/uploader/image',
                method: 'POST',
                data
            }),
            invalidatesTags: ['Upload']
        }),
        deleteImageByLink: build.mutation<boolean, string>({
            query: (link) => ({
                url: '/uploader/image-by-link',
                method: 'DELETE',
                data: link
            }),
            invalidatesTags: ['Upload']
        })
    })
});

export default imageUploadAPI;
