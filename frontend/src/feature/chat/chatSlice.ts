/* eslint no-param-reassign: 0 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Chat {
	from: string;
	message: string;
}

interface ChatState {
	chat: Chat[];
}

const initialState: ChatState = {
	chat: [],
};

export const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		addMessage: (state, action: PayloadAction<Chat>) => {
			const newChat = [...state.chat, action.payload];
			state.chat = newChat;
		},
		clearChat: (state) => {
			state.chat = initialState.chat;
		},
	},
});

export const { clearChat, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
