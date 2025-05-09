# React TypeScript Application with JWT Authentication

A modern React application built with TypeScript, Material-UI, Redux, Axios with JWT authentication including refresh token functionality.

## Features

- React 18 with TypeScript
- Material-UI (MUI) for a polished UI
- Built with Vite for fast development and optimized production builds
- Redux with Redux Toolkit for state management
- JWT authentication with refresh token mechanism
- Axios for API requests with automatic token refresh
- Protected routes with authentication guards
- Responsive design with Material-UI

## Project Structure

```
src/
  ├── assets/           # Static assets like images, styles
  ├── components/       # Reusable UI components
  ├── features/         # Redux slices and store configuration
  ├── hooks/            # Custom React hooks
  ├── layouts/          # Page layout components
  ├── pages/            # Main page components
  ├── routes/           # Routing configuration
  ├── services/         # API services
  ├── types/            # TypeScript type definitions
  └── utils/            # Utility functions
```

## Authentication Flow

This application implements JWT authentication with refresh token functionality:

1. User logs in with username and password
2. Backend returns access token and refresh token
3. Access token is used for API requests
4. When access token expires, refresh token is used to get a new access token
5. If refresh token expires, user is logged out and redirected to login page

The tokens are stored in localStorage and automatically managed by the authentication service.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd <project-folder>
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Build for production
```bash
npm run build
# or
yarn build
```

## API Configuration

The application is configured to connect to an API at `https://api.example.com`. You need to update this URL in `src/services/auth.service.ts` to point to your actual API endpoint.

```typescript
// Change this to your API URL
const API_URL = 'https://api.example.com';
```

## Environment Variables

Create a `.env` file in the root directory to configure environment variables:

```
VITE_API_URL=https://api.example.com
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
