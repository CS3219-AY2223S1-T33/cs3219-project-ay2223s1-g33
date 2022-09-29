import { configureStore } from "@reduxjs/toolkit";
// eslint-disable-next-line
import userReducer from "../feature/user/userSlice";
import matchingReducer from "../feature/matching/matchingSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    matching: matchingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
