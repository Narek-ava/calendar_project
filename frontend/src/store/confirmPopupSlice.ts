import React from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IConfirmData {
    onConfirm?: () => void;
    onClose?: () => void;
    text: React.ReactNode;
    isConfirmDisabled?: boolean;
    confirmText?: string;
    cancelText?: string;
    id?: string;
}

interface IConfirmPopup {
    isOpened: boolean;
    confirmData: IConfirmData;
}

const initialState: IConfirmPopup = {
    isOpened: false,
    confirmData: {} as IConfirmData
};

export const confirmPopupSlice = createSlice({
    name: 'confirmPopup',
    initialState,
    reducers: {
        openConfirmPopup: (state, action: PayloadAction<IConfirmData>) => {
            state.isOpened = true;
            state.confirmData = action.payload;
        },
        closeConfirmPopup: () => initialState
    }
});

export const { openConfirmPopup, closeConfirmPopup } = confirmPopupSlice.actions;
