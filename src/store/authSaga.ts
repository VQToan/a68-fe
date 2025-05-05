import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { login } from '@features/authSlice';
import apiClient from '@services/apiClient';

// Types
interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

// Worker saga for login
function* handleLogin(action: PayloadAction<LoginPayload>): Generator<any, void, AxiosResponse<LoginResponse>> {
  try {
    const response = yield call(apiClient.post, '/auth/token/', action.payload);
    yield put(login.fulfilled(response.data, '', action.payload));
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || 'Đăng nhập thất bại';
    yield put(login.rejected(null, '', action.payload, errorMessage));
  }
}

// Watcher saga for login
export function* watchLogin(): Generator<any, void, void> {
  yield takeLatest(login.pending.type, handleLogin);
}