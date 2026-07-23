import { createAsyncThunk } from '@reduxjs/toolkit';
import type { SignInRequest } from 'common/interfaces/store/auth';
import { api } from 'store/api';
import type { RootState } from 'store/index';
import type { BackOfficeSession } from 'common/types/AccountSettings';
import { errorMessage, toBackOfficeSession } from 'utils/app';

export const signIn = createAsyncThunk<BackOfficeSession, SignInRequest, { rejectValue: string }>(
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
