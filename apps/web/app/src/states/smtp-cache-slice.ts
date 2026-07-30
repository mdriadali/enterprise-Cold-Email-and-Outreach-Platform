import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SmtpAccountInfo } from "../actions/workspace/get-smtp-account";


export type SmtpCacheState = Record<string, SmtpAccountInfo>;

const initialState: SmtpCacheState = {};

const smtpCacheSlice = createSlice({
  name: "smtpCache",
  initialState,
  reducers: {
    cacheSmtpAccount(state, action: PayloadAction<SmtpAccountInfo>) {
      state[action.payload.id] = action.payload;
    },
  },
});

export const { cacheSmtpAccount } = smtpCacheSlice.actions;
export default smtpCacheSlice.reducer;
