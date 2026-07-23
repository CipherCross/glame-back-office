import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from 'store/api';
import type { RootState } from 'store/index';
import type { BackOfficeSession } from 'common/types/AccountSettings';
import { errorMessage, toBackOfficeSession } from 'utils/app';

type RequestStage = 'idle' | 'pending' | 'succeeded' | 'failed';

interface AuthState {
  session: BackOfficeSession | null;
  stage: RequestStage;
  error: string | null;
}

const initialState: AuthState = {
  session: null,
  stage: 'idle',
  error: null
};

export const signIn = createAsyncThunk<BackOfficeSession, { email: string; password: string }, { rejectValue: string }>(
  'auth/signIn',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const response = await dispatch(api.endpoints.login.initiate({ email, password })).unwrap();
      return toBackOfficeSession(response, email);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Could not sign in.'));
    }
  }
);

export const restoreSession = createAsyncThunk<BackOfficeSession | null, void, { state: RootState; rejectValue: string }>(
  'auth/restoreSession',
  async (_, { dispatch, getState, rejectWithValue }) => {
    const session = getState().auth.session;
    if (!session?.refreshToken) return null;
    try {
      const response = await dispatch(api.endpoints.refreshSession.initiate({ refreshToken: session.refreshToken })).unwrap();
      return toBackOfficeSession(response, session.email);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Could not restore the session.'));
    }
  }
);

export const refreshSession = createAsyncThunk<BackOfficeSession, void, { state: RootState; rejectValue: string }>(
  'auth/refreshSession',
  async (_, { dispatch, getState, rejectWithValue }) => {
    const session = getState().auth.session;
    if (!session?.refreshToken) return rejectWithValue('There is no active session.');
    try {
      const response = await dispatch(api.endpoints.refreshSession.initiate({ refreshToken: session.refreshToken })).unwrap();
      return toBackOfficeSession(response, session.email);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Could not refresh the session.'));
    }
  }
);

export const signOutRemote = createAsyncThunk<void, { accessToken: string }>('auth/signOutRemote', async ({ accessToken }, { dispatch }) => {
  await dispatch(api.endpoints.logout.initiate({ accessToken })).unwrap();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
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
