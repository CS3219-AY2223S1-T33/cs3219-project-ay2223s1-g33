/* eslint no-param-reassign: 0 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// eslint-disable-next-line
import { RootState } from "../../app/store";
import { Question } from "../../proto/types";
import { Chat, Language } from "../../types/types";

interface SessionSlice {
	wsStatus: string;
	selectedLang: Language;
	question: Question | undefined;
	isEditorLocked: boolean;
	isCompleted: boolean | undefined;
	chat: Chat[];
	fontSize: number;
	isExecuting: boolean;
	executionOutput: string;
}

const initialState: SessionSlice = {
	wsStatus: "Not Connected",
	selectedLang: "javascript",
	question: undefined,
	isEditorLocked: false,
	isCompleted: undefined,
	chat: [],
	fontSize: 14,
	isExecuting: false,
	executionOutput: "",
};

export const sessionSlice = createSlice({
	name: "session",
	initialState,
	reducers: {
		setQuestion: (state, action: PayloadAction<{ question: Question }>) => {
			const { question } = action.payload;
			state.question = question;
		},
		changeLanguage: (state, action: PayloadAction<{ lang: Language }>) => {
			const { lang } = action.payload;
			state.selectedLang = lang;
		},
		changeWSStatus: (state, action: PayloadAction<{ status: string }>) => {
			const { status } = action.payload;
			state.wsStatus = status;
		},
		changeEditorLocked: (state, action: PayloadAction<{ editorLocked: boolean }>) => {
			const { editorLocked } = action.payload;
			state.isEditorLocked = editorLocked;
		},
		changeIsCompleted: (state, action: PayloadAction<{ isComplete: boolean }>) => {
			const { isComplete } = action.payload;
			state.isCompleted = isComplete;
		},
		addMessage: (state, action: PayloadAction<Chat>) => {
			const newChat = action.payload;
			state.chat.unshift(newChat);
		},
		changeFontSize: (state, action: PayloadAction<{ fs: number }>) => {
			const { fs } = action.payload;
			state.fontSize = fs;
		},
		setExecution: (state, action: PayloadAction<{ executing: boolean; output?: string }>) => {
			const { executing, output } = action.payload;
			state.isExecuting = executing;
			state.executionOutput = output ?? state.executionOutput;
		},
		reset: (state) => {
			state.wsStatus = initialState.wsStatus;
			state.selectedLang = initialState.selectedLang;
			state.question = initialState.question;
			state.isEditorLocked = initialState.isEditorLocked;
			state.isCompleted = initialState.isCompleted;
			state.chat = initialState.chat;
			state.executionOutput = initialState.executionOutput;
			state.isExecuting = initialState.isExecuting;
		},
	},
});

export const selectSelectedLanguage = (state: RootState) => state.session.selectedLang;
export const selectIsEditorLocked = (state: RootState) => state.session.isEditorLocked;
export const selectFontSize = (state: RootState) => state.session.fontSize;

export const {
	changeEditorLocked,
	changeIsCompleted,
	changeLanguage,
	changeWSStatus,
	reset,
	setQuestion,
	addMessage,
	changeFontSize,
	setExecution,
} = sessionSlice.actions;

export default sessionSlice.reducer;
