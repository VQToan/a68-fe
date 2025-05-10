# A68 Trading Platform - Frontend Development Guide

## Thông tin Project
- React + TypeScript + Vite
- Redux Toolkit (state management)
- React Router (routing)
- Material-UI (UI components)
- Axios (API calls)

## Cấu trúc thư mục chính
- src/assets: Hình ảnh, styles
- src/components: Reusable components
- src/context: Context providers
- src/features: Redux store & slices
- src/hooks: Custom hooks
- src/layouts: Layout components
- src/pages: App pages
- src/routes: Routing config
- src/services: API services
- src/theme: MUI theme config
- src/types: TypeScript types
- src/utils: Utility functions

## Thêm API mới
1. Tạo service trong `src/services`:
```typescript
// example.service.ts
import { apiClient } from './apiClient';

export interface ExampleData {
  id: string;
  name: string;
}

export const getAll = () => apiClient.get('/examples');
export const getById = (id: string) => apiClient.get(`/examples/${id}`);
export const create = (data: Omit<ExampleData, 'id'>) => apiClient.post('/examples', data);
export const update = (id: string, data: Partial<ExampleData>) => apiClient.put(`/examples/${id}`, data);
export const remove = (id: string) => apiClient.delete(`/examples/${id}`);
```

2. Tạo Redux slice trong `src/features`:
```typescript
// features/example/exampleSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as exampleService from '@services/example.service';

// Định nghĩa state, thunks, reducers
// Thêm slice vào store.ts
```

3. Tạo custom hook:
```typescript
// hooks/useExample.ts
import { useAppDispatch, useAppSelector } from './reduxHooks';
import { fetchAll, create, update, remove } from '@features/example/exampleSlice';

export const useExample = () => {
  const dispatch = useAppDispatch();
  // Select data từ state, định nghĩa các functions
  return { /* data và functions */ };
};
```

## Thêm Tab mới
1. Tạo component trong `src/pages/NewFeature/`
2. Thêm route trong `src/routes/index.tsx`:
```typescript
// Thêm import
import NewFeature from "@pages/NewFeature";

// Thêm route
{
  path: "new-feature",
  element: <NewFeature />,
},
```
3. Thêm menu item trong Navbar.tsx

## Rule Code - Performance Optimization

### 1. Sử dụng memo
```typescript
import { memo } from 'react';
import { areEqual } from "@/utils/common";

// Cách 1: Sử dụng memo
export default memo(Component);

// Cách 2: Sử dụng memo với hàm so sánh tùy chỉnh
export default memo(Component, areEqual);
```

### 2. useMemo - Tối ưu tính toán
```typescript
const filteredItems = useMemo(() => {
  return items.filter(item => item.name.includes(filter));
}, [items, filter]);
```

### 3. useCallback - Tối ưu function
```typescript
const handleSubmit = useCallback((data) => {
  onSubmit(data);
}, [onSubmit]);
```

### 4. useSelector thông minh
```typescript
// Tốt: Chỉ lấy data cần thiết
const count = useSelector(state => state.counter.value);

// Không tốt: Có thể gây re-render không cần thiết
const entireState = useSelector(state => state.counter);
```

### 5. Tránh inline functions và objects
```typescript
// Không tốt
<Button onClick={() => handleClick(id)}>

// Tốt
const handleButtonClick = useCallback(() => handleClick(id), [id, handleClick]);
<Button onClick={handleButtonClick}>
```

### 6. Luôn đặt dependencies đúng
- Đảm bảo đặt đầy đủ dependencies cho useEffect, useMemo, useCallback
- Sử dụng ESLint rules để kiểm tra dependencies

### 7. Sử dụng React.lazy cho code splitting
```typescript
const LazyComponent = lazy(() => import('./LazyComponent'));
```

