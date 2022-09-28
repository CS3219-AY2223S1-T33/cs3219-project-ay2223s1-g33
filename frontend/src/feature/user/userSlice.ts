/* eslint no-param-reassign: 0 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// eslint-disable-next-line
import { RootState } from "../../app/store";
import { User } from "../../proto/types";

interface UserState {
	// sessionToken: string;
	user?: User;
}

const initialState: UserState = {
	// sessionToken: "",
	user: undefined,
};

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		login: (state, action: PayloadAction<Required<UserState>>) => {
			const { user } = action.payload;
			// state.sessionToken = sessionToken;
			state.user = user;
		},
		logout: (state) => {
			// state.sessionToken = initialState.sessionToken;
			state.user = initialState.user;
		},
	},
});

export const selectUser = (state: RootState) => state.user.user;

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
