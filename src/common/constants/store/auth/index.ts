import type { AuthState } from 'common/interfaces/store/auth';

export const INITIAL_AUTH_STATE: AuthState = {
  session: null,
  stage: 'idle',
  error: null
};
