import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IWidgetDeposit } from '../../views/scheduling-widget/widget-wizard/types';

interface WidgetSliceProps {
    deposit: IWidgetDeposit;
    noShowDeposit: IWidgetDeposit;
}

const initialState: WidgetSliceProps = {
    deposit: {
        required: false,
        amount: 0
    },
    noShowDeposit: {
        required: false,
        amount: 0
    }
};

export const widgetSlice = createSlice({
    name: 'widgetSlice',
    initialState,
    reducers: {
        setDeposit: (state, action: PayloadAction<IWidgetDeposit>) => {
            state.deposit = action.payload;
        },
        setNoShowDeposit: (state, action: PayloadAction<IWidgetDeposit>) => {
            state.noShowDeposit = action.payload;
        }
    }
});

export const { setDeposit, setNoShowDeposit } = widgetSlice.actions;
