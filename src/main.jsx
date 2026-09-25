import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store.js";
import { PersistGate } from "redux-persist/integration/react";

// --- GLOBAL NETWORK INTERCEPTOR ---
// This forces every single network request to point to your live backend
const RENDER_URL = "https://travelease-backend-mwq0.onrender.com";

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;

  if (typeof resource === "string") {
    if (resource.startsWith("/api/")) {
      resource = RENDER_URL + resource;
    } else if (resource.includes("localhost:8000")) {
      resource = resource.replace(/http:\/\/localhost:8000/g, RENDER_URL);
    } else if (resource.includes("/undefined/api/")) {
      resource = resource.replace(/.*\/undefined\/api\//g, RENDER_URL + "/api/");
    } else if (resource.includes("vercel.app/api/")) {
      resource = resource.replace(/https:\/\/[^\/]+\/api\//g, RENDER_URL + "/api/");
    }
  }

  return originalFetch(resource, config);
};
// ----------------------------------

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);