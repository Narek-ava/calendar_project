import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { axiosBaseQuery } from '../utils/axios';
import { IEmployee } from '../models/IEmployee';
import { AppointmentStatuses, IAppointment, WidgetAppointmentPayload } from '../models/IAppointment';
import { CreateBookingParams, GetEmployeeParams, GetTimeSlotsParams, TimeSlot } from '../views/scheduling-widget/widget-wizard/types';
import { IStripePaymentIntent, IWidgetCompany } from '../models/ICompany';

const appointmentWidgetAPI = createApi({
    reducerPath: 'appointmentWidgetAPI',
    tagTypes: ['AppointmentWidget', 'Widget Slots'],
    baseQuery: axiosBaseQuery(),
    endpoints: (build) => ({
        getWidgetCompany: build.query<IWidgetCompany, string>({
            query: (slug) => ({
                url: `/public/company/${slug}`,
                method: 'GET'
            }),
            providesTags: (result) => ['AppointmentWidget']
        }),
        getWidgetCompanyWithQueryString: build.query<IWidgetCompany, { slug: string; query: string }>({
            query: ({ slug, query }) => ({
                url: `/public/company/${slug}/?query=${query}`,
                method: 'GET'
            }),
            providesTags: (result) => ['AppointmentWidget']
        }),
        getCustomerAppointment: build.query<IAppointment, { company_slug: string; appointment_uuid: string }>({
            query: ({ company_slug, appointment_uuid }) => ({
                url: `/public/company/${company_slug}/appointment/${appointment_uuid}`,
                method: 'GET'
            }),
            providesTags: (result) => ['AppointmentWidget']
        }),
        setCustomersAppointmentStatus: build.mutation<
            IAppointment,
            { company_slug: string; appointment_uuid: string; status: AppointmentStatuses }
        >({
            query: ({ company_slug, appointment_uuid, status }) => ({
                url: `/public/company/${company_slug}/appointment/${appointment_uuid}/status`,
                method: 'PUT',
                data: {
                    status
                }
            }),
            invalidatesTags: ['AppointmentWidget']
        }),
        updateWidgetAppointment: build.mutation<
            IAppointment,
            { company_slug: string; appointment_uuid: string; data: WidgetAppointmentPayload }
        >({
            query: ({ company_slug, appointment_uuid, data }) => ({
                url: `/public/company/${company_slug}/appointment/${appointment_uuid}`,
                method: 'PUT',
                data
            }),
            invalidatesTags: ['AppointmentWidget']
        }),
        getEmployees: build.query<IEmployee[], GetEmployeeParams>({
            query: ({ slug, service, location }) => ({
                url: `/public/company/${slug}/service/${service}/location/${location}/employees`,
                method: 'GET'
            }),
            providesTags: (result) => ['AppointmentWidget']
        }),
        getTimeSlots: build.query<TimeSlot[], GetTimeSlotsParams>({
            query: ({ slug, date, service, location, employee }) => ({
                url: `/public/company/${slug}/appointment/slots`,
                method: 'GET',
                params: {
                    date,
                    service,
                    location,
                    employee
                }
            }),
            providesTags: (result) => ['Widget Slots']
        }),
        createWidgetAppointment: build.mutation<IAppointment, CreateBookingParams>({
            query: ({ slug, data }) => ({
                url: `/public/company/${slug}/appointment`,
                method: 'POST',
                data
            }),
            invalidatesTags: ['AppointmentWidget']
        }),
        getStripePaymentIntent: build.query<IStripePaymentIntent, { slug: string; service_id: number }>({
            query: ({ slug, service_id }) => ({
                url: `/public/company/${slug}/appointment/stripe-payment-intent`,
                method: 'POST',
                data: { service_id }
            })
        }),
        getCsrfCookies: build.query({
            query: () => ({ url: `/csrf-cookie`, method: 'GET' })
        })
    })
});

export default appointmentWidgetAPI;
