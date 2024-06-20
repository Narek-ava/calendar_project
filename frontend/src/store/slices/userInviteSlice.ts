import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserAuthProps {
    email: string | undefined;
}

const initialState: UserAuthProps = {
    email: undefined
};

export const userInviteSlice = createSlice({
    name: 'userInvite',
    initialState,
    reducers: {
        setUserInvitationData: (state, action: PayloadAction<UserAuthProps>) => {
            state.email = action.payload.email;
        },
        clearUserInvitationData: () => initialState
    }
});

export const { setUserInvitationData, clearUserInvitationData } = userInviteSlice.actions;
