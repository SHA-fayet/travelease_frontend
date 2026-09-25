import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store.js";
import { PersistGate } from "redux-persist/integration/react";
import axios from "axios";

// --- THE ULTIMATE NETWORK INTERCEPTOR ---
const RENDER_URL = "https://travelease-backend-mwq0.onrender.com";

// 1. Force Axios to use Render as its base for all relative requests
axios.defaults.baseURL = RENDER_URL;

// 2. Intercept Axios/XHR requests (Catches hardcoded local URLs inside Axios)
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (typeof url === 'string') {
    if (url.startsWith('/api/')) {
      url = RENDER_URL + url;
    } else if (url.includes('localhost:8000') || url.includes('/undefined/api/')) {
      url = url.replace(/http:\/\/localhost:8000|.*\/undefined\/api\//g, RENDER_URL + (url.includes('/api/') ? '' : '/api/'));
    }
  }
  return originalOpen.call(this, method, url, ...rest);
};

// 3. Intercept Fetch requests (Catches RTK Query and standard fetch)
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (typeof resource === "string") {
    if (resource.startsWith("/api/")) {
      resource = RENDER_URL + resource;
    } else if (resource.includes("localhost:8000") || resource.includes("/undefined/api/")) {
      resource = resource.replace(/http:\/\/localhost:8000|.*\/undefined\/api\//g, RENDER_URL + (resource.includes('/api/') ? '' : '/api/'));
    }
  }
  return originalFetch(resource, config);
};
// ----------------------------------------

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);