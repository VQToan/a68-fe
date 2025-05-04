import { call, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import { PayloadAction } from '@reduxjs/toolkit';
import { loginSuccess, loginFailure } from '../features/authSlice';
import apiClient from '../services/apiClient';

// Types
interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

// Worker saga for login
function* handleLogin(action: PayloadAction<LoginPayload>) {
  try {
    const response = yield call(apiClient.post, '/api/login', action.payload);
    const { token } = response.data as LoginResponse;
    yield put(loginSuccess(token));
  } catch (error) {
    console.error('Login failed', error);
    yield put(loginFailure());
  }
}

// Watcher saga for login
export function* watchLogin() {
  yield takeLatest('auth/loginRequest', handleLogin);
}