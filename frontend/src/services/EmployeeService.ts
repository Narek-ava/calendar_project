import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { axiosBaseQuery } from '../utils/axios';
import { IEmployee, IEmployeePayload, IEmployeeResendInvitationPayload } from 'models/IEmployee';
import { IBaseParams, IPaginateResponse } from '../models/IPaginateResponse';

interface IEmployeeQueryArg {
    search?: string | null;
}

const employeeAPI = createApi({
    reducerPath: 'employeeAPI',
    tagTypes: ['Employee'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        fetchAllEmployees: build.query<IPaginateResponse<IEmployee[]>, IBaseParams>({
            query: ({ per_page = -1, page = 1, search = null, sort = null, order = null, trashed = null }) => ({
                url: `/employees`,
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
            providesTags: (result) => ['Employee']
        }),
        fetchAllEmployeesWithSearch: build.query<IPaginateResponse<IEmployee[]>, IEmployeeQueryArg>({
            query: ({ search = null }) => ({
                url: `/employees`,
                method: 'GET',
                params: {
                    search
                }
            }),
            providesTags: (result) => ['Employee']
        }),
        getEmployee: build.query<IEmployee, string>({
            query: (id) => ({ url: `/employees/${id}`, method: 'GET' })
        }),
        createEmployee: build.mutation<IEmployee, IEmployeePayload>({
            query: (employee) => ({
                url: `/employees`,
                method: 'POST',
                data: employee
            }),
            invalidatesTags: ['Employee']
        }),
        updateEmployee: build.mutation<IEmployee, IEmployeePayload>({
            query: (employee) => ({
                url: `/employees/${employee.id}`,
                method: 'PUT',
                data: employee
            }),
            invalidatesTags: ['Employee']
        }),
        deleteEmployee: build.mutation<IEmployee, IEmployee>({
            query: (employee) => ({
                url: `/employees/${employee.id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Employee']
        }),
        resendInviteToEmployee: build.mutation<IEmployee, IEmployeeResendInvitationPayload>({
            query: (payload) => ({
                url: `/employees/${payload.id}/invite/resend`,
                method: 'POST',
                data: {
                    email: payload.email
                }
            }),
            invalidatesTags: ['Employee']
        }),
        simpleCreateEmployee: build.mutation<IEmployee, string>({
            query: (email) => ({
                url: '/employees/simplified-invite',
                method: 'POST',
                data: { email }
            }),
            invalidatesTags: ['Employee']
        })
    })
});

export default employeeAPI;
