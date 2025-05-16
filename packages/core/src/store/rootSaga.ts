import { all, fork } from 'redux-saga/effects';
import { watchVenues } from './sagas/venuesSaga';
import { watchLocation } from './sagas/locationSaga';
import { watchAuth } from './sagas/authSaga';
import { watchBucketList } from './sagas/bucketListSaga';

// Root saga
export function* rootSaga() {
  yield all([fork(watchAuth), fork(watchBucketList), fork(watchLocation), fork(watchVenues)]);
}
