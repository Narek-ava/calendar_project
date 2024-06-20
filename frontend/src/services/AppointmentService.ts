import { createApi } from '@reduxjs/toolkit/dist/query/react';
import {
    AppointmentStatusPayload,
    IAppointment,
    IAppointmentHistory,
    IAppointmentPayload,
    IAppointmentPaymentsPayload
} from '../models/IAppointment';
import { axiosBaseQuery } from '../utils/axios';
import { TimeSlot } from '../views/scheduling-widget/widget-wizard/types';
import { IService } from '../models/IService';
import { ILocation } from '../models/ILocation';
import { IEmployee } from '../models/IEmployee';
import { EmployeesByServiceLocationProps } from '../views/calendar/wizard/types';

export interface AppointmentsFetchProps {
    mode: string;
    date: string;
    employee?: string;
    location?: string;
    customer?: string;
    customerInfo?: string | null;
}

export interface TimeSlotsParams {
    date: string;
    service: IService['id'];
    location: ILocation['id'];
    employee?: IEmployee['id'];
}

const appointmentAPI = createApi({
    reducerPath: 'appointmentAPI',
    tagTypes: ['Appointment', 'EventEmployees'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        fetchAllAppointments: build.query<IAppointment[], AppointmentsFetchProps>({
            query: ({ mode, date, employee, location, customer, customerInfo }) => ({
                url: `/appointments`,
                method: 'GET',
                params: {
                    mode,
                    date,
                    'filters[employee]': employee,
                    'filters[location]': location,
                    'filters[customer]': customer,
                    'filters[customerInfo]': customerInfo
                }
            }),
            providesTags: (result) => ['Appointment'],
            keepUnusedDataFor: 30
        }),
        fetchGlobalAppointments: build.query<IAppointment[], AppointmentsFetchProps>({
            query: ({ mode, date, employee, location, customer, customerInfo }) => ({
                url: `/global-appointments`,
                method: 'GET',
                params: {
                    mode,
                    date,
                    'filters[employee]': employee,
                    'filters[location]': location,
                    'filters[customer]': customer,
                    'filters[customerInfo]': customerInfo
                }
            }),
            providesTags: (result) => ['Appointment'],
            keepUnusedDataFor: 30
        }),
        getAppointment: build.query<IAppointment, number>({
            query: (id) => ({
                url: `/appointments/${id}`,
                method: 'GET'
            }),
            providesTags: (result) => ['Appointment']
        }),
        createAppointment: build.mutation<IAppointment, IAppointmentPayload>({
            query: (data) => ({
                url: `/appointments/`,
                method: 'POST',
                data
            }),
            invalidatesTags: ['Appointment']
        }),
        updateAppointment: build.mutation<IAppointment, { appointmentId: string; data: IAppointmentPayload }>({
            query: ({ appointmentId, data }) => ({
                url: `/appointments/${appointmentId}`,
                method: 'PUT',
                data
            }),
            invalidatesTags: ['Appointment']
        }),
        updateAppointmentPayments: build.mutation<IAppointment, { appointmentId: string; data: IAppointmentPaymentsPayload }>({
            query: ({ appointmentId, data }) => ({
                url: `/appointments/${appointmentId}/payments`,
                method: 'PUT',
                data
            }),
            invalidatesTags: ['Appointment']
        }),
        deleteAppointment: build.mutation<IAppointment, string | number>({
            query: (appointmentId) => ({
                url: `/appointments/${appointmentId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Appointment']
        }),
        setAppointmentStatus: build.mutation<IAppointment, { appointmentId: IAppointment['id']; data: AppointmentStatusPayload }>({
            query: ({ appointmentId, data: { status, payment_method, price, cancel_reason } }) => ({
                url: `/appointments/${appointmentId}/status`,
                method: 'PUT',
                data: {
                    status,
                    cancel_reason,
                    payment_method,
                    price
                }
            }),
            invalidatesTags: ['Appointment']
        }),
        getTimeSlots: build.query<TimeSlot[], TimeSlotsParams>({
            query: ({ date, service, location, employee }) => ({
                url: `/appointments/slots/`,
                method: 'GET',
                params: {
                    date,
                    service,
                    location,
                    employee
                }
            }),
            providesTags: (result) => ['Appointment']
        }),
        getEmployeesByServiceLocation: build.query<IEmployee[], EmployeesByServiceLocationProps>({
            query: ({ service_id, location_id }) => ({
                url: `/services/${service_id}/locations/${location_id}/employees/`,
                method: 'GET'
            }),
            providesTags: (result) => ['EventEmployees']
        }),
        getAppointmentHistory: build.query<IAppointmentHistory[], number>({
            query: (id) => ({
                url: `/appointments/${id}/audits`,
                method: 'GET'
            }),
            providesTags: (result) => ['Appointment']
        })
    })
});

export default appointmentAPI;
