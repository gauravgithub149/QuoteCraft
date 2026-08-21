import axios from "axios";
import {
  startGlobalLoading,
  stopGlobalLoading,
} from "../Utils/loadingManager";

const Api = axios.create({
  baseURL: "https://quotecraft-hlgj.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ==============================
// Request Interceptor
// ==============================

Api.interceptors.request.use(
  (config) => {
    startGlobalLoading();

    const token = localStorage.getItem("qc_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    stopGlobalLoading();

    return Promise.reject(error);
  },
);

// ==============================
// Response Interceptor
// ==============================

Api.interceptors.response.use(
  (response) => {
    stopGlobalLoading();

    return response;
  },
  (error) => {
    stopGlobalLoading();

    return Promise.reject(error);
  },
);

export default Api;