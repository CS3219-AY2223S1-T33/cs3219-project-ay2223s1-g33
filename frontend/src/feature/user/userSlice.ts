/* eslint no-param-reassign: 0 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// eslint-disable-next-line
import { RootState } from "../../app/store";
import { User } from "../../proto/types";

interface UserState {
	user?: User;
}

const initialState: UserState = {
	user: undefined,
};

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<Required<UserState>>) => {
			const { user } = action.payload;
			state.user = user;
		},
		logout: (state) => {
			state.user = initialState.user;
		},
	},
});

export const selectUser = (state: RootState) => state.user.user;

export const { setUser, logout } = userSlice.actions;

export default userSlice.reducer;
