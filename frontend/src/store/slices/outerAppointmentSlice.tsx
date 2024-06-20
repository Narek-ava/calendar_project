import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAppointment } from '../../models/IAppointment';

interface outerAppointmentProps {
    outerAppointment: IAppointment | undefined;
}

const initialState: outerAppointmentProps = {
    outerAppointment: undefined
};

export const outerAppointmentSlice = createSlice({
    name: 'outerAppointment',
    initialState,
    reducers: {
        setOuterAppointment: (state, action: PayloadAction<IAppointment | undefined>) => {
            state.outerAppointment = action.payload;
        },
        clearOuterAppointment: () => initialState
    }
});

export const { setOuterAppointment, clearOuterAppointment } = outerAppointmentSlice.actions;
