import { all } from 'redux-saga/effects';
import { watchLogin } from './authSaga';

// Root saga
export default function* rootSaga() {
  yield all([
    watchLogin(),
  ]);
}