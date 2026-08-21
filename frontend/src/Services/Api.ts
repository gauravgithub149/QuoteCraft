import axios from "axios";

const Api = axios.create({
  baseURL: "https://quotecraft-hlgj.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

Api.interceptors.request.use((config) => {
  const token = localStorage.getItem("qc_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default Api;