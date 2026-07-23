import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { INITIAL_AUTH_STATE } from 'common/constants/store/auth';
import type { BackOfficeSession } from 'common/types/AccountSettings';
import { refreshSession, restoreSession, signIn } from 'store/auth/thunks';

const authSlice = createSlice({
  name: 'auth',
  initialState: INITIAL_AUTH_STATE,
  reducers: {
    clearSession: (state) => {
      state.session = null;
      state.error = null;
      state.stage = 'idle';
    },
    updateSession: (state, action: PayloadAction<Partial<Pick<BackOfficeSession, 'name' | 'email'>>>) => {
      if (state.session) Object.assign(state.session, action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.stage = 'pending';
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.stage = 'succeeded';
        state.session = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.stage = 'failed';
        state.error = action.payload ?? 'Could not sign in.';
      })
      .addCase(restoreSession.pending, (state) => {
        state.stage = 'pending';
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.stage = 'succeeded';
        state.session = action.payload;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.stage = 'failed';
        state.session = null;
        state.error = action.payload ?? 'Could not restore the session.';
      })
      .addCase(refreshSession.pending, (state) => {
        state.stage = 'pending';
        state.error = null;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.stage = 'succeeded';
        state.session = action.payload;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.stage = 'failed';
        state.session = null;
      });
  }
});

export const { clearSession, updateSession } = authSlice.actions;
export default authSlice.reducer;
