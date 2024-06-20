import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LayoutSliceProps {
    showSupportWidget: boolean;
}

const initialState: LayoutSliceProps = {
    showSupportWidget: false
};

export const layoutSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        setShowSupportWidget: (state, action: PayloadAction<boolean>) => {
            state.showSupportWidget = action.payload;
        }
    }
});

export const { setShowSupportWidget } = layoutSlice.actions;
