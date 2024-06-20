/**
 * axios setup to use mock service
 */

import axios, { AxiosRequestConfig } from 'axios';
import config from '../config';
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query/react';
import { AppStore } from '../store/store';
import { LOGOUT } from '../store/account/actions';

export const axiosServices = axios.create();

axiosServices.defaults.withCredentials = true;
axiosServices.defaults.baseURL = config.apiUrl;
axiosServices.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
axiosServices.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

// interceptor for http
const interceptors = {
    setupInterceptors: (store: AppStore) => {
        axiosServices.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response.status === 401) {
                    const state = store.getState();
                    store.dispatch({
                        type: LOGOUT,
                        payload: {
                            ...state,
                            isLoggedIn: false,
                            user: null
                        }
                    });
                }
                return Promise.reject((error.response && error.response.data) || 'Wrong Services');
            }
        );
    }
};

export const axiosBaseQuery = (): BaseQueryFn<
    {
        url: string;
        method: AxiosRequestConfig['method'];
        data?: AxiosRequestConfig['data'];
        params?: any;
    },
    unknown,
    unknown
> => async ({ url, method, data, params }) => {
    try {
        const result = await axiosServices({ url, method, data, params });
        return { data: result.data };
    } catch (axiosError) {
        return {
            error: {
                status: axiosError.response?.status,
                data: axiosError.response?.data || axiosError.message,
                errors: axiosError?.errors
            }
        };
    }
};

export default interceptors;
