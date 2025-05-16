import { takeLatest, put, call } from 'redux-saga/effects';
import {
  login,
  loginSuccess,
  loginFailure,
  logout,
  logoutSuccess,
  logoutFailure,
} from '../slices/authSlice';

// Example login service (replace with your actual auth service, e.g., Firebase)
const loginService = async (email: string, password: string) => {
  // Simulate an API call (replace with actual Firebase/auth logic)
  return {
    id: 'example',
    email,
    displayName: email.split('@')[0],
    createdAt: Date.now(),
    lastLogin: Date.now(),
  };
};

// Example logout service (replace with your actual auth service, e.g., Firebase)
const logoutService = async () => {
  // Simulate logout (replace with actual Firebase/auth logic)
  return true;
};

function* handleLogin(action: ReturnType<typeof login>) {
  try {
    if (!action.payload) {
      throw new Error('Login payload is undefined');
    }
    const { email, password } = action.payload;
    const user = yield call(loginService, email, password);
    yield put(loginSuccess(user));
  } catch (error: any) {
    yield put(loginFailure(error.message || 'Login failed'));
  }
}

function* handleLogout() {
  try {
    yield call(logoutService);
    yield put(logoutSuccess());
  } catch (error: any) {
    yield put(logoutFailure(error.message || 'Logout failed'));
  }
}

export function* watchAuth() {
  // Log the action creators to debug
  console.log('watchAuth: login action creator:', login);
  console.log('watchAuth: logout action creator:', logout);

  // Ensure actions are defined
  if (!login || !logout) {
    throw new Error('Auth action creators are undefined');
  }

  yield takeLatest(login.type, handleLogin);
  yield takeLatest(logout.type, handleLogout);
}

export default function* authSaga() {
  yield watchAuth();
}
