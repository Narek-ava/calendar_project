import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CreateButtonProps {
    buttonAction: (() => void) | null;
}

const initialState: CreateButtonProps = {
    buttonAction: null
};

export const mobileCreateButtonSlice = createSlice({
    name: 'mobileCreateButton',
    initialState,
    reducers: {
        setButtonAction: (state, action: PayloadAction<(() => void) | null>) => {
            state.buttonAction = action.payload;
        }
    }
});

export const { setButtonAction } = mobileCreateButtonSlice.actions;
