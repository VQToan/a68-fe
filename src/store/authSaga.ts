import { call, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import { loginSuccess } from '../features/authSlice';

// Worker saga for login
function* handleLogin(action: { payload: { username: string; password: string } }) {
  try {
    const response = yield call(axios.post, '/api/login', action.payload);
    const token = response.data.token;
    yield put(loginSuccess(token));
  } catch (error) {
    console.error('Login failed', error);
  }
}

// Watcher saga for login
export function* watchLogin() {
  yield takeLatest('auth/loginRequest', handleLogin);
}