import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@features/store";
import { NotificationProvider } from "@context/NotificationContext";
import {
  queryClient,
  QueryClientProvider,
  ReactQueryDevtools,
} from "@config/queryClient";
import App from "./App.tsx";
import "./i18n";
import "./index.css";
import "@config/cognitoConfig"; // Initialize AWS Cognito

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <App />
        </NotificationProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
