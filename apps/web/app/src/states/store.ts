import { configureStore } from "@reduxjs/toolkit";
import workspaceReducer from "./workspace-slice";
import smtpCacheReducer from "./smtp-cache-slice";

export const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    smtpCache: smtpCacheReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
