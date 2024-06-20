import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DeactivationToggleProps {
    deactivated: boolean;
}

const initialState: DeactivationToggleProps = {
    deactivated: false
};

export const deactivationToggleSlice = createSlice({
    name: 'deactivationToggle',
    initialState,
    reducers: {
        setDeactivationToggle: (state, action: PayloadAction<boolean>) => {
            state.deactivated = action.payload;
        },
        clearDeactivationToggle: () => initialState
    }
});

export const { setDeactivationToggle, clearDeactivationToggle } = deactivationToggleSlice.actions;
