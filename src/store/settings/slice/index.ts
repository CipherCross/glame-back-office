import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { INITIAL_SETTINGS_STATE } from 'common/constants/store/settings';
import type { Locale } from 'common/types/AccountSettings';

const settingsSlice = createSlice({
  name: 'settings',
  initialState: INITIAL_SETTINGS_STATE,
  reducers: {
    setLocale: (state, action: PayloadAction<Locale>) => {
      state.locale = action.payload;
    }
  }
});

export const { setLocale } = settingsSlice.actions;
export default settingsSlice.reducer;
