import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Locale } from 'common/types/AccountSettings';

interface SettingsState {
  locale: Locale;
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: { locale: 'fr' } as SettingsState,
  reducers: {
    setLocale: (state, action: PayloadAction<Locale>) => {
      state.locale = action.payload;
    }
  }
});

export const { setLocale } = settingsSlice.actions;
export default settingsSlice.reducer;
