# a68-fe: Ứng dụng React TypeScript với Redux-saga, Toolkit, MUI, Axios và JWT

## Giới thiệu

Đây là một ứng dụng web frontend được xây dựng bằng React và TypeScript, với các công nghệ hiện đại như Redux-saga, Redux Toolkit, Material UI, Axios, và xác thực JWT. Ứng dụng này được thiết kế theo cấu trúc chuẩn, dễ bảo trì và mở rộng.

## Cấu trúc thư mục

```
src/
  ├── assets/            # Chứa các tài nguyên tĩnh như hình ảnh, font, ...
  ├── components/        # Các component UI có thể tái sử dụng
  ├── containers/        # Các container component kết nối với Redux
  ├── features/          # Các feature slice của Redux Toolkit
  ├── hooks/             # Các custom hooks
  ├── layouts/           # Các layout component
  ├── services/          # Các service cho API calls
  ├── store/             # Cấu hình Redux store, saga
  ├── types/             # Các TypeScript type definitions
  ├── utils/             # Các utility functions
  └── config/            # Các file cấu hình
```

## Công nghệ sử dụng

- **React**: Thư viện JavaScript để xây dựng giao diện người dùng
- **TypeScript**: Ngôn ngữ lập trình mở rộng của JavaScript với kiểu dữ liệu tĩnh
- **Redux & Redux Toolkit**: Quản lý state toàn cục của ứng dụng
- **Redux-saga**: Middleware để xử lý các side effect
- **Material UI**: Thư viện UI component cho React
- **Axios**: Thư viện để thực hiện các HTTP request
- **JWT Authentication**: Xác thực người dùng bằng JSON Web Token

## Cài đặt và chạy

### Yêu cầu

- Node.js (phiên bản 14.x trở lên)
- npm (phiên bản 6.x trở lên)

### Các bước cài đặt

1. Clone repository:
   ```bash
   git clone https://github.com/your-username/a68-fe.git
   cd a68-fe
   ```

2. Cài đặt các dependencies:
   ```bash
   npm install
   ```

3. Chạy ứng dụng ở môi trường development:
   ```bash
   npm start
   ```

## Tính năng chính

### 1. Xác thực JWT

Ứng dụng sử dụng JWT (JSON Web Token) để xác thực người dùng. Quá trình xác thực được quản lý bởi Redux và Redux-saga.

#### Flow xác thực:

1. Người dùng nhập thông tin đăng nhập (username và password)
2. Request được gửi đến server thông qua Axios
3. Nếu thông tin đúng, server trả về một JWT token
4. Token được lưu trong localStorage và Redux store
5. Các request tiếp theo sẽ tự động đính kèm token trong header

### 2. Quản lý state với Redux Toolkit và Redux-saga

#### Redux Toolkit

Redux Toolkit được sử dụng để đơn giản hóa việc viết mã Redux. Các state được tổ chức thành các "slice" riêng biệt.

Ví dụ về auth slice:
```typescript
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state, action) => {
      // Trigger for saga
    },
    loginSuccess: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    loginFailure: (state) => {
      state.token = null;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});
```

#### Redux-saga

Redux-saga xử lý các side effect như API calls. Các saga được tổ chức theo tính năng.

Ví dụ về auth saga:
```typescript
function* handleLogin(action) {
  try {
    const response = yield call(apiClient.post, '/api/login', action.payload);
    const { token } = response.data;
    yield put(loginSuccess(token));
  } catch (error) {
    yield put(loginFailure());
  }
}

export function* watchLogin() {
  yield takeLatest('auth/loginRequest', handleLogin);
}
```

### 3. UI với Material UI

Ứng dụng sử dụng Material UI để xây dựng giao diện người dùng đẹp và đáp ứng.

Ví dụ về một component:
```typescript
<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
  <Paper elevation={3} sx={{ p: 4, width: 300 }}>
    <Typography variant="h5" component="h1" gutterBottom align="center">
      Đăng nhập
    </Typography>
    {/* Form fields */}
  </Paper>
</Box>
```

### 4. Routing và Protected Routes

Ứng dụng sử dụng React Router DOM để quản lý routing. Các route được bảo vệ bằng cách kiểm tra trạng thái xác thực.

```typescript
<Routes>
  <Route path="/login" element={<LoginForm />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
  </Route>
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
</Routes>
```

## Hướng dẫn mở rộng

### 1. Thêm một API endpoint mới

