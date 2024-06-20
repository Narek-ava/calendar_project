import { createSlice } from '@reduxjs/toolkit';

interface SubmittingSliceProps {
    isSubmitting: boolean;
}

const initialState: SubmittingSliceProps = {
    isSubmitting: false
};

export const submittingSlice = createSlice({
    name: 'submitting',
    initialState,
    reducers: {
        startSubmitting: (state) => {
            state.isSubmitting = true;
        },
        stopSubmitting: (state) => {
            state.isSubmitting = false;
        },
        clearSubmittingState: () => initialState
    }
});

export const { startSubmitting, stopSubmitting, clearSubmittingState } = submittingSlice.actions;
