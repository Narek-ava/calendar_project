import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICustomer } from '../../models/ICustomer';
import { ILocation } from '../../models/ILocation';
import { IEmployee } from '../../models/IEmployee';
import { IService } from '../../models/IService';
import { Moment } from 'moment-timezone';

interface WizardData {
    serviceData: IService | null;
    locationData: ILocation | null;
    providerData: IEmployee | null;
    dateData: Moment;
}

interface NewCustomerProps {
    customer: ICustomer | null;
    wizardData: WizardData | null;
}

const initialState: NewCustomerProps = {
    customer: null,
    wizardData: null
};

export const newCustomerSlice = createSlice({
    name: 'newCustomer',
    initialState,
    reducers: {
        setNewCustomer: (state, action: PayloadAction<ICustomer | null>) => {
            state.customer = action.payload;
        },
        setWizardData: (state, action: PayloadAction<WizardData | null>) => {
            state.wizardData = action.payload;
        },
        clearNewCustomerState: () => initialState
    }
});

export const { setNewCustomer, setWizardData, clearNewCustomerState } = newCustomerSlice.actions;