1. Trong thư mục `services`, tạo một service mới hoặc mở rộng service hiện có:
   ```typescript
   // src/services/userService.ts
   import apiClient from './apiClient';

   export const getUserProfile = () => {
     return apiClient.get('/api/profile');
   };
   ```

2. Tạo một slice mới trong thư mục `features`:
   ```typescript
   // src/features/userSlice.ts
   import { createSlice } from '@reduxjs/toolkit';

   const userSlice = createSlice({
     name: 'user',
     initialState: {
       profile: null,
       loading: false,
       error: null,
     },
     reducers: {
       fetchProfileRequest: (state) => {
         state.loading = true;
       },
       fetchProfileSuccess: (state, action) => {
         state.profile = action.payload;
         state.loading = false;
         state.error = null;
       },
       fetchProfileFailure: (state, action) => {
         state.loading = false;
         state.error = action.payload;
       },
     },
   });
   ```

3. Tạo một saga mới trong thư mục `store`:
   ```typescript
   // src/store/userSaga.ts
   import { call, put, takeLatest } from 'redux-saga/effects';
   import { getUserProfile } from '../services/userService';
   import { fetchProfileSuccess, fetchProfileFailure } from '../features/userSlice';

   function* handleFetchProfile() {
     try {
       const response = yield call(getUserProfile);
       yield put(fetchProfileSuccess(response.data));
     } catch (error) {
       yield put(fetchProfileFailure(error.message));
     }
   }

   export function* watchFetchProfile() {
     yield takeLatest('user/fetchProfileRequest', handleFetchProfile);
   }
   ```

4. Thêm saga mới vào rootSaga:
   ```typescript
   // src/store/rootSaga.ts
   import { all } from 'redux-saga/effects';
   import { watchLogin } from './authSaga';
   import { watchFetchProfile } from './userSaga';

   export default function* rootSaga() {
     yield all([
       watchLogin(),
       watchFetchProfile(),
     ]);
   }
   ```

5. Thêm reducer mới vào Redux store:
   ```typescript
   // src/store/index.ts
   import userReducer from '../features/userSlice';

   const store = configureStore({
     reducer: {
       auth: authReducer,
       user: userReducer,
     },
     // ...
   });
   ```

### 2. Thêm một trang mới

1. Tạo component cho trang mới trong thư mục `components` hoặc `containers`:
   ```typescript
   // src/containers/ProfilePage.tsx
   import React, { useEffect } from 'react';
   import { useDispatch, useSelector } from 'react-redux';
   import { fetchProfileRequest } from '../features/userSlice';
   import { RootState } from '../store';

   const ProfilePage = () => {
     const dispatch = useDispatch();
     const { profile, loading, error } = useSelector((state: RootState) => state.user);

     useEffect(() => {
       dispatch(fetchProfileRequest());
     }, [dispatch]);

     if (loading) return <div>Loading...</div>;
     if (error) return <div>Error: {error}</div>;
     if (!profile) return <div>No profile data</div>;

     return (
       <div>
         <h1>Hồ sơ người dùng</h1>
         <p>Tên: {profile.name}</p>
         <p>Email: {profile.email}</p>
       </div>
     );
   };

   export default ProfilePage;
   ```

2. Thêm route mới vào `App.tsx`:
   ```typescript
   <Route element={<ProtectedRoute />}>
     <Route path="/dashboard" element={<Dashboard />} />
     <Route path="/profile" element={<ProfilePage />} />
   </Route>
   ```

## Thực hành tốt

1. **Sử dụng TypeScript**: Luôn định nghĩa kiểu dữ liệu cho props, state, và các biến khác.
2. **Component nhỏ và tái sử dụng**: Tách UI thành các component nhỏ, có thể tái sử dụng.
3. **Custom hooks**: Tách logic phức tạp thành các custom hooks.
4. **Xử lý lỗi**: Luôn xử lý lỗi từ API và hiển thị thông báo phù hợp.
5. **Tối ưu hóa**: Sử dụng React.memo, useMemo, và useCallback khi cần thiết.

## Kết luận

Đây là ứng dụng React TypeScript với đầy đủ tính năng hiện đại như Redux-saga, Redux Toolkit, Material UI, Axios, và xác thực JWT. Ứng dụng được thiết kế theo cấu trúc chuẩn, dễ bảo trì và mở rộng. Các hướng dẫn và ví dụ trên sẽ giúp bạn hiểu rõ cách hoạt động của ứng dụng và cách thêm các tính năng mới.
