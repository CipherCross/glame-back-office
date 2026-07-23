import type { BackOfficeSession } from 'common/types/AccountSettings';
import type { RequestStage } from 'common/types/store/auth';

export interface AuthState {
  session: BackOfficeSession | null;
  stage: RequestStage;
  error: string | null;
}

export interface SignInRequest {
  email: string;
  password: string;
}
