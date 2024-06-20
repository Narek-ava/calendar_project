import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IConversation } from '../../models/IConversation';

interface SelectedConversationsProps {
    selected: IConversation[];
}

const initialState: SelectedConversationsProps = {
    selected: []
};

export const selectConversationsSlice = createSlice({
    name: 'selectConversations',
    initialState,
    reducers: {
        setSelectedConversations: (state, action: PayloadAction<IConversation[]>) => {
            state.selected = action.payload;
        },
        clearSelectedConversations: () => initialState
    }
});

export const { setSelectedConversations, clearSelectedConversations } = selectConversationsSlice.actions;
