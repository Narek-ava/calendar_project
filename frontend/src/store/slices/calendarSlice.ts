import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CalendarProps {
    isForeignAppointment: boolean;
}

const initialState: CalendarProps = {
    isForeignAppointment: false
};

export const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        setIsForeignAppointment: (state, action: PayloadAction<boolean>) => {
            state.isForeignAppointment = action.payload;
        }
    }
});

export const { setIsForeignAppointment } = calendarSlice.actions;
