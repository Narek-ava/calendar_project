import { AnyAction, combineReducers } from 'redux';
import snackbarReducer from './snackbarReducer';
import { configureStore } from '@reduxjs/toolkit';
import companyAPI from '../services/CompanyService';
import locationAPI from '../services/LocationService';
import customizationReducer from './customizationReducer';
import serviceCategoryAPI from '../services/ServiceCategoryService';
import serviceAPI from '../services/ServiceService';
import accountReducer from './account/accountReducer';
import { LOGOUT } from './account/actions';
import employeeAPI from 'services/EmployeeService';
import customerAPI from 'services/CustomerService';
import mailboxAPI from '../services/MailboxService';
import conversationAPI from '../services/ConversationService';
import { confirmPopupSlice } from './confirmPopupSlice';
import { selectConversationsSlice } from './slices/selectConversationsSlice';
import appointmentAPI from '../services/AppointmentService';
import appointmentWidgetAPI from '../services/WidgetService';
import { calendarFilterSlice } from './slices/calendarFilterSlice';
import { calendarSlice } from './slices/calendarSlice';
import notificationAPI from '../services/NotificationService';
import { userInviteSlice } from './slices/userInviteSlice';
import { newCustomerSlice } from './slices/newCustomerSlice';
import { outerAppointmentSlice } from './slices/outerAppointmentSlice';
import { deactivationToggleSlice } from './slices/deactivationToggleSlice';
import userAPI from '../services/AccountService';
import { submittingSlice } from './slices/SubmittingSlice';
import reportAPI from '../services/ReportService';
import initAPI from '../services/InitService';
import { widgetSlice } from './slices/widgetSlice';
import { mobileCreateButtonSlice } from './slices/mobileCreateButtonSlice';
import { layoutSlice } from './slices/layoutSlice';
import waiverAPI from 'services/WaiverService';

export const appReducer = combineReducers({
    customization: customizationReducer,
    snackbar: snackbarReducer,
    account: accountReducer,
    confirmPopup: confirmPopupSlice.reducer,
    selectConversation: selectConversationsSlice.reducer,
    [companyAPI.reducerPath]: companyAPI.reducer,
    [locationAPI.reducerPath]: locationAPI.reducer,
    [serviceCategoryAPI.reducerPath]: serviceCategoryAPI.reducer,
    [serviceAPI.reducerPath]: serviceAPI.reducer,
    [employeeAPI.reducerPath]: employeeAPI.reducer,
    [customerAPI.reducerPath]: customerAPI.reducer,
    [waiverAPI.reducerPath]: waiverAPI.reducer,
    [mailboxAPI.reducerPath]: mailboxAPI.reducer,
    [conversationAPI.reducerPath]: conversationAPI.reducer,
    [appointmentAPI.reducerPath]: appointmentAPI.reducer,
    [appointmentWidgetAPI.reducerPath]: appointmentWidgetAPI.reducer,
    [notificationAPI.reducerPath]: notificationAPI.reducer,
    [userAPI.reducerPath]: userAPI.reducer,
    calendarFilter: calendarFilterSlice.reducer,
    calendar: calendarSlice.reducer,
    mobileCreateButton: mobileCreateButtonSlice.reducer,
    userInvitation: userInviteSlice.reducer,
    addNewCustomer: newCustomerSlice.reducer,
    outerAppointment: outerAppointmentSlice.reducer,
    deactivationToggle: deactivationToggleSlice.reducer,
    submitting: submittingSlice.reducer,
    widget: widgetSlice.reducer,
    [reportAPI.reducerPath]: reportAPI.reducer,
    [initAPI.reducerPath]: initAPI.reducer,
    layout: layoutSlice.reducer
});

export const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: AnyAction) => {
    if (action.type === LOGOUT) {
        // Keep account state to prevent app freeze
        return appReducer(
            {
                ...state,
                // @ts-ignore
                snackbar: undefined,
                // @ts-ignore
                confirmPopup: undefined,
                // @ts-ignore
                selectConversation: undefined,
                // @ts-ignore
                [companyAPI.reducerPath]: undefined,
                // @ts-ignore
                [locationAPI.reducerPath]: undefined,
                // @ts-ignore
                [serviceCategoryAPI.reducerPath]: undefined,
                // @ts-ignore
                [serviceAPI.reducerPath]: undefined,
                // @ts-ignore
                [employeeAPI.reducerPath]: undefined,
                // @ts-ignore
                [customerAPI.reducerPath]: undefined,
                // @ts-ignore
                [waiverAPI.reducerPath]: undefined,
                // @ts-ignore
                [mailboxAPI.reducerPath]: undefined,
                // @ts-ignore
                [conversationAPI.reducerPath]: undefined,
                // @ts-ignore
                [appointmentAPI.reducerPath]: undefined,
                // @ts-ignore
                [appointmentWidgetAPI.reducerPath]: undefined,
                // @ts-ignore
                [notificationAPI.reducerPath]: undefined,
                // @ts-ignore
                [userAPI.reducerPath]: undefined,
                // @ts-ignore
                calendarFilter: undefined,
                // @ts-ignore
                calendar: undefined,
                // @ts-ignore
                mobileCreateButton: undefined,
                // @ts-ignore
                userInvitation: undefined,
                // @ts-ignore
                addNewCustomer: undefined,
                // @ts-ignore
                outerAppointment: undefined,
                // @ts-ignore
                deactivationToggle: undefined,
                // @ts-ignore
                submitting: undefined,
                // @ts-ignore
                [reportAPI.reducerPath]: undefined,
                // @ts-ignore
                [initAPI.reducerPath]: undefined,
                // @ts-ignore
                layout: undefined
            },
            action
        );
    }

    return appReducer(state, action);
};

export const setupStore = () =>
    configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false
            }).concat(
                companyAPI.middleware,
                locationAPI.middleware,
                serviceCategoryAPI.middleware,
                serviceAPI.middleware,
                employeeAPI.middleware,
                customerAPI.middleware,
                waiverAPI.middleware,
                mailboxAPI.middleware,
                conversationAPI.middleware,
                appointmentAPI.middleware,
                appointmentWidgetAPI.middleware,
                notificationAPI.middleware,
                userAPI.middleware,
                reportAPI.middleware
            )
    });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
